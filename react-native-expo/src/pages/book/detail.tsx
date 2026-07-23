import { styles } from './detail.styles';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

function thumbnail(uri: unknown) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/320x` : undefined;
}
function clean(value: unknown) {
  return String(value ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
function values(value: unknown) {
  return Array.isArray(value) ? value : [value];
}

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [book, setBook] = useState<ApiItem | null>(null);
  useEffect(() => { if (id) api.book(id).then(value => setBook(value ?? null)).catch(() => setBook(null)); }, [id]);
  if (!book) return <View style={styles.loading}><Text style={styles.muted}>加载中…</Text></View>;

  const score = Number(book.score ?? 0);
  const bookTags = Array.isArray(book.tags) ? book.tags : [];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.overview}>
        <Pressable>
          <Image source={{ uri: thumbnail(book.cover) }} style={styles.cover} />
        </Pressable>
        <View style={styles.info}>
          <Text style={styles.title}>{String(book.title ?? '')}</Text>
          <Text style={styles.meta}>作者：{String(book.author ?? '')}</Text>
          <Text style={styles.meta}>书主：{String(book.owner ?? '')}</Text>
          {score > 0 && (
            <View style={styles.rating}>
              <Text style={styles.ratingLabel}>评分：</Text>
              <Text style={styles.ratingNumber}>{score.toFixed(1)}</Text>
              <Text style={styles.stars}>
                {[1, 2, 3, 4, 5].map(n => n <= Math.round(score / 2) ? '★' : '☆').join('')}
              </Text>
            </View>
          )}
          <View style={styles.tags}>
            {bookTags.map(tag => (
              <Text key={String(tag)} style={styles.tag}>{String(tag)}</Text>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.body}>
        {Boolean(book.summaries) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>书籍简介</Text>
            {values(book.summaries).filter(Boolean).map((summary, index) => (
              <Text key={index} style={styles.summary}>{clean(summary)}</Text>
            ))}
          </View>
        )}
        {Array.isArray(book.highlights) && book.highlights.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>精彩内容</Text>
            <View style={styles.highlights}>
              {book.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlight}>
                  <Text style={styles.highlightText}>{clean(highlight)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
