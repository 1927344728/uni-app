import { styles } from './article.styles';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

function thumbnail(uri: unknown) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/120x` : undefined;
}

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const [items, setItems] = useState<ApiItem[]>([]);
  const [categories, setCategories] = useState<ApiItem[]>([]);
  const [type, setType] = useState<string | undefined>(params.type);
  const [keyword, setKeyword] = useState('');
  const [pageNum, setPageNum] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const options = useMemo(() => categories.filter(item => Number(item.categoryId) === 1).filter((item, index, all) => all.findIndex(value => value.typeId === item.typeId) === index), [categories]);

  useEffect(() => { api.categories().then(value => setCategories(value ?? [])).catch(() => setCategories([])); }, []);
  const load = (page: number, append = false) => api.articlePage({ type, keyword, pageNum: page, pageSize: 15 }).then(value => {
    const next = value.content ?? [];
    setItems(current => append ? [...current, ...next] : next);
    setPageNum(page);
    setIsLast(next.length < 15);
  }).catch(() => { if (!append) setItems([]); setIsLast(true); });
  useEffect(() => { const timer = setTimeout(() => load(0), 200); return () => clearTimeout(timer); }, [type, keyword]);

  return <View style={styles.page}>
    <View style={styles.toolbar}>
      {options.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.types}><Pressable onPress={() => setType(undefined)}><Text style={[styles.type, !type && styles.typeActive]}>全部</Text></Pressable>{options.map(option => <Pressable key={String(option.typeId)} onPress={() => setType(String(option.typeId))}><Text style={[styles.type, type === String(option.typeId) && styles.typeActive]}>{String(option.typeName ?? '')}</Text></Pressable>)}</ScrollView>}
      <TextInput value={keyword} onChangeText={setKeyword} placeholder="请输入搜索词" placeholderTextColor="#b3b3b3" style={styles.search} />
    </View>
    <ScrollView contentContainerStyle={styles.list}>
      {items.map(item => <Pressable key={String(item.id)} onPress={() => router.push(`/article/detail?id=${item.id}`)} style={styles.item}>
        <Image source={{ uri: thumbnail(item.thumb) }} style={styles.thumb} />
        <View style={styles.itemInfo}><Text numberOfLines={1} style={[styles.itemTitle, item.className === 'active' && styles.itemActive]}>{String(item.title ?? '')}</Text><Text numberOfLines={2} style={[styles.note, item.className === 'active' && styles.itemActive]}>{String(item.note ?? '')}</Text></View><Text style={styles.chevron}>›</Text>
      </Pressable>)}
      {!items.length && isLast && <Text style={styles.empty}>~什么都没有哦~</Text>}
      {!!items.length && <Pressable onPress={() => !isLast && load(pageNum + 1, true)}><Text style={styles.more}>{isLast ? '~没有更多了哦~' : '加载更多'}</Text></Pressable>}
    </ScrollView>
  </View>;
}
