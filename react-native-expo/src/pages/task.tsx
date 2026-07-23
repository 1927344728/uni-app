import { styles } from './task.styles';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { AppRefreshControl } from '@/components/AppRefreshControl';
import { DataPicker } from '@/components/DataPicker';
import { useScrollToLower } from '@/common/hooks/useScrollToLower';
import { SearchBar } from '@/components/SearchBar';
import { api, type ApiItem } from '@/lib/api';

const statusMap: Record<string, string> = { '1': '未开始', '2': '进行中', '3': '已完成', '4': '已取消' };
const statusOptions = Object.entries(statusMap).map(([value, label]) => ({ value, label }));

export default function TaskScreen() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [targeters, setTargeters] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [targeter, setTargeter] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { api.taskTargeters().then(value => setTargeters(value ?? [])).catch(() => undefined); }, []);

  const fetchList = useCallback((page: number, append = false) => {
    return api.taskPage({ title: keyword, targeter: targeter ?? undefined, status: status ?? undefined, pageNum: page, pageSize: 10 })
      .then(value => {
        const next = value.content ?? [];
        setItems(current => append ? [...current, ...next] : next);
        setPageNum(page);
        setIsLast(next.length < 10);
      })
      .catch(() => {
        if (!append) setItems([]);
        setIsLast(true);
      });
  }, [keyword, targeter, status]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchList(0); }, 200);
    return () => clearTimeout(timer);
  }, [fetchList]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchList(0).finally(() => setRefreshing(false));
  };

  const loadMore = () => {
    if (isLast) return;
    void fetchList(pageNum + 1, true);
  };

  const onScrollToLower = useScrollToLower(loadMore, !isLast);

  return (
    <View style={styles.page}>
      <View style={styles.toolbar}>
        <View style={styles.selectRow}>
          <DataPicker
            value={targeter}
            options={targeters.map(name => ({ value: name, label: name }))}
            placeholder="请选择任务人"
            title="请选择任务人"
            onChange={setTargeter}
          />
          <DataPicker
            value={status}
            options={statusOptions}
            placeholder="请选择状态"
            title="请选择状态"
            onChange={setStatus}
          />
        </View>
        <SearchBar value={keyword} onChangeText={setKeyword} placeholder="请输入任务名称" />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScrollToLower}
        scrollEventThrottle={16}
      >
        {items.map(item => (
          <Pressable key={String(item.id)} onPress={() => router.push(`/task/detail?id=${item.id}`)} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{String(item.title ?? '')}</Text>
              <Text style={[styles.tag, styles[`status${String(item.status)}` as keyof typeof styles]]}>
                {statusMap[String(item.status)] ?? '未知'}
              </Text>
            </View>
            <Text style={styles.meta}>任务人：{String(item.targeter ?? '')}</Text>
            <Text style={styles.meta}>发布者：{String(item.publisher ?? '')}</Text>
            <Text style={styles.content}>{String(item.content ?? '')}</Text>
            {Number(item.status) === 2 && (
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progress, { width: `${Math.min(100, Number(item.progress ?? 0))}%` }]} />
                </View>
                <Text style={styles.progressText}>{String(item.progress ?? 0)}%</Text>
              </View>
            )}
          </Pressable>
        ))}
        {items.length > 0 && (
          <Text style={styles.noMore}>{isLast ? '~没有更多了哦~' : '加载中...'}</Text>
        )}
      </ScrollView>
      <AppFooter active="task" />
    </View>
  );
}
