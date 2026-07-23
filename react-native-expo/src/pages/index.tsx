import { styles } from './index.styles';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { APP_NAME, APP_VERSION } from '@/config/app';
import { HOME_FEATURES } from '@/config/features';
import { scaleCosImage } from '@/common/utils/cos';
import { api, type ApiItem } from '@/lib/api';

const { width } = Dimensions.get('window');

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
          {banners.map(item => <Pressable key={String(item.id)} onPress={() => openItem(item)}><Image source={{ uri: scaleCosImage(item.image, 750) }} style={[styles.banner, { width: bannerWidth }]} /></Pressable>)}
        </ScrollView>
        <View style={styles.dots}>{banners.map((item, index) => <View key={String(item.id)} style={[styles.dot, index === bannerIndex && styles.dotActive]} />)}</View>
      </View>}

      <View style={styles.featureArea}><View style={styles.featureCard}>{HOME_FEATURES.map(feature => <Pressable key={feature.name} onPress={() => router.push(feature.href as never)} style={styles.feature}>
        <Image source={{ uri: scaleCosImage(feature.image, 120) }} style={styles.featureIcon} />
        <Text style={styles.featureText}>{feature.name}</Text>
      </Pressable>)}</View></View>

      {articles.length > 0 && <View style={styles.recommend}>
        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>推荐内容</Text><Pressable onPress={() => router.push('/article')}><Text style={styles.more}>查看更多</Text></Pressable></View>
        <View style={styles.list}>{articles.map(article => <Pressable key={String(article.id)} onPress={() => openItem(article, `/article/detail?id=${article.id}`)} style={styles.article}>
          <Image source={{ uri: scaleCosImage(article.thumb, 120) }} style={styles.articleImage} />
          <View style={styles.articleContent}><Text numberOfLines={1} style={styles.articleTitle}>{String(article.title ?? '')}</Text><Text numberOfLines={2} style={styles.articleDesc}>{String(article.note ?? '')}</Text></View>
        </Pressable>)}</View>
      </View>}

      <View style={styles.version}><Text style={styles.versionText}>你好，{userName}！</Text><Text style={styles.versionText}>{APP_NAME}@{APP_VERSION} {isMock ? '[mock]' : ''}</Text></View>
    </ScrollView>
    <AppFooter active="index" />
  </View>;
}
