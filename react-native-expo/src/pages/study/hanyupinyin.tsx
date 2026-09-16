import { styles } from './hanyupinyin.styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

type Type = 'all' | 'shengmu' | 'yunmu' | 'whole';
type Pinyin = { value: string; name: string; type: Exclude<Type, 'all'> };
const types: { value: Type; name: string }[] = [
  { value: 'all', name: '全部（63）' },
  { value: 'shengmu', name: '声母（23）' },
  { value: 'yunmu', name: '韵母（24）' },
  { value: 'whole', name: '整体认读（16）' },
];
const make = (value: string, name: string, type: Pinyin['type']): Pinyin => ({ value, name, type });
const entries: Pinyin[] = [
  ...'b p m f d t n l g k h j q x zh ch sh r z c s y w'.split(' ').map((value, index) => make(value, '播 坡 摸 佛 得 特 讷 勒 哥 科 喝 鸡 旗 兮 知 吃 狮 日 字 此 思 衣 乌'.split(' ')[index], 'shengmu')),
  ...'a o e i u ü ai ei ui ao ou iu ie üe er an en in un ün ang eng ing ong'.split(' ').map((value, index) => make(value, '啊 哦 额 医 乌 鱼 唉 诶 危 嗷 鸥 于 耶 曰 耳 安 摁 音 温 云 昂 嗯 英 钟'.split(' ')[index], 'yunmu')),
  ...'zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying'.split(' ').map((value, index) => make(value, '蜘 吃 狮 日 字 此 思 衣 乌 鱼 椰 约 渊 印 云 鹰'.split(' ')[index], 'whole')),
];

export default function HanyuPinyinScreen() {
  const [type, setType] = useState<Type>('all');
  const [selected, setSelected] = useState<string | null>('b');
  const [search, setSearch] = useState('');
  const [playingAll, setPlayingAll] = useState(false);
  const cancelled = useRef(false);
  const shown = useMemo(() => search ? entries.filter(item => item.value === search.trim()) : type === 'all' ? entries : entries.filter(item => item.type === type), [type, search]);
  const stop = () => { cancelled.current = true; setPlayingAll(false); setSelected(null); Speech.stop(); };
  useEffect(() => () => { Speech.stop(); }, []);
  const speak = (value: string, onDone?: () => void) => { Speech.stop(); Speech.speak(value === 'ü' ? '鱼' : value, { language: 'zh-CN', onDone, onError: onDone }); };
  const select = (item: Pinyin) => { cancelled.current = true; setPlayingAll(false); setSelected(item.value); setSearch(''); speak(item.name); };
  const playAll = () => {
    if (!shown.length) return;
    cancelled.current = false; setPlayingAll(true);
    const start = Math.max(0, shown.findIndex(item => item.value === selected));
    const next = (index: number) => {
      if (cancelled.current || !shown[index]) { setPlayingAll(false); return; }
      setSelected(shown[index].value);
      speak(shown[index].name, () => setTimeout(() => next(index + 1), 500));
    };
    next(start);
  };

  const selectType = (option: (typeof types)[number]) => {
    stop();
    setType(option.value);
    setSearch('');
    const first = option.value === 'all' ? entries[0] : entries.find(item => item.type === option.value);
    setSelected(first?.value ?? null);
  };

  const searchPinyin = () => {
    const item = entries.find(entry => entry.value === search.trim());
    setSelected(item?.value ?? null);
  };

  return (
    <SafeAreaView style={styles.page} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.heading}>汉语拼音发音学习</Text>
          <Text style={styles.description}>点击任意拼音即可播放发音</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.categories}>
            {types.map(option => (
              <Pressable
                key={option.value}
                onPress={() => selectType(option)}
                style={[styles.category, type === option.value && styles.categoryActive]}
              >
                <Text style={[styles.categoryText, type === option.value && styles.white]}>{option.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.search}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={searchPinyin}
              placeholder="搜索拼音..."
              style={styles.input}
            />
            <Pressable style={styles.searchButton} onPress={searchPinyin}>
              <Text style={styles.white}>搜索</Text>
            </Pressable>
          </View>
          <View style={styles.controls}>
            <Pressable
              style={[styles.playButton, !selected && styles.disabled]}
              onPress={() => selected ? speak(entries.find(item => item.value === selected)?.name ?? selected) : Alert.alert('提示', '请选择拼音')}
            >
              <Text style={styles.white}>播放选中</Text>
            </Pressable>
            <Pressable style={styles.stopButton} onPress={stop}>
              <Text style={styles.white}>停止</Text>
            </Pressable>
            <Pressable style={[styles.allButton, !shown.length && styles.disabled]} onPress={playAll}>
              <Text style={styles.white}>{playingAll ? '正在播放' : '播放全部'}</Text>
            </Pressable>
          </View>
          <View style={styles.grid}>
            {shown.map(item => (
              <Pressable
                key={item.value}
                style={[styles.item, selected === item.value && styles.itemActive]}
                onPress={() => select(item)}
              >
                <Text style={[styles.pinyin, selected === item.value && styles.white]}>{item.value}</Text>
                <Text style={[styles.character, selected === item.value && styles.white]}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.tips}>共 {entries.length} 个拼音，当前显示 {shown.length} 个</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
