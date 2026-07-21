import { styles } from './task.styles';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { api, type ApiItem } from '@/lib/api';

const statusMap: Record<string, string> = { '1': '未开始', '2': '进行中', '3': '已完成', '4': '已取消' };

export default function TaskScreen() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [targeters, setTargeters] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [targeter, setTargeter] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);

  useEffect(() => { api.taskTargeters().then(value => setTargeters(value ?? [])).catch(() => undefined); }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      api.taskPage({ title: keyword, targeter: targeter ?? undefined, status: status ?? undefined, pageNum: 0, pageSize: 10 })
        .then(value => { const next = value.content ?? []; setItems(next); setPageNum(0); setIsLast(next.length < 10); })
        .catch(() => { setItems([]); setIsLast(true); });
    }, 200);
    return () => clearTimeout(timer);
  }, [keyword, targeter, status]);

  const loadMore = () => {
    if (isLast) return;
    const nextPage = pageNum + 1;
    api.taskPage({ title: keyword, targeter: targeter ?? undefined, status: status ?? undefined, pageNum: nextPage, pageSize: 10 })
      .then(value => { const next = value.content ?? []; setItems(current => [...current, ...next]); setPageNum(nextPage); setIsLast(next.length < 10); })
      .catch(() => setIsLast(true));
  };

  return <View style={styles.page}>
    <View style={styles.toolbar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectRow}>
        <Filter label={targeter ?? '请选择任务人'} active={Boolean(targeter)} onPress={() => setTargeter(targeter ? null : targeters[0] ?? null)} />
        <Filter label={status ? statusMap[status] : '请选择状态'} active={Boolean(status)} onPress={() => setStatus(status === '4' ? null : String(Number(status ?? 0) + 1))} />
      </ScrollView>
      <View style={styles.optionRow}>{targeters.map(name => <Pressable key={name} onPress={() => setTargeter(name === targeter ? null : name)}><Text style={[styles.option, targeter === name && styles.optionActive]}>{name}</Text></Pressable>)}</View>
      <TextInput value={keyword} onChangeText={setKeyword} placeholder="请输入任务名称" placeholderTextColor="#b3b3b3" style={styles.search} />
    </View>
    <ScrollView contentContainerStyle={styles.list}>
      {items.map(item => <Pressable key={String(item.id)} onPress={() => router.push(`/task/detail?id=${item.id}`)} style={styles.card}>
        <View style={styles.header}><Text style={styles.title}>{String(item.title ?? '')}</Text><Text style={[styles.tag, styles[`status${String(item.status)}` as keyof typeof styles]]}>{statusMap[String(item.status)] ?? '未知'}</Text></View>
        <Text style={styles.meta}>任务人：{String(item.targeter ?? '')}</Text><Text style={styles.meta}>发布者：{String(item.publisher ?? '')}</Text>
        <Text style={styles.content}>{String(item.content ?? '')}</Text>
        {Number(item.status) === 2 && <View style={styles.progressRow}><View style={styles.progressTrack}><View style={[styles.progress, { width: `${Math.min(100, Number(item.progress ?? 0))}%` }]} /></View><Text style={styles.progressText}>{String(item.progress ?? 0)}%</Text></View>}
      </Pressable>)}
      {items.length > 0 && <Pressable onPress={loadMore}><Text style={styles.noMore}>{isLast ? '~没有更多了~' : '加载更多'}</Text></Pressable>}
    </ScrollView>
    <AppFooter active="task" />
  </View>;
}

function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text><Text style={[styles.caret, active && styles.filterTextActive]}>⌄</Text></Pressable>;
}
