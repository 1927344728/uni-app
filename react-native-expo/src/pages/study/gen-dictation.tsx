import { styles } from './gen-dictation.styles';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

const DEFAULT_TIPS = [
  '听写前请先准备好铅笔与田字格本，保持桌面整洁，书写时坐姿端正，注意笔顺与占格。',
  '每个词语会朗读多遍并留出书写时间，请专心听清再动笔，写完后可对照屏幕自查。',
  '遇到不会写的字先留空或写拼音，全部完成后再回头补写，避免长时间停顿影响节奏。',
  '书写要求：字迹工整、大小适中，标点若需要请写在格内相应位置，保持卷面干净。',
  '若环境嘈杂，可佩戴耳机或靠近设备，确保能听清每一个音节与声调。',
  '家长陪伴时尽量只提示「再听一遍」，不要直接说出字形，让孩子独立回忆与书写。',
  '完成后对照词语自查：先查错别字，再查笔顺与拼音，最后朗读一遍巩固记忆。',
  '听写间隔可在听写页设置里调整，建议根据年级与熟练度逐步缩短间隔以提升反应速度。',
  '若语音无法播放，请检查浏览器或系统是否允许页面发声，并适当调高媒体音量。',
  '把本页生成的链接收藏或发给同伴，即可反复练习同一组词，巩固生字与词语搭配。',
];

const splitWords = (value: string) => value.split(/[\s,，、;；]+/).map(word => word.trim()).filter(Boolean);

export default function GenerateDictationScreen() {
  const [note, setNote] = useState(DEFAULT_TIPS[0]);
  const [tipIndex, setTipIndex] = useState(0);
  const [wordsInput, setWordsInput] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const routeForWords = () => {
    const words = splitWords(wordsInput);
    return words.length ? `/study/dictation?note=${encodeURIComponent(note)}&words=${encodeURIComponent(words.join(','))}` : '';
  };
  const copy = async (value: string) => {
    await Clipboard.setStringAsync(value);
    Alert.alert('提示', '已复制链接');
  };
  const generate = async () => {
    const route = routeForWords();
    if (!route) return Alert.alert('提示', '请至少输入一个词语');
    const url = `https://app.izhao.com.cn/index.html#${route}`;
    setGeneratedUrl(url);
    await copy(url);
  };
  const goDictation = () => {
    const route = routeForWords();
    if (!route) return Alert.alert('提示', '请至少输入一个词语');
    router.push(route as never);
  };

  return <SafeAreaView style={styles.page}>
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <View style={styles.field}>
        <Text style={styles.label}>温馨提示</Text>
        <TextInput value={note} onChangeText={setNote} multiline maxLength={100} textAlignVertical="top" style={styles.textarea} placeholder="请输入温馨提示（选填）。比如注意事项、书写要求、时间限制等" placeholderTextColor="#9ca3af" />
        <Pressable style={styles.tipButton} onPress={() => { const next = (tipIndex + 1) % DEFAULT_TIPS.length; setTipIndex(next); setNote(DEFAULT_TIPS[next]); }}><Text style={styles.tipText}>换一条默认文案</Text></Pressable>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>听写词语</Text>
        <TextInput value={wordsInput} onChangeText={setWordsInput} multiline maxLength={500} textAlignVertical="top" style={[styles.textarea, styles.words]} placeholder="请输入听写词语，总字数不超过 500。词语用逗号、顿号（中英均可）或空格分隔。例如：苹果,香蕉 书包、橡皮。" placeholderTextColor="#9ca3af" />
      </View>
      {!!generatedUrl && <Pressable onPress={() => copy(generatedUrl)} style={styles.preview}><Text style={styles.previewTitle}>听写小助手链接（点击复制）</Text><Text numberOfLines={3} style={styles.previewText}>{generatedUrl}</Text></Pressable>}
    </ScrollView>
    <View style={styles.bottom}><Text style={styles.hint}>输入听写词语，一键生成听写链接。转发给同学或家长，打开后就能按设置开始朗读听写，适合课堂小测与家庭练习。</Text><View style={styles.actions}><Pressable style={styles.clear} onPress={() => { setNote(''); setWordsInput(''); setGeneratedUrl(''); }}><Text style={styles.clearText}>清空</Text></Pressable><Pressable style={styles.go} onPress={goDictation}><Text style={styles.buttonText}>去听写</Text></Pressable><Pressable style={styles.generate} onPress={generate}><Text style={styles.buttonText}>生成链接并复制</Text></Pressable></View></View>
  </SafeAreaView>;
}
