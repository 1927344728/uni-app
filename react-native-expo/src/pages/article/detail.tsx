import { styles } from './detail.styles';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ContentBlocks } from '@/components/ContentBlocks';
import { openUrl } from '@/common/utils/openUrl';
import { api, type ApiItem } from '@/lib/api';

function hasContent(content: unknown) {
  return Array.isArray(content) ? content.length > 0 : Boolean(content);
}

export default function ArticleDetailScreen() {
  const { id, articleId } = useLocalSearchParams<{ id?: string; articleId?: string }>();
  const [article, setArticle] = useState<ApiItem | null>(null);
  const [error, setError] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const articleIdValue = id ?? articleId;
    if (!articleIdValue) return;

    let cancelled = false;
    setError(false);
    setArticle(null);

    api.article(articleIdValue)
      .then(value => {
        if (cancelled) return;
        const data = value ?? null;
        // Some "articles" are redirects to static HTML / other pages (no content).
        if (data?.url && (!hasContent(data.content) || data.jumpTo === 'webview' || String(data.url).includes('.html'))) {
          openUrl(data, undefined, { replace: true });
          return;
        }
        setArticle(data);
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(null);
          setError(true);
        }
      });

    return () => { cancelled = true; };
  }, [id, articleId]);

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>加载失败</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>加载中…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
    >
      <ContentBlocks content={article.content} />
    </ScrollView>
  );
}
