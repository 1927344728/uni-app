import { styles } from './article.styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppRefreshControl } from '@/components/AppRefreshControl';
import { SearchBar } from '@/components/SearchBar';
import { scaleCosImage } from '@/common/utils/cos';
import { openUrl } from '@/common/utils/openUrl';
import { mergeUniqueById } from '@/common/utils/categoryTabs';
import { api, type ApiItem } from '@/lib/api';

function paramToString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function thumbUri(value: unknown) {
  const uri = scaleCosImage(value, 120);
  if (!uri) return undefined;
  try {
    const url = new URL(uri);
    url.pathname = url.pathname
      .split('/')
      .map((segment) => {
        if (!segment) return segment;
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join('/');
    return url.toString();
  } catch {
    return uri;
  }
}

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ type?: string | string[] }>();
  const [items, setItems] = useState<ApiItem[]>([]);
  const [categories, setCategories] = useState<ApiItem[]>([]);
  const [type, setType] = useState<string | undefined>(paramToString(params.type));
  const [keyword, setKeyword] = useState('');
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadingMore = useRef(false);

  const options = useMemo(
    () => categories
      .filter(item => Number(item.categoryId) === 1)
      .filter((item, index, all) => all.findIndex(value => value.typeId === item.typeId) === index),
    [categories],
  );

  useEffect(() => {
    api.categories().then(value => setCategories(Array.isArray(value) ? value : [])).catch(() => setCategories([]));
  }, []);

  const load = useCallback((page: number, append = false) => {
    return api.articlePage({ type, keyword, pageNum: page, pageSize: 15 }).then(value => {
      const next = Array.isArray(value?.content) ? value.content.filter(Boolean) : [];
      setItems(current => mergeUniqueById(current, next, append));
      setPageNum(page);
      setIsLast(next.length < 15);
    }).catch(() => {
      if (!append) setItems([]);
      setIsLast(true);
    });
  }, [type, keyword]);

  useEffect(() => {
    const timer = setTimeout(() => { void load(0); }, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load(0).finally(() => setRefreshing(false));
  }, [load]);

  const loadMore = useCallback(() => {
    if (isLast || loadingMore.current) return;
    loadingMore.current = true;
    void load(pageNum + 1, true).finally(() => {
      loadingMore.current = false;
    });
  }, [isLast, load, pageNum]);

  const openItem = useCallback((item: ApiItem) => {
    if (openUrl(item)) return;
    if (item.id != null) router.push(`/article/detail?id=${item.id}`);
  }, []);

  const header = (
    <View style={styles.header}>
      {options.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesRow} contentContainerStyle={styles.types}>
          <Pressable onPress={() => setType(undefined)}>
            <Text style={[styles.type, !type ? styles.typeActive : null]}>全部</Text>
          </Pressable>
          {options.map(option => {
            const typeId = String(option.typeId ?? '');
            return (
              <Pressable key={typeId || String(option.typeName)} onPress={() => setType(typeId)}>
                <Text style={[styles.type, type === typeId ? styles.typeActive : null]}>
                  {String(option.typeName ?? '')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      <View style={styles.searchRow}>
        <SearchBar value={keyword} onChangeText={setKeyword} placeholder="请输入搜索词" />
      </View>
    </View>
  );

  return (
    <View style={styles.page}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${String(item?.id ?? 'x')}-${index}`}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={isLast ? <Text style={styles.empty}>~什么都没有哦~</Text> : null}
        ListFooterComponent={
          items.length > 0
            ? <Text style={styles.more}>{isLast ? '~没有更多了哦~' : '加载中...'}</Text>
            : null
        }
        renderItem={({ item }) => {
          const thumb = thumbUri(item.thumb);
          const active = item.className === 'active';
          return (
            <Pressable onPress={() => openItem(item)} style={styles.item}>
              {thumb ? <Image source={{ uri: thumb }} style={styles.thumb} /> : <View style={styles.thumb} />}
              <View style={styles.itemInfo}>
                <Text numberOfLines={1} style={[styles.itemTitle, active ? styles.itemActive : null]}>
                  {String(item.title ?? '')}
                </Text>
                <Text numberOfLines={2} style={[styles.note, active ? styles.itemActive : null]}>
                  {String(item.note ?? '')}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
