import { CAPTION_BOTTOM_GAP, PROGRESS_TRACK_HEIGHT, styles } from './play.styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from 'expo';
import { AppVideoView } from '@/components/video/AppVideoView';
import { useAppVideoPlayer } from '@/components/video/useAppVideoPlayer';
import { Image, PanResponder, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { VerticalSwipePager, type VerticalSwipePagerHandle } from '@/components/VerticalSwipePager';
import { goBackOrReplace } from '@/common/utils/goBack';
import { api, type ApiItem } from '@/lib/api';

type InlineVideo = ApiItem & { url?: string; desc?: unknown; publisher?: unknown; objectFit?: string };

const asIds = (value?: string) => {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const asInline = (value?: string) => {
  try {
    const list = JSON.parse(value ?? '[]');
    return Array.isArray(list) ? list as InlineVideo[] : [];
  } catch {
    return [];
  }
};

const plainText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
const textEllipsis = (value: string, max: number) => (value.length > max ? `${value.slice(0, max)}...` : value);
const isQueueMode = (value: string) => ['auto', 'menu', 'inline'].includes(value);

const findPrevVideo = (list: InlineVideo[], played: (string | number)[], mode: string) => {
  if (!isQueueMode(mode) || played.length === 0) return null;
  const prevId = played[played.length - 1];
  return list.find(item => String(item.id) === String(prevId)) ?? null;
};

export default function VideoPlayScreen() {
  const { mode = 'auto', id, ids, type } = useLocalSearchParams<{ mode?: string; id?: string; ids?: string; type?: string }>();
  const [allVideoList, setAllVideoList] = useState<InlineVideo[]>([]);
  const [playedIds, setPlayedIds] = useState<(string | number)[]>([]);
  const [currentVideo, setCurrentVideo] = useState<InlineVideo | null>(null);
  const [prevVideo, setPrevVideo] = useState<InlineVideo | null>(null);
  const [nextVideo, setNextVideo] = useState<InlineVideo | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [progressOverrideTime, setProgressOverrideTime] = useState<number | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const switchingRef = useRef(false);
  const pagerRef = useRef<VerticalSwipePagerHandle>(null);
  const videoUrl = currentVideo?.url ? String(currentVideo.url) : null;
  const player = useAppVideoPlayer(videoUrl, instance => { instance.timeUpdateEventInterval = 0.25; });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: false });
  const timeUpdate = useEvent(player, 'timeUpdate', { currentTime: 0, currentLiveTimestamp: 0, currentOffsetFromLive: 0, bufferedPosition: 0 });
  const reportedTime = timeUpdate?.currentTime ?? 0;

  useEffect(() => {
    if (progressOverrideTime == null || isDraggingProgress) return;
    if (Math.abs(reportedTime - progressOverrideTime) < 0.5) {
      setProgressOverrideTime(null);
    }
  }, [reportedTime, progressOverrideTime, isDraggingProgress]);

  const currentTime = progressOverrideTime ?? reportedTime;
  const duration = player.duration || 0;
  const progress = Math.min(100, currentTime / (duration || 1) * 100);
  const footerHeight = PROGRESS_TRACK_HEIGHT + Math.max(insets.bottom, 0);
  const captionBottom = footerHeight + CAPTION_BOTTOM_GAP;
  const isAuto = mode === 'auto';

  const collectPlayingIds = useCallback((prev: InlineVideo | null, current: InlineVideo | null, next: InlineVideo | null) => {
    const playing: (string | number)[] = [];
    if (prev?.id != null) playing.push(prev.id);
    if (current?.id != null) playing.push(current.id);
    if (next?.id != null) playing.push(next.id);
    return playing;
  }, []);

  const fetchNextVideo = useCallback(async (
    list: InlineVideo[],
    played: (string | number)[],
    current: InlineVideo | null,
    playingIds: (string | number)[],
    playMode: string,
  ) => {
    if (!current) return null;
    if (playMode === 'auto') {
      const video = await api.videoRandom({ type: type ?? undefined, playingIds, playedIds: played }).catch(() => null);
      if (video?.url) {
        setAllVideoList(prev => (prev.some(item => String(item.id) === String(video.id)) ? prev : [...prev, video as InlineVideo]));
        return video as InlineVideo;
      }
      return null;
    }
    if ((playMode === 'menu' || playMode === 'inline') && list.length > 1) {
      const currentIndex = list.findIndex(item => String(item.id) === String(current.id));
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % list.length;
        if (nextIndex !== currentIndex) return list[nextIndex];
      }
    }
    return null;
  }, [type]);

  const prefetchNext = useCallback(async (
    list: InlineVideo[],
    played: (string | number)[],
    current: InlineVideo | null,
    prev: InlineVideo | null,
    playMode: string,
  ) => {
    if (!current || playMode !== 'auto') return;
    const playingIds = collectPlayingIds(prev, current, null);
    const next = await fetchNextVideo(list, played, current, playingIds, playMode);
    if (next) setNextVideo(next);
  }, [collectPlayingIds, fetchNextVideo]);

  useEffect(() => {
    const init = async () => {
      try {
        let list: InlineVideo[] = [];
        let current: InlineVideo | null = null;
        let played: (string | number)[] = [];

        if (mode === 'inline') {
          list = asInline(ids);
          const currentIndex = Math.max(list.findIndex(item => String(item.id) === String(id)), 0);
          current = list[currentIndex] ?? null;
          played = list.slice(0, currentIndex).map(item => item.id!).filter(idValue => idValue != null);
        } else if (mode === 'menu') {
          list = (await api.videoByIds(asIds(ids))) ?? [];
          const currentIndex = Math.max(list.findIndex(item => String(item.id) === String(id)), 0);
          current = list[currentIndex] ?? null;
          played = list.slice(0, currentIndex).map(item => item.id!).filter(idValue => idValue != null);
        } else {
          current = id ? await api.video(id) as InlineVideo : null;
          list = current ? [current] : [];
        }

        if (!current?.url) {
          setCurrentVideo(null);
          return;
        }

        const prev = findPrevVideo(list, played, mode);
        const next = await fetchNextVideo(list, played, current, collectPlayingIds(prev, current, null), mode);
        setAllVideoList(list);
        setPlayedIds(played);
        setPrevVideo(prev);
        setCurrentVideo(current);
        setNextVideo(next);
        if (!next && mode === 'auto') void prefetchNext(list, played, current, prev, mode);
      } catch {
        setCurrentVideo(null);
      }
    };
    void init();
  }, [collectPlayingIds, fetchNextVideo, id, ids, mode, prefetchNext]);

  useEffect(() => {
    if (!videoUrl) return;
    setExpanded(false);
    setIsDraggingProgress(false);
    setProgressOverrideTime(null);
    const subscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay' && !player.playing) player.play();
    });
    return () => subscription.remove();
  }, [player, videoUrl]);

  const goNextVideo = useCallback(async () => {
    if (switchingRef.current || !currentVideo) return;
    if (!nextVideo && !isAuto) return;
    switchingRef.current = true;
    try {
      let target = nextVideo;
      if (!target && isAuto) {
        target = await fetchNextVideo(allVideoList, playedIds, currentVideo, collectPlayingIds(prevVideo, currentVideo, null), mode);
      }
      if (!target) return;

      const newPlayed = currentVideo.id != null ? [...playedIds, currentVideo.id] : playedIds;
      const newPrev = currentVideo;
      const newCurrent = target;
      setPlayedIds(newPlayed);
      setPrevVideo(newPrev);
      setCurrentVideo(newCurrent);
      setNextVideo(null);
      const playingIds = collectPlayingIds(newPrev, newCurrent, null);
      const next = await fetchNextVideo(allVideoList, newPlayed, newCurrent, playingIds, mode);
      setNextVideo(next);
      if (!next && isAuto) void prefetchNext(allVideoList, newPlayed, newCurrent, newPrev, mode);
    } finally {
      switchingRef.current = false;
    }
  }, [allVideoList, collectPlayingIds, currentVideo, fetchNextVideo, isAuto, mode, nextVideo, playedIds, prevVideo, prefetchNext]);

  const goPrevVideo = useCallback(() => {
    if (switchingRef.current || !prevVideo || !currentVideo) return;
    switchingRef.current = true;
    try {
      const newPlayed = playedIds.slice(0, -1);
      const newCurrent = prevVideo;
      const newNext = currentVideo;
      setPlayedIds(newPlayed);
      setCurrentVideo(newCurrent);
      setNextVideo(newNext);
      setPrevVideo(findPrevVideo(allVideoList, newPlayed, mode));
    } finally {
      switchingRef.current = false;
    }
  }, [allVideoList, currentVideo, mode, playedIds, prevVideo]);

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      void pagerRef.current?.animateToNext();
    });
    return () => subscription.remove();
  }, [player]);

  const canGoPrev = !!prevVideo;
  const canGoNext = isAuto ? true : !!nextVideo;

  const togglePlay = useCallback(() => {
    if (isPlaying) player.pause();
    else player.play();
  }, [isPlaying, player]);

  const applySeek = useCallback((locationX: number) => {
    if (!duration || !Number.isFinite(duration) || progressWidth <= 0) return;
    const time = Math.max(0, Math.min(duration, duration * locationX / progressWidth));
    setProgressOverrideTime(time);
    player.currentTime = time;
  }, [duration, player, progressWidth]);

  const sliderPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: event => {
      setIsDraggingProgress(true);
      applySeek(event.nativeEvent.locationX);
    },
    onPanResponderMove: event => {
      applySeek(event.nativeEvent.locationX);
    },
    onPanResponderRelease: event => {
      applySeek(event.nativeEvent.locationX);
      setIsDraggingProgress(false);
      if (!isPlaying) player.play();
    },
    onPanResponderTerminate: () => {
      setIsDraggingProgress(false);
    },
  }), [applySeek, isPlaying, player]);

  const renderSlide = useCallback((video: InlineVideo, role: 'prev' | 'current' | 'next') => {
    const cover = typeof video.cover === 'string' ? video.cover : undefined;
    const description = plainText((video as Record<string, unknown>).desc ?? video.desc);
    const publisher = String((video as Record<string, unknown>).publisher ?? video.publisher ?? '未知');
    const objectFit = (video as Record<string, unknown>).objectFit === 'contain' || video.objectFit === 'contain' ? 'contain' : 'cover';
    const isCurrent = role === 'current';
    const hint = role === 'prev' ? '下滑返回上一个' : role === 'next' ? '上滑切换到下一个' : undefined;

    return (
      <View style={styles.slidePage}>
        {cover && <Image source={{ uri: cover }} blurRadius={25} style={styles.background} />}
        <View style={styles.mask} />
        {isCurrent && (
          <>
            <View style={styles.videoStage}>
              <AppVideoView
                key={String(video.id)}
                player={player}
                style={styles.video}
                contentFit={objectFit}
                nativeControls={false}
                playsInline
              />
            </View>
            <Pressable style={styles.tapArea} onPress={togglePlay}>
              {!isPlaying && <Ionicons name="play" size={50} color="rgba(255,255,255,.7)" />}
            </Pressable>
          </>
        )}
        {!isCurrent && hint && <Text style={styles.swipeHint}>{hint}</Text>}
        <Pressable
          style={[styles.caption, { bottom: captionBottom }]}
          onPress={() => isCurrent && setExpanded(old => !old)}
        >
          <Text style={styles.publisher}>@{publisher}</Text>
          {!!description && (
            <Text style={styles.description} numberOfLines={isCurrent && expanded ? 12 : 2}>
              #{textEllipsis(description, isCurrent && expanded ? 240 : 64)}
            </Text>
          )}
        </Pressable>
      </View>
    );
  }, [captionBottom, expanded, isPlaying, player, togglePlay]);

  const swipePages = useMemo(() => {
    if (!currentVideo) return [];
    const pages = [];
    if (prevVideo && canGoPrev) {
      pages.push({ key: `prev-${prevVideo.id}`, content: renderSlide(prevVideo, 'prev') });
    }
    pages.push({ key: `current-${currentVideo.id}`, content: renderSlide(currentVideo, 'current') });
    if (nextVideo && canGoNext) {
      pages.push({ key: `next-${nextVideo.id}`, content: renderSlide(nextVideo, 'next') });
    } else if (canGoNext) {
      pages.push({ key: `next-placeholder-${currentVideo.id}`, content: renderSlide(nextVideo ?? currentVideo, 'next') });
    }
    return pages;
  }, [canGoNext, canGoPrev, currentVideo, nextVideo, prevVideo, renderSlide]);

  const swipeIndex = prevVideo && canGoPrev ? 1 : 0;

  if (!currentVideo) {
    return <View style={styles.loading}><Text style={styles.loadingText}>正在加载视频…</Text></View>;
  }

  return (
    <View style={styles.page}>
      <Pressable
        style={[styles.back, { top: insets.top + 4 }]}
        accessibilityRole="button"
        accessibilityLabel="返回"
        onPress={() => goBackOrReplace('/video')}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </Pressable>
      <VerticalSwipePager
        ref={pagerRef}
        style={{ flex: 1, marginBottom: footerHeight }}
        pages={swipePages}
        currentIndex={swipeIndex}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onGoPrev={goPrevVideo}
        onGoNext={() => void goNextVideo()}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) }]}>
        <View
          style={styles.progressTrack}
          onLayout={event => setProgressWidth(event.nativeEvent.layout.width)}
          {...sliderPanResponder.panHandlers}
        >
          <View style={styles.progress}>
            <View style={[styles.progressValue, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}
