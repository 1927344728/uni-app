import { styles } from './dictation.styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { pinyin } from 'pinyin-pro';
import { api } from '@/lib/api';

type Word = { word: string; pinyin: string };
type Status = 'pending' | 'active' | 'finished';
const gradeOptions = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: `${['一', '一', '二', '二', '三', '三', '四', '四', '五', '五', '六', '六'][index]}（${index % 2 ? '下' : '上'}）` }));
const splitWords = (value: string) => value.split(/[\s,，、;；]+/).map(word => word.trim()).filter(Boolean);
const wordItems = (words: string[]) => words.map(word => ({ word, pinyin: pinyin(word, { toneType: 'symbol' }) }));
const clamp = (value: string, min: number, max: number) => Math.max(min, Math.min(max, Number(value) || min));

export default function DictationScreen() {
  const { id, words: rawWords, note: rawNote } = useLocalSearchParams<{ id?: string; words?: string; note?: string }>();
  const note = useMemo(() => { try { return decodeURIComponent(rawNote ?? ''); } catch { return rawNote ?? ''; } }, [rawNote]);
  const initialWords = useMemo(() => { try { return splitWords(decodeURIComponent(rawWords ?? '')); } catch { return splitWords(rawWords ?? ''); } }, [rawWords]);
  const [allWords, setAllWords] = useState<Word[]>(() => wordItems(initialWords));
  const [selected, setSelected] = useState<string[]>(initialWords);
  const [status, setStatus] = useState<Status>('pending');
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [interval, setIntervalSeconds] = useState(20);
  const [grade, setGrade] = useState(1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const available = useMemo(() => allWords.map(item => item.word), [allWords]);
  const chosen = useMemo(() => allWords.filter(item => selected.includes(item.word)), [allWords, selected]);
  const clearTimer = () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  const stop = () => { clearTimer(); Speech.stop(); };
  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (initialWords.length || !id) return;
    api.words({ id, pageNum: 0, pageSize: 20 }).then(result => {
      const list = result.content ?? [];
      const first = String(list[0]?.words ?? '');
      const next = wordItems(splitWords(first));
      setAllWords(next); setSelected(next.map(item => item.word));
    }).catch(() => undefined);
  }, [id, initialWords.length]);
  useEffect(() => { if (note) Speech.speak(note, { language: 'zh-CN' }); }, [note]);

  const speakCurrent = (index = current) => {
    const item = chosen[index];
    if (!item) return;
    clearTimer();
    Speech.stop();
    Speech.speak(item.word, { language: 'zh-CN' });
    let repeats = 0;
    timer.current = setInterval(() => {
      repeats += 1;
      if (repeats < 3) Speech.speak(item.word, { language: 'zh-CN' });
      else { clearTimer(); advance(index); }
    }, Math.max(1000, (interval * 1000) / 4));
  };
  const advance = (index = current) => {
    stop();
    setCompleted(previous => new Set(previous).add(index));
    if (index + 1 >= chosen.length) { setStatus('finished'); setPaused(false); return; }
    setCurrent(index + 1);
    speakCurrent(index + 1);
  };
  const start = () => { if (!chosen.length) return; setStatus('active'); setCompleted(new Set()); setCurrent(0); setPaused(false); speakCurrent(0); };
  const restart = () => { stop(); setStatus('pending'); setCompleted(new Set()); setCurrent(0); setPaused(false); };
  const togglePause = () => {
    if (paused) { setPaused(false); speakCurrent(); } else { clearTimer(); Speech.stop(); setPaused(true); }
  };
  const randomizeCount = (value: string) => {
    const count = clamp(value, 1, available.length || 1);
    const pool = [...available].sort(() => Math.random() - .5);
    setSelected(pool.slice(0, count));
  };
  const visible = status === 'active' ? chosen.filter((_, index) => completed.has(index)) : chosen;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        {note ? (
          <View style={styles.note}>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ) : null}
        {!allWords.length ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>暂无词语</Text>
            <Text style={styles.emptyText}>请打开设置弹层选择词语。</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {visible.map((item, index) => (
              <Pressable
                key={`${item.word}-${index}`}
                onPress={() => { stop(); Speech.speak(item.word, { language: 'zh-CN' }); }}
                style={[
                  styles.card,
                  status === 'active' && styles.done,
                  status === 'finished' && !completed.has(index) && styles.todo,
                ]}
              >
                <Text style={styles.cardWord}>{item.word}</Text>
                <Text numberOfLines={1} style={styles.cardPinyin}>{item.pinyin}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.bottom}>
        {chosen.length ? (
          <Text style={styles.progress}>
            当前共 <Text style={styles.progressNum}>{chosen.length}</Text> 个
            {status === 'active' ? (
              <>，已完成 <Text style={styles.progressNum}>{completed.size}</Text> 个，剩余 <Text style={styles.progressNum}>{Math.max(0, chosen.length - completed.size)}</Text> 个</>
            ) : null}
          </Text>
        ) : null}
        <View style={styles.actions}>
          {status === 'pending' ? (
            <>
              <Pressable style={styles.outline} onPress={() => setSettingsVisible(true)}>
                <Text>设置</Text>
              </Pressable>
              <Pressable style={[styles.primary, !chosen.length && styles.disabled]} onPress={start}>
                <Text style={styles.buttonText}>开始听写</Text>
              </Pressable>
            </>
          ) : status === 'active' ? (
            <>
              <Pressable style={styles.danger} onPress={() => { stop(); setStatus('finished'); }}>
                <Text style={styles.dangerText}>结束</Text>
              </Pressable>
              <Pressable style={styles.warning} onPress={togglePause}>
                <Text style={styles.warningText}>{paused ? '继续' : '暂停'}</Text>
              </Pressable>
              <Pressable style={[styles.primary, paused && styles.disabled]} onPress={() => !paused && advance()}>
                <Text style={styles.buttonText}>下一个</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.primary} onPress={restart}>
              <Text style={styles.buttonText}>重新开始</Text>
            </Pressable>
          )}
        </View>
      </View>
      <Modal visible={settingsVisible} transparent animationType="slide" onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.mask}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>设置</Text>
            <ScrollView contentContainerStyle={styles.sheetBody}>
              <Text style={styles.fieldLabel}>间隔时间</Text>
              <TextInput
                value={String(interval)}
                onChangeText={value => setIntervalSeconds(clamp(value, 1, 120))}
                keyboardType="number-pad"
                style={styles.input}
                placeholder="请输入词语听写的间隔时间（秒）"
              />
              <Text style={styles.fieldLabel}>年级</Text>
              <View style={styles.chips}>
                {gradeOptions.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => setGrade(option.value)}
                    style={[styles.chip, grade === option.value && styles.chipActive]}
                  >
                    <Text style={grade === option.value && styles.chipActiveText}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.fieldLabel}>词语数量</Text>
              <TextInput
                value={String(selected.length)}
                onEndEditing={event => randomizeCount(event.nativeEvent.text)}
                keyboardType="number-pad"
                style={styles.input}
              />
              <Text style={styles.fieldLabel}>选择词语</Text>
              <View style={styles.chips}>
                {available.map(word => (
                  <Pressable
                    key={word}
                    onPress={() => setSelected(old => old.includes(word) ? old.filter(item => item !== word) : [...old, word])}
                    style={[styles.chip, selected.includes(word) && styles.chipActive]}
                  >
                    <Text style={selected.includes(word) && styles.chipActiveText}>{word}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={styles.sheetActions}>
              <Pressable style={styles.outline} onPress={() => setSettingsVisible(false)}>
                <Text>取消</Text>
              </Pressable>
              <Pressable
                style={styles.primary}
                onPress={() => {
                  if (!selected.length) return Alert.alert('提示', '请至少选择一个词语');
                  restart();
                  setSettingsVisible(false);
                }}
              >
                <Text style={styles.buttonText}>确认</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
