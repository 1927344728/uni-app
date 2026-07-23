import { styles } from './video.styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppRefreshControl } from '@/components/AppRefreshControl';
import { useScrollToLower } from '@/common/hooks/useScrollToLower';
import { api, type ApiItem } from '@/lib/api';
import { mergeUniqueById, uniqueTypeTabs } from '@/common/utils/categoryTabs';

type Category = ApiItem & { categoryId?: number; typeId?: number; typeName?: string };
const imageUri = (value: unknown, width = 300) => typeof value === 'string' ? `${value}${value.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;
const plainText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
const { width: screenWidth } = Dimensions.get('window');

export default function VideoScreen() {
  const { type: initialType, keyword } = useLocalSearchParams<{ type?: string; keyword?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<ApiItem[]>([]);
  const [recommended, setRecommended] = useState<ApiItem[]>([]);
  const [type, setType] = useState<string | null>(initialType ?? '1');
  const [items, setItems] = useState<ApiItem[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const tabs = useMemo(() => uniqueTypeTabs(categories, 4), [categories]);

  const load = useCallback((nextPage: number, append = false) => api.videoPage({ type: type ?? undefined, keyword: keyword ?? '', pageNum: nextPage, pageSize: 6 }).then(value => {
    const next = value.content ?? []; setItems(old => mergeUniqueById(old, next, append)); setPage(nextPage); setLast(next.length < 6);
  }).catch(() => { if (!append) setItems([]); setLast(true); }), [keyword, type]);

  const loadMenus = useCallback(() => api.videoMenus().then(async menus => {
    const banner = menus?.find(item => Number(item.id) === 1) as (ApiItem & { videoIds?: string[] }) | undefined;
    const rec = menus?.find(item => Number(item.id) === 2) as (ApiItem & { videoIds?: string[] }) | undefined;
    if (banner?.videoIds?.length) api.videoByIds(banner.videoIds.map(String)).then(value => setBanners(value ?? [])).catch(() => setBanners([]));
    else setBanners([]);
    if (rec?.videoIds?.length) api.videoByIds(rec.videoIds.map(String)).then(value => setRecommended(value ?? [])).catch(() => setRecommended([]));
    else setRecommended([]);
  }).catch(() => { setBanners([]); setRecommended([]); }), []);

  useEffect(() => {
    api.categories().then(value => setCategories(value as Category[] ?? [])).catch(() => undefined);
    void loadMenus();
  }, [loadMenus]);
  useEffect(() => { void load(0); }, [load]);

  const openQueue = (queue: ApiItem[], start?: ApiItem) => router.push({ pathname: '/video/play', params: { mode: 'menu', ids: JSON.stringify(queue.map(item => item.id)), id: start?.id ? String(start.id) : '' } });

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
        {!!banners.length && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
            {banners.map(item => (
              <Pressable key={String(item.id)} style={[styles.banner, { width: screenWidth - 24 }]} onPress={() => openQueue(banners, item)}>
                {imageUri(item.cover, 700)
                  ? <Image source={{ uri: imageUri(item.cover, 700) }} style={styles.bannerImage} />
                  : <View style={styles.bannerImage} />}
                <Text numberOfLines={1} style={styles.bannerTitle}>
                  {plainText((item as Record<string, unknown>).desc)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        {!!recommended.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendations}>
            {recommended.map(item => (
              <Pressable key={String(item.id)} style={styles.recommendation} onPress={() => openQueue(recommended, item)}>
                {imageUri(item.cover)
                  ? <Image source={{ uri: imageUri(item.cover) }} style={styles.recImage} />
                  : <View style={styles.recImage} />}
                <View style={styles.recText}>
                  <Text numberOfLines={1} style={styles.recTitle}>{String(item.title ?? '')}</Text>
                  <Text numberOfLines={1} style={styles.recDesc}>
                    {plainText((item as Record<string, unknown>).desc)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
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
        <View style={styles.grid}>
          {items.map(item => (
            <Pressable
              key={String(item.id)}
              style={styles.card}
              onPress={() => router.push({ pathname: '/video/play', params: { mode: 'auto', id: String(item.id), type: type ?? '' } })}
            >
              {imageUri(item.cover)
                ? <Image source={{ uri: imageUri(item.cover) }} style={styles.cover} />
                : <View style={styles.cover} />}
              <Text numberOfLines={1} style={styles.title}>{String(item.title ?? '')}</Text>
              <Text numberOfLines={1} style={styles.description}>
                {plainText((item as Record<string, unknown>).desc)}
              </Text>
            </Pressable>
          ))}
        </View>
        {!items.length && <Text style={styles.empty}>~什么都没有哦~</Text>}
        {!!items.length && (
          <Text style={styles.empty}>{last ? '~没有更多了哦~' : '加载中...'}</Text>
        )}
      </ScrollView>
    </View>
  );
}
