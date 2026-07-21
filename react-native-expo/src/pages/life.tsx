import { styles } from './life.styles';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { api, type ApiItem } from '@/lib/api';

type Tab = { key: string; id: number; name: string; source: 'music' | 'video' | 'article' };

const fallbackTabs: Tab[] = [
  { key: 'music', id: 1, name: '音乐', source: 'music' },
  { key: 'video', id: 2, name: '视频', source: 'video' },
  { key: 'travel', id: 5, name: '旅行', source: 'article' },
  { key: 'ana', id: 6, name: '随笔', source: 'article' },
];

const thumbnail = (value: unknown) => typeof value === 'string'
  ? `${value}${value.includes('?') ? '&' : '?'}imageMogr2/thumbnail/120x`
  : undefined;

export default function LifeScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [categories, setCategories] = useState<ApiItem[]>([]);
  const [active, setActive] = useState(tab ?? 'music');
  const [subType, setSubType] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<ApiItem[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);

  const tabs = useMemo(() => {
    if (!categories.length) return fallbackTabs;
    return fallbackTabs.filter(item => categories.some(category =>
      (item.key === 'music' && Number(category.categoryId) === 3)
      || (item.key === 'video' && Number(category.categoryId) === 4)
      || (item.source === 'article' && Number(category.categoryId) === 1 && Number(category.typeId) === item.id),
    )).map(item => {
      const match = categories.find(category =>
        (item.key === 'music' && Number(category.categoryId) === 3)
        || (item.key === 'video' && Number(category.categoryId) === 4)
        || (item.source === 'article' && Number(category.categoryId) === 1 && Number(category.typeId) === item.id),
      );
      return { ...item, name: String(match?.[item.source === 'article' ? 'typeName' : 'categoryName'] ?? item.name) };
    });
  }, [categories]);
  const current = tabs.find(item => item.key === active) ?? tabs[0];
  const subtypeOptions = useMemo(() => current?.source === 'article'
    ? categories.filter(item => Number(item.categoryId) === 1 && Number(item.typeId) === current.id && item.subTypeId)
      .map(item => ({ value: String(item.subTypeId), name: String(item.subTypeName ?? '') }))
    : [], [categories, current]);

  useEffect(() => { api.categories().then(value => setCategories(value ?? [])).catch(() => undefined); }, []);
  useEffect(() => { if (tabs.length && !tabs.some(item => item.key === active)) setActive(tabs[0].key); }, [active, tabs]);
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      const params = { type: current.source === 'article' ? current.id : undefined, subType: subType ?? undefined, keyword, pageNum: 0, pageSize: 15 };
      const request = current.source === 'music' ? api.musicPage(params) : current.source === 'video' ? api.videoPage(params) : api.articlePage(params);
      request.then(value => { const next = value.content ?? []; setItems(next); setPageNum(0); setIsLast(next.length < 15); })
        .catch(() => { setItems([]); setIsLast(true); });
    }, 150);
    return () => clearTimeout(timer);
  }, [current?.id, current?.key, current?.source, keyword, subType]);

  const selectTab = (key: string) => { setActive(key); setSubType(null); setKeyword(''); };
  const loadMore = () => {
    if (!current || isLast) return;
    const nextPage = pageNum + 1;
    const params = { type: current.source === 'article' ? current.id : undefined, subType: subType ?? undefined, keyword, pageNum: nextPage, pageSize: 15 };
    const request = current.source === 'music' ? api.musicPage(params) : current.source === 'video' ? api.videoPage(params) : api.articlePage(params);
    request.then(value => { const next = value.content ?? []; setItems(previous => [...previous, ...next]); setPageNum(nextPage); setIsLast(next.length < 15); }).catch(() => setIsLast(true));
  };
  const openItem = (item: ApiItem) => {
    const path = current?.source === 'music' ? `/music/play?id=${item.id}` : current?.source === 'video' ? `/video/play?id=${item.id}` : `/article/detail?id=${item.id}`;
    router.push(path as never);
  };

  return <View style={styles.page}>
    {tabs.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
      {tabs.map(item => <Pressable key={item.key} onPress={() => selectTab(item.key)} style={styles.tab}><Text style={[styles.tabText, active === item.key && styles.tabTextActive]}>{item.name}</Text>{active === item.key && <View style={styles.underline} />}</Pressable>)}
    </ScrollView>}
    <View style={styles.searchArea}>
      {subtypeOptions.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subtypes}>{subtypeOptions.map(option => <Pressable key={option.value} onPress={() => setSubType(subType === option.value ? null : option.value)}><Text style={[styles.subtype, subType === option.value && styles.subtypeActive]}>{option.name}</Text></Pressable>)}</ScrollView>}
      <TextInput value={keyword} onChangeText={setKeyword} placeholder="请输入搜索词" placeholderTextColor="#b3b3b3" style={styles.search} />
    </View>
    <ScrollView contentContainerStyle={styles.list}>
      {items.map(item => <Pressable key={String(item.id)} onPress={() => openItem(item)} style={styles.item}>
        <Image source={{ uri: thumbnail(item.thumb ?? item.cover ?? item.image) }} style={styles.image} />
        <View style={styles.itemContent}><Text numberOfLines={1} style={[styles.title, item.className === 'active' && styles.activeText]}>{String(item.title ?? item.name ?? '')}</Text><Text numberOfLines={2} style={[styles.note, item.className === 'active' && styles.activeText]}>{String(item.note ?? item.description ?? '')}</Text>{item.badgeText ? <Text style={styles.badge}>{String(item.badgeText)}</Text> : null}</View>
      </Pressable>)}
      {!items.length && <Text style={styles.empty}>~什么都没有哦~</Text>}
      {items.length > 0 && <Pressable onPress={loadMore}><Text style={styles.empty}>{isLast ? '~没有更多了哦~' : '加载更多'}</Text></Pressable>}
    </ScrollView>
    <AppFooter active="life" />
  </View>;
}
