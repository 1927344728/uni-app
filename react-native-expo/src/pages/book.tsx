import { styles } from './book.styles';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

function thumbnail(uri: unknown) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/160x` : undefined;
}

function tags(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export default function BookScreen() {
  const [books, setBooks] = useState<ApiItem[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);

  const load = (page: number) => api.bookPage({ pageNum: page, pageSize: 10 }).then(value => {
    const next = value.content ?? [];
    setBooks(current => page === 0 ? next : [...current, ...next]);
    setPageNum(page);
    setIsLast(next.length < 10);
  }).catch(() => { if (page === 0) setBooks([]); setIsLast(true); });

  useEffect(() => { load(0); }, []);
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.heading}>一兆精选 · 图书馆</Text><Text style={styles.subtitle}>沉浸阅读 · 私藏好书随时借阅</Text></View>
    <View style={styles.list}>
      {books.map(book => <Pressable key={String(book.id)} onPress={() => router.push(`/book/detail?id=${book.id}`)} style={styles.card}>
        <Image source={{ uri: thumbnail(book.cover) }} style={styles.cover} />
        <View style={styles.info}>
          <View style={styles.cardHead}><Text style={styles.title} numberOfLines={1}>{String(book.title ?? '')}</Text>{Number(book.score) > 0 && <Text style={styles.score}>{Number(book.score).toFixed(1)}<Text style={styles.scoreSuffix}>分</Text></Text>}</View>
          <Text style={styles.meta}>作者：{String(book.author ?? '')}</Text>
          <Text style={styles.meta}>书主：{String(book.owner ?? '')}</Text>
          <Text style={styles.description} numberOfLines={2}>{String(book.description ?? '')}</Text>
          <View style={styles.tags}>{tags(book.tags).map(tag => <Text key={String(tag)} style={styles.tag}>{String(tag)}</Text>)}</View>
        </View>
      </Pressable>)}
      {!books.length && isLast && <Text style={styles.empty}>~什么都没有哦~</Text>}
      {!!books.length && <Pressable onPress={() => !isLast && load(pageNum + 1)}><Text style={styles.more}>{isLast ? '~没有更多了哦~' : '加载更多'}</Text></Pressable>}
    </View>
  </ScrollView>;
}
