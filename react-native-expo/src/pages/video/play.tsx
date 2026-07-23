import { styles } from './play.styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image, PanResponder, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

type InlineVideo = ApiItem & { url?: string; desc?: unknown; publisher?: unknown; objectFit?: string };

const asIds = (value?: string) => { try { const ids = JSON.parse(value ?? '[]'); return Array.isArray(ids) ? ids.map(String) : []; } catch { return []; } };
const asInline = (value?: string) => { try { const list = JSON.parse(value ?? '[]'); return Array.isArray(list) ? list as InlineVideo[] : []; } catch { return []; } };
const plainText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export default function VideoPlayScreen() {
  const { mode = 'auto', id, ids } = useLocalSearchParams<{ mode?: string; id?: string; ids?: string; type?: string }>();
  const [queue, setQueue] = useState<InlineVideo[]>([]);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(null, player => { player.timeUpdateEventInterval = 0.25; });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: false });
  const timeUpdate = useEvent(player, 'timeUpdate', { currentTime: 0, currentLiveTimestamp: 0, currentOffsetFromLive: 0, bufferedPosition: 0 });
  const currentTime = timeUpdate?.currentTime ?? 0;
  const current = queue[index];

  useEffect(() => {
    const load = async () => {
      try {
        if (mode === 'inline') {
          const list = asInline(ids);
          const target = list.findIndex(item => String(item.id) === String(id));
          setQueue(list);
          setIndex(Math.max(target, 0));
        } else if (mode === 'menu') {
          const list = await api.videoByIds(asIds(ids));
          const target = list.findIndex(item => String(item.id) === String(id));
          setQueue(list ?? []);
          setIndex(Math.max(target, 0));
        } else {
          const video = id ? await api.video(id) : undefined;
          setQueue(video ? [video] : []);
          setIndex(0);
        }
      } catch { setQueue([]); }
    };
    load();
  }, [mode, id, ids]);

  useEffect(() => {
    const url = current?.url;
    if (!url) return;
    setExpanded(false);
    player.replace(String(url));
    player.play();
  }, [current?.id, current?.url]);

  const move = (direction: -1 | 1) => {
    if (queue.length > 1) setIndex(old => (old + direction + queue.length) % queue.length);
  };
  const gestures = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 25 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => { if (gesture.dy < -50) move(1); if (gesture.dy > 50) move(-1); },
  }), [queue.length]);

  if (!current) return <View style={styles.loading}><Text style={styles.loadingText}>正在加载视频…</Text></View>;

  const cover = typeof current.cover === 'string' ? current.cover : undefined;
  const description = plainText((current as Record<string, unknown>).desc ?? current.desc);
  const objectFit = (current as Record<string, unknown>).objectFit === 'contain' || current.objectFit === 'contain' ? 'contain' : 'cover';
  const progress = Math.min(100, currentTime / (player.duration || 1) * 100);

  return (
    <View style={styles.page} {...gestures.panHandlers}>
      {cover && <Image source={{ uri: cover }} blurRadius={25} style={styles.background} />}
      <View style={styles.mask} />
      <VideoView player={player} style={styles.video} contentFit={objectFit} nativeControls={false} />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        </View>
        <Pressable style={styles.tapArea} onPress={() => isPlaying ? player.pause() : player.play()}>
          {!isPlaying && <Text style={styles.play}>▶</Text>}
        </Pressable>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <Pressable style={styles.caption} onPress={() => setExpanded(old => !old)}>
            <Text style={styles.publisher}>@{String((current as Record<string, unknown>).publisher ?? current.publisher ?? '未知')}</Text>
            <Text style={styles.description} numberOfLines={expanded ? 7 : 2}>{description}</Text>
            <Text style={styles.hint}>{expanded ? '收起' : '点击展开'} · 上滑下一条</Text>
          </Pressable>
          <Pressable
            style={styles.progress}
            onLayout={event => setProgressWidth(event.nativeEvent.layout.width)}
            onPress={event => {
              const duration = player.duration || 0;
              if (duration && progressWidth) player.currentTime = duration * event.nativeEvent.locationX / progressWidth;
            }}
          >
            <View style={[styles.progressValue, { width: `${progress}%` }]} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
