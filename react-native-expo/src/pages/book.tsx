import { styles } from './book.styles';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppRefreshControl } from '@/components/AppRefreshControl';
import { useScrollToLower } from '@/common/hooks/useScrollToLower';
import { api, type ApiItem } from '@/lib/api';

function thumbnail(uri: unknown) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/160x` : undefined;
}

function tags(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export default function BookScreen() {
  const [books, setBooks] = useState<ApiItem[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((page: number, append = false) => api.bookPage({ pageNum: page, pageSize: 10 }).then(value => {
    const next = value.content ?? [];
    setBooks(current => (append ? [...current, ...next] : next));
    setPageNum(page);
    setIsLast(next.length < 10);
  }).catch(() => {
    if (!append) setBooks([]);
    setIsLast(true);
  }), []);

  useEffect(() => { void load(0); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load(0).finally(() => setRefreshing(false));
  };

  const loadMore = () => {
    if (isLast) return;
    void load(pageNum + 1, true);
  };

  const onScrollToLower = useScrollToLower(loadMore, !isLast);

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScrollToLower}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>一兆精选 · 图书馆</Text>
          <Text style={styles.subtitle}>沉浸阅读 · 私藏好书随时借阅</Text>
        </View>
        <View style={styles.list}>
          {books.map(book => {
            const cover = thumbnail(book.cover);
            const score = Number(book.score);
            return (
              <Pressable
                key={String(book.id)}
                onPress={() => router.push(`/book/detail?id=${book.id}`)}
                style={styles.card}
              >
                {cover ? (
                  <Image source={{ uri: cover }} style={styles.cover} />
                ) : (
                  <View style={styles.cover} />
                )}
                <View style={styles.info}>
                  <View style={styles.cardHead}>
                    <Text style={styles.title} numberOfLines={1}>{String(book.title ?? '')}</Text>
                    {score > 0 ? (
                      <Text style={styles.score}>
                        {score.toFixed(1)}
                        <Text style={styles.scoreSuffix}>分</Text>
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.meta}>作者：{String(book.author ?? '')}</Text>
                  <Text style={styles.meta}>书主：{String(book.owner ?? '')}</Text>
                  <Text style={styles.description} numberOfLines={2}>{String(book.description ?? '')}</Text>
                  <View style={styles.tags}>
                    {tags(book.tags).map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
          {!books.length && isLast ? <Text style={styles.empty}>~什么都没有哦~</Text> : null}
          {books.length > 0 ? (
            <Text style={styles.more}>{isLast ? '~没有更多了哦~' : '加载中...'}</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
