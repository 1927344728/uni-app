import { styles } from './life.styles';
import { styles as musicStyles } from './music.styles';
import { styles as videoStyles } from './video.styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { AppRefreshControl } from '@/components/AppRefreshControl';
import { TabSwipeContainer } from '@/components/TabSwipeContainer';
import { useScrollToLower } from '@/common/hooks/useScrollToLower';
import { SearchBar } from '@/components/SearchBar';
import { api, type ApiItem } from '@/lib/api';
import { mergeUniqueById, uniqueTypeTabs, uniqueValueOptions } from '@/common/utils/categoryTabs';
import { openUrl } from '@/common/utils/openUrl';

type Tab = { key: string; id: number; name: string; source: 'music' | 'video' | 'article' };
type Category = ApiItem & { categoryId?: number; typeId?: number; typeName?: string; categoryName?: string };

const fallbackTabs: Tab[] = [
  { key: 'music', id: 1, name: '音乐', source: 'music' },
  { key: 'video', id: 2, name: '视频', source: 'video' },
  { key: 'travel', id: 5, name: '旅行', source: 'article' },
  { key: 'ana', id: 6, name: '随笔', source: 'article' },
];

const thumbnail = (value: unknown, width = 120) => typeof value === 'string'
  ? `${value}${value.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x`
  : undefined;
const plainText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
const { width: screenWidth } = Dimensions.get('window');

export default function LifeScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState(tab ?? 'music');
  const [subType, setSubType] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // article list
  const [items, setItems] = useState<ApiItem[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);

  // music panel
  const [menus, setMenus] = useState<ApiItem[]>([]);
  const [musicType, setMusicType] = useState<string | null>(null);
  const [musicItems, setMusicItems] = useState<ApiItem[]>([]);
  const [musicPage, setMusicPage] = useState(0);
  const [musicLast, setMusicLast] = useState(false);

  // video panel
  const [banners, setBanners] = useState<ApiItem[]>([]);
  const [recommended, setRecommended] = useState<ApiItem[]>([]);
  const [videoType, setVideoType] = useState<string | null>(null);
  const [videoItems, setVideoItems] = useState<ApiItem[]>([]);
  const [videoPage, setVideoPage] = useState(0);
  const [videoLast, setVideoLast] = useState(false);

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
  const subtypeOptions = useMemo(() => {
    if (current?.source !== 'article') return [];
    return uniqueValueOptions(
      categories
        .filter(item => Number(item.categoryId) === 1 && Number(item.typeId) === current.id && item.subTypeId)
        .map(item => ({ value: String(item.subTypeId), name: String(item.subTypeName ?? '') })),
    );
  }, [categories, current]);

  const musicTabs = useMemo(() => uniqueTypeTabs(categories, 3), [categories]);
  const videoTabs = useMemo(() => uniqueTypeTabs(categories, 4), [categories]);

  const loadVideoMenus = useCallback(() => api.videoMenus().then(async menuList => {
    const banner = menuList?.find(item => Number(item.id) === 1) as (ApiItem & { videoIds?: string[] }) | undefined;
    const rec = menuList?.find(item => Number(item.id) === 2) as (ApiItem & { videoIds?: string[] }) | undefined;
    if (banner?.videoIds?.length) {
      const value = await api.videoByIds(banner.videoIds.map(String));
      setBanners(value ?? []);
    } else setBanners([]);
    if (rec?.videoIds?.length) {
      const value = await api.videoByIds(rec.videoIds.map(String));
      setRecommended(value ?? []);
    } else setRecommended([]);
  }).catch(() => { setBanners([]); setRecommended([]); }), []);

  useEffect(() => { api.categories().then(value => setCategories(value ?? [])).catch(() => undefined); }, []);
  useEffect(() => { api.musicMenus().then(value => setMenus(value ?? [])).catch(() => setMenus([])); }, []);
  useEffect(() => { void loadVideoMenus(); }, [loadVideoMenus]);
  useEffect(() => { if (tabs.length && !tabs.some(item => item.key === active)) setActive(tabs[0].key); }, [active, tabs]);

  const loadArticle = useCallback((page: number, append = false) => {
    if (!current || current.source !== 'article') return Promise.resolve();
    const params = { type: current.id, subType: subType ?? undefined, keyword, pageNum: page, pageSize: 15 };
    return api.articlePage(params).then(value => {
      const next = value.content ?? [];
      setItems(old => mergeUniqueById(old, next, append));
      setPageNum(page);
      setIsLast(next.length < 15);
    }).catch(() => { if (!append) setItems([]); setIsLast(true); });
  }, [current, keyword, subType]);

  const loadMusic = useCallback((page: number, append = false) => api.musicPage({
    type: musicType ?? undefined,
    keyword,
    pageNum: page,
    pageSize: 10,
  }).then(value => {
    const next = value.content ?? [];
    setMusicItems(old => mergeUniqueById(old, next, append));
    setMusicPage(page);
    setMusicLast(next.length < 10);
  }).catch(() => { if (!append) setMusicItems([]); setMusicLast(true); }), [keyword, musicType]);

  const loadVideo = useCallback((page: number, append = false) => api.videoPage({
    type: videoType ?? undefined,
    keyword,
    pageNum: page,
    pageSize: 6,
  }).then(value => {
    const next = value.content ?? [];
    setVideoItems(old => mergeUniqueById(old, next, append));
    setVideoPage(page);
    setVideoLast(next.length < 6);
  }).catch(() => { if (!append) setVideoItems([]); setVideoLast(true); }), [keyword, videoType]);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      if (current.source === 'article') void loadArticle(0);
      else if (current.source === 'music') void loadMusic(0);
      else void loadVideo(0);
    }, 150);
    return () => clearTimeout(timer);
  }, [current?.id, current?.key, current?.source, keyword, subType, musicType, videoType, loadArticle, loadMusic, loadVideo]);

  const selectTab = (key: string) => {
    setActive(key);
    setSubType(null);
    setKeyword('');
    setMusicType(null);
    setVideoType(null);
  };

  const refreshList = async () => {
    if (!current) return;
    setRefreshing(true);
    try {
      if (current.source === 'article') await loadArticle(0);
      else if (current.source === 'music') {
        const menuList = await api.musicMenus().catch(() => []);
        setMenus(menuList ?? []);
        await loadMusic(0);
      } else {
        await loadVideoMenus();
        await loadVideo(0);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!current) return;
    if (current.source === 'article') {
      if (isLast) return;
      void loadArticle(pageNum + 1, true);
    } else if (current.source === 'music') {
      if (musicLast) return;
      void loadMusic(musicPage + 1, true);
    } else {
      if (videoLast) return;
      void loadVideo(videoPage + 1, true);
    }
  };

  const canLoadMore = current?.source === 'article' ? !isLast
    : current?.source === 'music' ? !musicLast
      : !videoLast;

  const onScrollToLower = useScrollToLower(loadMore, !!canLoadMore);
  const tabKeys = useMemo(() => tabs.map(item => item.key), [tabs]);

  const openVideoQueue = (queue: ApiItem[], start?: ApiItem) => router.push({
    pathname: '/video/play',
    params: { mode: 'menu', ids: JSON.stringify(queue.map(item => item.id)), id: start?.id ? String(start.id) : '' },
  });

  const renderArticleList = () => (
    <>
      {items.map(item => (
        <Pressable
          key={String(item.id)}
          onPress={() => {
            if (openUrl(item)) return;
            router.push(`/article/detail?id=${item.id}` as never);
          }}
          style={styles.item}
        >
          <Image source={{ uri: thumbnail(item.thumb) }} style={styles.image} />
          <View style={styles.itemContent}>
            <Text numberOfLines={1} style={[styles.title, item.className === 'active' && styles.activeText]}>
              {String(item.title ?? '')}
            </Text>
            <Text numberOfLines={2} style={[styles.note, item.className === 'active' && styles.activeText]}>
              {String(item.note ?? '')}
            </Text>
            {item.badgeText ? <Text style={styles.badge}>{String(item.badgeText)}</Text> : null}
          </View>
        </Pressable>
      ))}
      {!items.length && <Text style={styles.empty}>~什么都没有哦~</Text>}
      {items.length > 0 && (
        <Text style={styles.empty}>{isLast ? '~没有更多了哦~' : '加载中...'}</Text>
      )}
    </>
  );

  const renderMusicPanel = () => (
    <>
      {!!menus.length && (
        <View style={musicStyles.menuGrid}>
          {menus.map(menu => (
            <Pressable
              key={String(menu.id)}
              style={musicStyles.menu}
              onPress={() => {
                const ids = (menu as Record<string, unknown>).songIds;
                router.push({ pathname: '/music/play', params: { mode: 'menu', ids: JSON.stringify(Array.isArray(ids) ? ids : []) } });
              }}
            >
              {thumbnail((menu as Record<string, unknown>).icon, 120)
                ? <Image source={{ uri: thumbnail((menu as Record<string, unknown>).icon, 120) }} style={musicStyles.menuIcon} />
                : <View style={musicStyles.menuIcon} />}
              <View style={musicStyles.menuInfo}>
                <Text numberOfLines={1} style={musicStyles.menuTitle}>{String(menu.title ?? '')}</Text>
                <Text numberOfLines={2} style={musicStyles.menuDesc}>{String((menu as Record<string, unknown>).desc ?? '')}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {musicTabs.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={musicStyles.tabs}>
          {musicTabs.map(tabItem => (
            <Pressable key={tabItem.id ?? 'all'} onPress={() => setMusicType(tabItem.id)} style={[musicStyles.tab, musicType === tabItem.id && musicStyles.tabActive]}>
              <Text style={[musicStyles.tabText, musicType === tabItem.id && musicStyles.tabTextActive]}>{tabItem.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Text style={musicStyles.heading}>精选歌曲</Text>
      {musicItems.map(item => (
        <Pressable
          key={String(item.id)}
          style={musicStyles.song}
          onPress={() => router.push({ pathname: '/music/play', params: { mode: 'auto', id: String(item.id) } })}
        >
          {thumbnail(item.cover, 120)
            ? <Image source={{ uri: thumbnail(item.cover, 120) }} style={musicStyles.cover} />
            : <View style={musicStyles.cover} />}
          <View style={musicStyles.songInfo}>
            <Text numberOfLines={1} style={musicStyles.songTitle}>{String(item.title ?? '')}</Text>
            <Text numberOfLines={1} style={musicStyles.singer}>{String((item as Record<string, unknown>).singer ?? '未知歌手')}</Text>
          </View>
        </Pressable>
      ))}
      {!musicItems.length && <Text style={musicStyles.empty}>~什么都没有哦~</Text>}
      {!!musicItems.length && (
        <Text style={musicStyles.empty}>{musicLast ? '~没有更多了哦~' : '加载中...'}</Text>
      )}
    </>
  );

  const renderVideoPanel = () => (
    <>
      {!!banners.length && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={videoStyles.bannerScroll}>
          {banners.map(item => (
            <Pressable key={String(item.id)} style={[videoStyles.banner, { width: screenWidth - 24 }]} onPress={() => openVideoQueue(banners, item)}>
              {thumbnail(item.cover, 700)
                ? <Image source={{ uri: thumbnail(item.cover, 700) }} style={videoStyles.bannerImage} />
                : <View style={videoStyles.bannerImage} />}
              <Text numberOfLines={1} style={videoStyles.bannerTitle}>{plainText((item as Record<string, unknown>).desc)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      {!!recommended.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={videoStyles.recommendations}>
          {recommended.map(item => (
            <Pressable key={String(item.id)} style={videoStyles.recommendation} onPress={() => openVideoQueue(recommended, item)}>
              {thumbnail(item.cover)
                ? <Image source={{ uri: thumbnail(item.cover) }} style={videoStyles.recImage} />
                : <View style={videoStyles.recImage} />}
              <View style={videoStyles.recText}>
                <Text numberOfLines={1} style={videoStyles.recTitle}>{String(item.title ?? '')}</Text>
                <Text numberOfLines={1} style={videoStyles.recDesc}>{plainText((item as Record<string, unknown>).desc)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
      {videoTabs.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={videoStyles.tabs}>
          {videoTabs.map(tabItem => (
            <Pressable key={tabItem.id ?? 'all'} onPress={() => setVideoType(tabItem.id)} style={[videoStyles.tab, videoType === tabItem.id && videoStyles.tabActive]}>
              <Text style={[videoStyles.tabText, videoType === tabItem.id && videoStyles.tabTextActive]}>{tabItem.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View style={videoStyles.grid}>
        {videoItems.map(item => (
          <Pressable
            key={String(item.id)}
            style={videoStyles.card}
            onPress={() => router.push({ pathname: '/video/play', params: { mode: 'auto', id: String(item.id) } })}
          >
            {thumbnail(item.cover, 300)
              ? <Image source={{ uri: thumbnail(item.cover, 300) }} style={videoStyles.cover} />
              : <View style={videoStyles.cover} />}
            <Text numberOfLines={1} style={videoStyles.title}>{String(item.title ?? '')}</Text>
            <Text numberOfLines={1} style={videoStyles.description}>{plainText((item as Record<string, unknown>).desc)}</Text>
          </Pressable>
        ))}
      </View>
      {!videoItems.length && <Text style={videoStyles.empty}>~什么都没有哦~</Text>}
      {!!videoItems.length && (
        <Text style={videoStyles.empty}>{videoLast ? '~没有更多了哦~' : '加载中...'}</Text>
      )}
    </>
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        {tabs.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
            {tabs.map(item => (
              <Pressable key={item.key} onPress={() => selectTab(item.key)} style={styles.tab}>
                <Text style={[styles.tabText, active === item.key && styles.tabTextActive]}>{item.name}</Text>
                {active === item.key && <View style={styles.underline} />}
              </Pressable>
            ))}
          </ScrollView>
        )}
        {current?.source === 'article' && subtypeOptions.length > 1 && (
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
          {current?.source === 'music' && renderMusicPanel()}
          {current?.source === 'video' && renderVideoPanel()}
          {current?.source === 'article' && renderArticleList()}
        </ScrollView>
      </TabSwipeContainer>
      <AppFooter active="life" />
    </View>
  );
}
