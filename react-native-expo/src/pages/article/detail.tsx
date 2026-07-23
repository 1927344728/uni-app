import { styles } from './detail.styles';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ContentBlocks } from '@/components/ContentBlocks';
import { api, type ApiItem } from '@/lib/api';

export default function ArticleDetailScreen() {
  const { id, articleId } = useLocalSearchParams<{ id?: string; articleId?: string }>();
  const [article, setArticle] = useState<ApiItem | null>(null);
  useEffect(() => {
    const articleIdValue = id ?? articleId;
    if (articleIdValue) api.article(articleIdValue).then(value => setArticle(value ?? null)).catch(() => setArticle(null));
  }, [id, articleId]);
  if (!article) return <View style={styles.loading}><Text style={styles.loadingText}>加载中…</Text></View>;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ContentBlocks content={article.content} />
    </ScrollView>
  );
}
