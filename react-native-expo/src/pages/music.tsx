import { styles } from './music.styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppRefreshControl } from '@/components/AppRefreshControl';
import { useScrollToLower } from '@/common/hooks/useScrollToLower';
import { api, type ApiItem } from '@/lib/api';
import { mergeUniqueById, uniqueTypeTabs } from '@/common/utils/categoryTabs';

type Category = ApiItem & { categoryId?: number; typeId?: number; typeName?: string };
const imageUri = (value: unknown, width = 180) => typeof value === 'string' ? `${value}${value.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;

export default function MusicScreen() {
  const { type: initialType, keyword } = useLocalSearchParams<{ type?: string; keyword?: string }>();
  const [menus, setMenus] = useState<ApiItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<string | null>(initialType ?? '1');
  const [items, setItems] = useState<ApiItem[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = useMemo(() => uniqueTypeTabs(categories, 3), [categories]);

  const load = useCallback((nextPage: number, append = false) => api.musicPage({ type: type ?? undefined, keyword: keyword ?? '', pageNum: nextPage, pageSize: 10 })
    .then(value => {
      const next = value.content ?? [];
      setItems(old => mergeUniqueById(old, next, append));
      setPage(nextPage);
      setLast(next.length < 10);
    }).catch(() => { if (!append) setItems([]); setLast(true); }), [keyword, type]);

  const loadMenus = useCallback(() => api.musicMenus().then(value => setMenus(value ?? [])).catch(() => setMenus([])), []);

  useEffect(() => { void loadMenus(); api.categories().then(value => setCategories(value as Category[] ?? [])).catch(() => undefined); }, [loadMenus]);
  useEffect(() => { void load(0); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([loadMenus(), load(0)]).finally(() => setRefreshing(false));
  };

  const loadMore = () => {
    if (last) return;
    void load(page + 1, true);
  };

  const onScrollToLower = useScrollToLower(loadMore, !last);

  return (
    <View style={styles.page}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScrollToLower}
        scrollEventThrottle={16}
      >
        {!!menus.length && (
          <View style={styles.menuGrid}>
            {menus.map(menu => (
              <Pressable
                key={String(menu.id)}
                style={styles.menu}
                onPress={() => {
                  const ids = (menu as Record<string, unknown>).songIds;
                  router.push({ pathname: '/music/play', params: { mode: 'menu', ids: JSON.stringify(Array.isArray(ids) ? ids : []) } });
                }}
              >
                {imageUri((menu as Record<string, unknown>).icon)
                  ? <Image source={{ uri: imageUri((menu as Record<string, unknown>).icon, 120) }} style={styles.menuIcon} />
                  : <View style={styles.menuIcon} />}
                <View style={styles.menuInfo}>
                  <Text numberOfLines={1} style={styles.menuTitle}>{String(menu.title ?? '')}</Text>
                  <Text numberOfLines={2} style={styles.menuDesc}>
                    {String((menu as Record<string, unknown>).desc ?? '')}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {tabs.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {tabs.map(tab => (
              <Pressable
                key={tab.id ?? 'all'}
                onPress={() => setType(tab.id)}
                style={[styles.tab, type === tab.id && styles.tabActive]}
              >
                <Text style={[styles.tabText, type === tab.id && styles.tabTextActive]}>{tab.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <Text style={styles.heading}>精选歌曲</Text>
        {items.map(item => (
          <Pressable
            key={String(item.id)}
            style={styles.song}
            onPress={() => router.push({ pathname: '/music/play', params: { mode: 'auto', id: String(item.id), type: type ?? '' } })}
          >
            {imageUri(item.cover)
              ? <Image source={{ uri: imageUri(item.cover, 120) }} style={styles.cover} />
              : <View style={styles.cover} />}
            <View style={styles.songInfo}>
              <Text numberOfLines={1} style={styles.songTitle}>{String(item.title ?? '')}</Text>
              <Text numberOfLines={1} style={styles.singer}>
                {String((item as Record<string, unknown>).singer ?? '未知歌手')}
              </Text>
            </View>
          </Pressable>
        ))}
        {!items.length && <Text style={styles.empty}>~什么都没有哦~</Text>}
        {!!items.length && (
          <Text style={styles.empty}>{last ? '~没有更多了哦~' : '加载中...'}</Text>
        )}
      </ScrollView>
    </View>
  );
}
