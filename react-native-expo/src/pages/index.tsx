import { styles } from './index.styles';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { api, type ApiItem } from '@/lib/api';

const { width } = Dimensions.get('window');
const COS = 'https://assets.izhao.com.cn';
const features = [
  { name: '任务中心', image: `${COS}/images/d502c279bba37f3dfe78158803cfff37.jpg`, href: '/task' },
  { name: '我的书单', image: `${COS}/images/d4f59adc3c18b9289aef1f340a93357e.jpg`, href: '/book' },
  { name: '音乐收藏', image: `${COS}/images/d055efbe683f9117949d5fa4088f0d55.jpg`, href: '/music' },
  { name: '视频订阅', image: `${COS}/images/147d5438ef903fcbbac27fc51b5627c8.jpg`, href: '/video?type=1' },
];

function thumbnail(uri: unknown, pixels = 240) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${pixels}x` : undefined;
}

export default function HomeScreen() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [banners, setBanners] = useState<ApiItem[]>([]);
  const [articles, setArticles] = useState<ApiItem[]>([]);
  const [user, setUser] = useState<ApiItem | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    api.welcome().catch(() => setIsMock(true));
    api.user().then(setUser).catch(() => undefined);
    api.banners().then(value => setBanners(value ?? [])).catch(() => setBanners([]));
    api.articlePage({ type: '2' }).then(value => setArticles(value.content ?? [])).catch(() => setArticles([]));
  }, []);

  const userName = String(user?.name ?? '欢迎来到');
  const bannerWidth = useMemo(() => width - 24, []);
  const openItem = (item: ApiItem, fallback?: string) => {
    const href = String(item.url ?? fallback ?? '');
    if (href.startsWith('/pages/')) {
      const [path, query] = href.replace('/pages/', '/').split('?');
      router.push(`${path.replace(/\/index$/, '')}${query ? `?${query}` : ''}` as never);
    } else if (href.startsWith('/')) router.push(href as never);
  };

  return <View style={styles.page}>
    <ScrollView contentContainerStyle={[styles.scroll, banners.length > 0 && styles.withBanner]} showsVerticalScrollIndicator={false}>
      {banners.length > 0 && <View style={styles.bannerWrap}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={event => setBannerIndex(Math.round(event.nativeEvent.contentOffset.x / bannerWidth))}>
          {banners.map(item => <Pressable key={String(item.id)} onPress={() => openItem(item)}><Image source={{ uri: thumbnail(item.image, 750) }} style={[styles.banner, { width: bannerWidth }]} /></Pressable>)}
        </ScrollView>
        <View style={styles.dots}>{banners.map((item, index) => <View key={String(item.id)} style={[styles.dot, index === bannerIndex && styles.dotActive]} />)}</View>
      </View>}

      <View style={styles.featureArea}><View style={styles.featureCard}>{features.map(feature => <Pressable key={feature.name} onPress={() => router.push(feature.href as never)} style={styles.feature}>
        <Image source={{ uri: thumbnail(feature.image, 120) }} style={styles.featureIcon} />
        <Text style={styles.featureText}>{feature.name}</Text>
      </Pressable>)}</View></View>

      {articles.length > 0 && <View style={styles.recommend}>
        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>推荐内容</Text><Pressable onPress={() => router.push('/article')}><Text style={styles.more}>查看更多</Text></Pressable></View>
        <View style={styles.list}>{articles.map(article => <Pressable key={String(article.id)} onPress={() => openItem(article, `/article/detail?id=${article.id}`)} style={styles.article}>
          <Image source={{ uri: thumbnail(article.thumb, 120) }} style={styles.articleImage} />
          <View style={styles.articleContent}><Text numberOfLines={1} style={styles.articleTitle}>{String(article.title ?? '')}</Text><Text numberOfLines={2} style={styles.articleDesc}>{String(article.note ?? '')}</Text></View>
        </Pressable>)}</View>
      </View>}

      <View style={styles.version}><Text style={styles.versionText}>你好，{userName}！</Text><Text style={styles.versionText}>一兆窗含@1.0.4 {isMock ? '[mock]' : ''}</Text></View>
    </ScrollView>
    <AppFooter active="index" />
  </View>;
}
