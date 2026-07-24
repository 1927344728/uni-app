import { styles } from './study.styles';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { AppRefreshControl } from '@/components/AppRefreshControl';
import { TabSwipeContainer } from '@/components/TabSwipeContainer';
import { useScrollToLower } from '@/common/hooks/useScrollToLower';
import { SearchBar } from '@/components/SearchBar';
import { api, type ApiItem } from '@/lib/api';
import { mergeUniqueById, uniqueValueOptions } from '@/common/utils/categoryTabs';

type Tab = { key: string; id: number; name: string; isBook?: boolean };
const defaults: Tab[] = [{ key: 'course', id: 1, name: '课程' }, { key: 'read', id: 3, name: '阅读' }, { key: 'culture', id: 4, name: '文化' }, { key: 'book', id: 8, name: '书籍', isBook: true }];
const imageUri = (value: unknown) => typeof value === 'string' ? `${value}${value.includes('?') ? '&' : '?'}imageMogr2/thumbnail/120x` : undefined;

export default function StudyScreen() {
  const { tab: initialTab } = useLocalSearchParams<{ tab?: string }>();
  const [categories, setCategories] = useState<ApiItem[]>([]);
  const [active, setActive] = useState(initialTab ?? 'read');
  const [subType, setSubType] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<ApiItem[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = useMemo(() => {
    if (!categories.length) return defaults;
    return defaults.filter(tab => categories.some(item => tab.isBook ? Number(item.categoryId) === 2 : Number(item.categoryId) === 1 && Number(item.typeId) === tab.id))
      .map(tab => ({ ...tab, name: String(categories.find(item => tab.isBook ? Number(item.categoryId) === 2 : Number(item.categoryId) === 1 && Number(item.typeId) === tab.id)?.[tab.isBook ? 'categoryName' : 'typeName'] ?? tab.name) }));
  }, [categories]);
  const current = tabs.find(tab => tab.key === active) ?? tabs[0];
  const subtypeOptions = useMemo(() => uniqueValueOptions(
    categories
      .filter(item => current?.isBook ? Number(item.categoryId) === 2 : Number(item.categoryId) === 1 && Number(item.typeId) === current?.id)
      .map(item => ({ value: String(current?.isBook ? item.typeId : item.subTypeId), name: String(current?.isBook ? item.typeName : item.subTypeName) })),
  ), [categories, current]);

  useEffect(() => { api.categories().then(value => setCategories(value ?? [])).catch(() => undefined); }, []);
  useEffect(() => { if (tabs.length && !tabs.some(tab => tab.key === active)) setActive(tabs[0].key); }, [tabs, active]);
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      const params = current.isBook ? { type: subType ?? undefined, keyword, pageNum: 0, pageSize: 15 } : { type: current.id, subType: subType ?? undefined, keyword, pageNum: 0, pageSize: 15 };
      const request = current.isBook ? api.bookPage(params) : api.articlePage(params);
      request.then(value => { const next = value.content ?? []; setItems(next); setPageNum(0); setIsLast(next.length < 15); }).catch(() => { setItems([]); setIsLast(true); });
    }, 150);
    return () => clearTimeout(timer);
  }, [current?.key, current?.id, current?.isBook, subType, keyword]);

  const selectTab = (key: string) => { setActive(key); setSubType(null); setKeyword(''); };
  const loadMore = () => {
    if (!current || isLast) return;
    const nextPage = pageNum + 1;
    const params = current.isBook ? { type: subType ?? undefined, keyword, pageNum: nextPage, pageSize: 15 } : { type: current.id, subType: subType ?? undefined, keyword, pageNum: nextPage, pageSize: 15 };
    (current.isBook ? api.bookPage(params) : api.articlePage(params)).then(value => { const next = value.content ?? []; setItems(old => mergeUniqueById(old, next, true)); setPageNum(nextPage); setIsLast(next.length < 15); }).catch(() => setIsLast(true));
  };
  const refreshList = () => {
    if (!current) return Promise.resolve();
    setRefreshing(true);
    const params = current.isBook ? { type: subType ?? undefined, keyword, pageNum: 0, pageSize: 15 } : { type: current.id, subType: subType ?? undefined, keyword, pageNum: 0, pageSize: 15 };
    const request = current.isBook ? api.bookPage(params) : api.articlePage(params);
    return request.then(value => { const next = value.content ?? []; setItems(next); setPageNum(0); setIsLast(next.length < 15); })
      .catch(() => { setItems([]); setIsLast(true); })
      .finally(() => setRefreshing(false));
  };

  const onScrollToLower = useScrollToLower(loadMore, !isLast);
  const tabKeys = useMemo(() => tabs.map(tab => tab.key), [tabs]);

  return (
    <View style={[styles.page, current?.isBook && styles.bookPage]}>
      <View style={styles.header}>
        {tabs.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
            {tabs.map(tab => (
              <Pressable key={tab.key} onPress={() => selectTab(tab.key)} style={styles.tab}>
                <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>{tab.name}</Text>
                {active === tab.key && <View style={styles.underline} />}
              </Pressable>
            ))}
          </ScrollView>
        )}
        {subtypeOptions.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subtypesRow} contentContainerStyle={styles.subtypes}>
            <Pressable onPress={() => setSubType(null)}>
              <Text style={[styles.subtype, !subType && styles.subtypeActive]}>全部</Text>
            </Pressable>
            {subtypeOptions.map(option => (
              <Pressable key={option.value} onPress={() => setSubType(option.value)}>
                <Text style={[styles.subtype, subType === option.value && styles.subtypeActive]}>{option.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={styles.searchRow}>
          <SearchBar value={keyword} onChangeText={setKeyword} placeholder="请输入搜索词" />
        </View>
      </View>
      <TabSwipeContainer tabKeys={tabKeys} activeKey={active} onChange={selectTab}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={() => void refreshList()} />}
          onScroll={onScrollToLower}
          scrollEventThrottle={16}
        >
          {items.map(item => (
            <Pressable
              key={String(item.id)}
              onPress={() => router.push(current?.isBook ? `/book/detail?id=${item.id}` : `/article/detail?id=${item.id}`)}
              style={styles.item}
            >
              <Image source={{ uri: imageUri(item.thumb ?? item.cover) }} style={styles.imageBox} />
              <View style={styles.itemContent}>
                <Text numberOfLines={1} style={[styles.title, item.className === 'active' && styles.activeText]}>
                  {String(item.title ?? '')}
                </Text>
                <Text numberOfLines={2} style={[styles.note, item.className === 'active' && styles.activeText]}>
                  {String(item.note ?? item.description ?? '')}
                </Text>
                {item.badgeText ? <Text style={styles.badge}>{String(item.badgeText)}</Text> : null}
              </View>
            </Pressable>
          ))}
          {!items.length && <Text style={styles.empty}>~什么都没有哦~</Text>}
          {items.length > 0 && (
            <Text style={styles.empty}>{isLast ? '~没有更多了哦~' : '加载中...'}</Text>
          )}
        </ScrollView>
      </TabSwipeContainer>
      <AppFooter active="study" />
    </View>
  );
}
