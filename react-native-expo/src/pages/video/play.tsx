import { styles } from './play.styles';
import { useEffect, useMemo, useState } from 'react';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image, PanResponder, Pressable, SafeAreaView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

const asIds = (value?: string) => { try { const ids = JSON.parse(value ?? '[]'); return Array.isArray(ids) ? ids.map(String) : []; } catch { return []; } };
const plainText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export default function VideoPlayScreen() {
  const { mode = 'auto', id, ids, type } = useLocalSearchParams<{ mode?: string; id?: string; ids?: string; type?: string }>();
  const [queue, setQueue] = useState<ApiItem[]>([]);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const player = useVideoPlayer(null, player => { player.timeUpdateEventInterval = 0.25; });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: false });
  const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: 0 });
  const { status } = useEvent(player, 'statusChange', { status: 'idle' });
  const current = queue[index];

  useEffect(() => {
    const load = async () => {
      try {
        if (mode === 'menu') {
          const list = await api.videoByIds(asIds(ids));
          const target = list.findIndex(item => String(item.id) === String(id));
          setQueue(list ?? []); setIndex(Math.max(target, 0));
        } else {
          const video = id ? await api.video(id) : undefined;
          setQueue(video ? [video] : []); setIndex(0);
        }
      } catch { setQueue([]); }
    };
    load();
  }, [mode, id, ids]);
  useEffect(() => {
    if (!current?.url) return;
    setExpanded(false);
    player.replace(String(current.url));
    player.play();
  }, [current?.id]);
  const move = (direction: -1 | 1) => {
    if (mode === 'menu' && queue.length > 1) setIndex(old => (old + direction + queue.length) % queue.length);
  };
  const gestures = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 25 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => { if (gesture.dy < -50) move(1); if (gesture.dy > 50) move(-1); },
  }), [queue.length, mode]);
  useEffect(() => { if (status === 'idle' && current && !isPlaying && player.currentTime > 0) move(1); }, [status]);

  if (!current) return <View style={styles.loading}><Text>正在加载视频…</Text></View>;
  const cover = typeof current.cover === 'string' ? current.cover : undefined;
  const description = plainText((current as Record<string, unknown>).desc);
  return <View style={styles.page} {...gestures.panHandlers}>
    {cover && <Image source={{ uri: cover }} blurRadius={28} style={styles.background} />}
    <View style={styles.mask} />
    <VideoView player={player} style={styles.video} contentFit={(current as Record<string, unknown>).objectFit === 'contain' ? 'contain' : 'cover'} nativeControls={false} />
    <SafeAreaView style={styles.overlay}>
      <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></Pressable>
      <Pressable style={styles.tapArea} onPress={() => isPlaying ? player.pause() : player.play()}>{!isPlaying && <Text style={styles.play}>▶</Text>}</Pressable>
      <Pressable style={styles.caption} onPress={() => setExpanded(old => !old)}><Text style={styles.publisher}>@{String((current as Record<string, unknown>).publisher ?? '未知')}</Text><Text style={styles.description} numberOfLines={expanded ? 7 : 2}>{description}</Text><Text style={styles.hint}>{expanded ? '收起' : '点击展开'} · 上滑下一条</Text></Pressable>
      <Pressable style={styles.progress} onPress={event => { const duration = player.duration || 0; if (duration) player.currentTime = duration * event.nativeEvent.locationX / 360; }}><View style={[styles.progressValue, { width: `${Math.min(100, currentTime / (player.duration || 1) * 100)}%` }]} /></Pressable>
    </SafeAreaView>
  </View>;
}
