import { styles } from './play.styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, PanResponder, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { api, type ApiItem } from '@/lib/api';

const asIds = (value?: string) => { try { const ids = JSON.parse(value ?? '[]'); return Array.isArray(ids) ? ids.map(String) : []; } catch { return []; } };
const imageUri = (value: unknown) => typeof value === 'string' ? value : undefined;
const formatTime = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
const lyrics = (value: unknown) => typeof value === 'string' ? value.split('\n').map(line => { const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/); return match ? { time: Number(match[1]) * 60 + Number(match[2]), text: match[3].trim() } : null; }).filter((line): line is { time: number; text: string } => !!line) : [];

export default function MusicPlayScreen() {
  const { mode = 'auto', id, ids, type } = useLocalSearchParams<{ mode?: string; id?: string; ids?: string; type?: string }>();
  const [queue, setQueue] = useState<ApiItem[]>([]);
  const [index, setIndex] = useState(0);
  const [timerVisible, setTimerVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const player = useAudioPlayer(null, { updateInterval: 300 });
  const status = useAudioPlayerStatus(player);
  const current = queue[index];
  const parsedLyrics = useMemo(() => lyrics(current && (current as Record<string, unknown>).lyric), [current]);
  const activeLyric = parsedLyrics.reduce((result, line, lineIndex) => status.currentTime >= line.time ? lineIndex : result, 0);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' }).catch(() => undefined);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    const load = async () => {
      try {
        if (mode === 'menu') {
          const list = await api.musicByIds(asIds(ids));
          setQueue(list ?? []); setIndex(0);
        } else {
          const song = id ? await api.music(id) : undefined;
          setQueue(song ? [song] : []); setIndex(0);
        }
      } catch { setQueue([]); }
    };
    load();
  }, [mode, id, ids]);
  useEffect(() => {
    const url = current?.url;
    if (!url) return;
    player.replace(String(url));
    player.play();
  }, [current?.id]);
  useEffect(() => {
    if (status.didJustFinish && queue.length > 1) setIndex(old => (old + 1) % queue.length);
  }, [status.didJustFinish]);

  const move = (direction: -1 | 1) => {
    if (mode === 'menu' && queue.length > 1) setIndex(old => (old + direction + queue.length) % queue.length);
  };
  const gestures = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 25 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => { if (gesture.dy < -50) move(1); if (gesture.dy > 50) move(-1); },
  }), [queue.length, mode]);
  const selectTimer = (minutes: number) => {
    if (timer.current) clearTimeout(timer.current);
    if (minutes) timer.current = setTimeout(() => player.pause(), minutes * 60_000);
    setTimerVisible(false);
  };

  if (!current) return <View style={styles.loading}><Text>正在加载音乐…</Text></View>;
  const cover = imageUri(current.cover);
  return <View style={styles.page} {...gestures.panHandlers}>
    {cover && <Image source={{ uri: cover }} blurRadius={30} style={styles.background} />}
    <View style={styles.mask} />
    <SafeAreaView style={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></Pressable>
      <Pressable style={styles.settings} onPress={() => setTimerVisible(true)}><Text style={styles.settingsText}>⚙</Text></Pressable>
      <View style={styles.hero}>
        {cover ? <Image source={{ uri: cover }} style={styles.artwork} /> : <View style={styles.artwork} />}
        <Text numberOfLines={1} style={styles.title}>{String(current.title ?? '')}</Text>
        <Text style={styles.artist}>{String((current as Record<string, unknown>).singer ?? '未知歌手')}</Text>
      </View>
      <ScrollView style={styles.lyricScroll} contentContainerStyle={styles.lyrics}>
        {parsedLyrics.length ? parsedLyrics.map((line, lineIndex) => <Text key={`${line.time}-${lineIndex}`} style={[styles.lyric, activeLyric === lineIndex && styles.lyricActive]}>{line.text}</Text>) : <Text style={styles.lyric}>暂无歌词</Text>}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.progress}><Text style={styles.time}>{formatTime(status.currentTime)}</Text><Pressable style={styles.slider} onPress={event => { if (status.duration) player.currentTime = Math.max(0, Math.min(status.duration, status.duration * event.nativeEvent.locationX / 220)); }}><View style={[styles.trackFill, { width: `${Math.min(100, status.currentTime / (status.duration || 1) * 100)}%` }]} /></Pressable><Text style={styles.time}>{formatTime(status.duration)}</Text></View>
        <View style={styles.controls}><Pressable disabled={mode !== 'menu' || queue.length < 2} onPress={() => move(-1)} style={styles.skip}><Text style={styles.controlText}>上一曲</Text></Pressable><Pressable onPress={() => status.playing ? player.pause() : player.play()} style={styles.play}><Text style={styles.playText}>{status.playing ? 'Ⅱ' : '▶'}</Text></Pressable><Pressable disabled={mode !== 'menu' || queue.length < 2} onPress={() => move(1)} style={styles.skip}><Text style={styles.controlText}>下一曲</Text></Pressable></View>
      </View>
    </SafeAreaView>
    <Modal transparent visible={timerVisible} animationType="slide" onRequestClose={() => setTimerVisible(false)}><Pressable style={styles.modalMask} onPress={() => setTimerVisible(false)}><View style={styles.sheet}><Text style={styles.sheetTitle}>定时关闭</Text><View style={styles.pills}>{[0, 10, 20, 30, 60, 90].map(minutes => <Pressable key={minutes} style={styles.pill} onPress={() => selectTimer(minutes)}><Text style={styles.pillText}>{minutes === 0 ? '关闭' : minutes}</Text></Pressable>)}</View></View></Pressable></Modal>
  </View>;
}
