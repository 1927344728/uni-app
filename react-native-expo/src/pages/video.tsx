import { styles } from './video.styles';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

type Category = ApiItem & { categoryId?: number; typeId?: number; typeName?: string };
const imageUri = (value: unknown, width = 300) => typeof value === 'string' ? `${value}${value.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;
const plainText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export default function VideoScreen() {
  const { type: initialType, keyword } = useLocalSearchParams<{ type?: string; keyword?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<ApiItem[]>([]);
  const [recommended, setRecommended] = useState<ApiItem[]>([]);
  const [type, setType] = useState<string | null>(initialType ?? '1');
  const [items, setItems] = useState<ApiItem[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const tabs = useMemo(() => [{ id: null, name: '全部' }, ...categories.filter(item => Number(item.categoryId) === 4).map(item => ({ id: String(item.typeId), name: String(item.typeName ?? '') }))], [categories]);

  const load = (nextPage: number, append = false) => api.videoPage({ type: type ?? undefined, keyword: keyword ?? '', pageNum: nextPage, pageSize: 6 }).then(value => {
    const next = value.content ?? []; setItems(old => append ? [...old, ...next] : next); setPage(nextPage); setLast(next.length < 6);
  }).catch(() => { if (!append) setItems([]); setLast(true); });
  useEffect(() => {
    api.categories().then(value => setCategories(value as Category[] ?? [])).catch(() => undefined);
    api.videoMenus().then(async menus => {
      const banner = menus?.find(item => Number(item.id) === 1) as (ApiItem & { videoIds?: string[] }) | undefined;
      const rec = menus?.find(item => Number(item.id) === 2) as (ApiItem & { videoIds?: string[] }) | undefined;
      if (banner?.videoIds?.length) api.videoByIds(banner.videoIds.map(String)).then(value => setBanners(value ?? [])).catch(() => undefined);
      if (rec?.videoIds?.length) api.videoByIds(rec.videoIds.map(String)).then(value => setRecommended(value ?? [])).catch(() => undefined);
    }).catch(() => undefined);
  }, []);
  useEffect(() => { load(0); }, [type, keyword]);
  const openQueue = (queue: ApiItem[], start?: ApiItem) => router.push({ pathname: '/video/play', params: { mode: 'menu', ids: JSON.stringify(queue.map(item => item.id)), id: start?.id ? String(start.id) : '' } });

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        {!!banners.length && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
            {banners.map(item => (
              <Pressable key={String(item.id)} style={styles.banner} onPress={() => openQueue(banners, item)}>
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
          <Pressable onPress={() => !last && load(page + 1, true)}>
            <Text style={styles.empty}>{last ? '~没有更多了哦~' : '加载更多'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
