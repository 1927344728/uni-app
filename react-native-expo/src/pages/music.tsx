import { styles } from './music.styles';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

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

  const tabs = useMemo(() => [{ id: null, name: '全部' }, ...categories.filter(item => Number(item.categoryId) === 3).map(item => ({ id: String(item.typeId), name: String(item.typeName ?? '') }))], [categories]);
  const load = (nextPage: number, append = false) => api.musicPage({ type: type ?? undefined, keyword: keyword ?? '', pageNum: nextPage, pageSize: 10 })
    .then(value => {
      const next = value.content ?? [];
      setItems(old => append ? [...old, ...next] : next);
      setPage(nextPage);
      setLast(next.length < 10);
    }).catch(() => { if (!append) setItems([]); setLast(true); });

  useEffect(() => { api.musicMenus().then(value => setMenus(value ?? [])).catch(() => undefined); api.categories().then(value => setCategories(value as Category[] ?? [])).catch(() => undefined); }, []);
  useEffect(() => { load(0); }, [type, keyword]);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
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
          <Pressable onPress={() => !last && load(page + 1, true)}>
            <Text style={styles.empty}>{last ? '~没有更多了哦~' : '加载更多'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
