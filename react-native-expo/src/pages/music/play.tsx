import { styles, FOOTER_HEIGHT, SETTINGS_BAR_HEIGHT } from './play.styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, PanResponder, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { VerticalSwipePager, type VerticalSwipePagerHandle } from '@/components/VerticalSwipePager';
import { goBackOrReplace } from '@/common/utils/goBack';
import { activeLyricIndex, parseLyric, type LyricLine } from '@/common/utils/lyric';
import { api, type ApiItem } from '@/lib/api';

const asIds = (value?: string) => { try { const ids = JSON.parse(value ?? '[]'); return Array.isArray(ids) ? ids.map(String) : []; } catch { return []; } };
const imageUri = (value: unknown) => typeof value === 'string' ? value : undefined;
const formatTime = (value: number) => {
  const seconds = Math.floor(value || 0);
  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;
  return `${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`;
};
const LYRIC_LINE_HEIGHT = 34;
const lyricScrollGesture = Gesture.Native();

export default function MusicPlayScreen() {
  const { mode = 'auto', id, ids, type } = useLocalSearchParams<{ mode?: string; id?: string; ids?: string; type?: string }>();
  const [menuQueue, setMenuQueue] = useState<ApiItem[]>([]);
  const [menuIndex, setMenuIndex] = useState(0);
  const [playedIds, setPlayedIds] = useState<(string | number)[]>([]);
  const [autoCurrent, setAutoCurrent] = useState<ApiItem | null>(null);
  const [autoHistory, setAutoHistory] = useState<ApiItem[]>([]);
  const [autoUpcoming, setAutoUpcoming] = useState<ApiItem[]>([]);
  const [timerVisible, setTimerVisible] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [sliderOverrideTime, setSliderOverrideTime] = useState<number | null>(null);
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lyricScrollRef = useRef<ScrollView>(null);
  const switchingRef = useRef(false);
  const pagerRef = useRef<VerticalSwipePagerHandle>(null);
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer(null, { updateInterval: 300 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (sliderOverrideTime == null || isDraggingSlider) return;
    if (Math.abs(status.currentTime - sliderOverrideTime) < 0.5) {
      setSliderOverrideTime(null);
    }
  }, [status.currentTime, sliderOverrideTime, isDraggingSlider]);

  const isAuto = mode === 'auto';
  const isMenu = mode === 'menu';
  const current = isAuto ? autoCurrent : menuQueue[menuIndex];
  const activeLyric = activeLyricIndex(parsedLyrics, status.currentTime);
  const footerOffset = FOOTER_HEIGHT + insets.bottom;
  const settingsBottom = footerOffset + 4;
  const canGoPrev = isMenu ? playedIds.length > 0 : autoHistory.length > 0;
  const canGoNext = isMenu ? menuQueue.length > 1 : true;

  const prevSong = isMenu
    ? (playedIds.length > 0 ? menuQueue[menuIndex - 1] ?? null : null)
    : (autoHistory.length > 0 ? autoHistory[autoHistory.length - 1] : null);
  const nextSong = isMenu
    ? (menuQueue.length > 1 ? menuQueue[(menuIndex + 1) % menuQueue.length] : null)
    : (autoUpcoming[0] ?? null);

  const collectPlayingIds = useCallback((history: ApiItem[], currentSong: ApiItem | null, upcoming: ApiItem[]) => {
    const idSet = new Set<string>();
    history.forEach(item => item.id != null && idSet.add(String(item.id)));
    if (currentSong?.id != null) idSet.add(String(currentSong.id));
    upcoming.forEach(item => item.id != null && idSet.add(String(item.id)));
    return [...idSet];
  }, []);

  const fetchAutoSong = useCallback(async (history: ApiItem[], currentSong: ApiItem | null, upcoming: ApiItem[]) => {
    const played = history.map(item => String(item.id));
    const playingIds = collectPlayingIds(history, currentSong, upcoming);
    return api.musicRandom({ type: type ?? undefined, playingIds, playedIds: played }).catch(() => null);
  }, [collectPlayingIds, type]);

  const prefetchAuto = useCallback(async (history: ApiItem[], currentSong: ApiItem | null, upcoming: ApiItem[]) => {
    if (!isAuto || upcoming.length > 0) return;
    const song = await fetchAutoSong(history, currentSong, upcoming);
    if (song?.url) setAutoUpcoming(prev => (prev.length ? prev : [song]));
  }, [fetchAutoSong, isAuto]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      try {
        player.setActiveForLockScreen(false);
      } catch {
        // ignore
      }
    };
  }, [player]);

  useEffect(() => {
    const load = async () => {
      try {
        if (isMenu) {
          const list = await api.musicByIds(asIds(ids));
          const start = Math.max(list?.findIndex(item => String(item.id) === String(id)) ?? 0, 0);
          setMenuQueue(list ?? []);
          setMenuIndex(start);
          setPlayedIds((list ?? []).slice(0, start).map(item => item.id!).filter(value => value != null));
          return;
        }
        const song = id ? await api.music(id) : undefined;
        setAutoCurrent(song ?? null);
        setAutoHistory([]);
        setAutoUpcoming([]);
        setPlayedIds([]);
        if (song) void prefetchAuto([], song, []);
      } catch {
        setMenuQueue([]);
        setAutoCurrent(null);
      }
    };
    void load();
  }, [id, ids, isMenu, prefetchAuto]);

  useEffect(() => {
    const url = current?.url;
    if (!url || !current) return;
    setSliderOverrideTime(null);
    setIsDraggingSlider(false);
    player.replace(String(url));
    player.setActiveForLockScreen(true, {
      title: String(current.title ?? ''),
      artist: String((current as Record<string, unknown>).singer ?? '未知歌手'),
      artworkUrl: imageUri(current.cover),
    });
    player.play();
  }, [current?.id]);

  const goNext = useCallback(async () => {
    if (switchingRef.current) return;
    if (isMenu) {
      if (menuQueue.length < 2 || !current) return;
      switchingRef.current = true;
      try {
        if (current.id != null) setPlayedIds(prev => [...prev, current.id]);
        setMenuIndex(old => (old + 1) % menuQueue.length);
      } finally {
        switchingRef.current = false;
      }
      return;
    }
    if (!autoCurrent) return;
    switchingRef.current = true;
    try {
      let next = autoUpcoming[0];
      if (!next) next = await fetchAutoSong(autoHistory, autoCurrent, autoUpcoming);
      if (!next?.url) return;
      const nextHistory = [...autoHistory, autoCurrent];
      const nextUpcoming = autoUpcoming.slice(1);
      setAutoHistory(nextHistory);
      setAutoCurrent(next);
      setAutoUpcoming(nextUpcoming);
      void prefetchAuto(nextHistory, next, nextUpcoming);
    } finally {
      switchingRef.current = false;
    }
  }, [autoCurrent, autoHistory, autoUpcoming, current, fetchAutoSong, isMenu, menuQueue.length, prefetchAuto]);

  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  useEffect(() => {
    if (!status.didJustFinish) return;
    if (isMenu && menuQueue.length > 1) void pagerRef.current?.animateToNext();
    else if (isAuto) void pagerRef.current?.animateToNext();
  }, [status.didJustFinish, isMenu, isAuto, menuQueue.length]);

  useEffect(() => {
    let cancelled = false;
    setParsedLyrics([]);
    const lyricSource = current ? (current as Record<string, unknown>).lyric : undefined;
    void parseLyric(lyricSource).then(lines => {
      if (!cancelled) setParsedLyrics(lines);
    });
    return () => { cancelled = true; };
  }, [current?.id]);

  useEffect(() => {
    if (!parsedLyrics.length) return;
    lyricScrollRef.current?.scrollTo({
      y: Math.max(0, activeLyric * LYRIC_LINE_HEIGHT - 80),
      animated: true,
    });
  }, [activeLyric, parsedLyrics.length]);

  const goPrev = useCallback(() => {
    if (switchingRef.current) return;
    if (isMenu) {
      if (!playedIds.length || menuIndex === 0) return;
      switchingRef.current = true;
      try {
        setPlayedIds(prev => prev.slice(0, -1));
        setMenuIndex(old => old - 1);
      } finally {
        switchingRef.current = false;
      }
      return;
    }
    if (!autoHistory.length || !autoCurrent) return;
    switchingRef.current = true;
    const prev = autoHistory[autoHistory.length - 1];
    setAutoHistory(history => history.slice(0, -1));
    setAutoUpcoming(upcoming => [autoCurrent, ...upcoming]);
    setAutoCurrent(prev);
    switchingRef.current = false;
  }, [autoCurrent, autoHistory, isMenu, menuIndex, playedIds.length]);

  const selectTimer = (minutes: number) => {
    if (timer.current) clearTimeout(timer.current);
    if (minutes) timer.current = setTimeout(() => player.pause(), minutes * 60_000);
    setTimerVisible(false);
  };

  const resolveSeekTime = useCallback((locationX: number) => {
    const duration = status.duration;
    if (!duration || !Number.isFinite(duration) || sliderWidth <= 0) return null;
    return Math.max(0, Math.min(duration, duration * locationX / sliderWidth));
  }, [sliderWidth, status.duration]);

  const previewSeek = useCallback((locationX: number) => {
    const time = resolveSeekTime(locationX);
    if (time == null) return;
    setSliderOverrideTime(time);
  }, [resolveSeekTime]);

  const commitSeek = useCallback((locationX: number) => {
    const time = resolveSeekTime(locationX);
    if (time == null) return;
    setSliderOverrideTime(time);
    void player.seekTo(time);
  }, [player, resolveSeekTime]);

  const sliderPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: event => {
      setIsDraggingSlider(true);
      previewSeek(event.nativeEvent.locationX);
    },
    onPanResponderMove: event => {
      previewSeek(event.nativeEvent.locationX);
    },
    onPanResponderRelease: event => {
      commitSeek(event.nativeEvent.locationX);
      setIsDraggingSlider(false);
    },
    onPanResponderTerminate: () => {
      setIsDraggingSlider(false);
    },
  }), [commitSeek, previewSeek]);

  const renderSlide = useCallback((song: ApiItem, hint?: string, showLyrics = false) => {
    const cover = imageUri(song.cover);
    return (
      <View style={styles.slidePage}>
        {cover && <Image source={{ uri: cover }} blurRadius={30} style={styles.slideBackground} />}
        <View style={styles.slideMask} />
        <View style={[styles.slideBody, { paddingBottom: footerOffset + SETTINGS_BAR_HEIGHT }]}>
          <View style={styles.hero}>
            {cover ? <Image source={{ uri: cover }} style={styles.artwork} /> : <View style={styles.artwork} />}
            <View style={styles.titles}>
              <Text numberOfLines={1} style={styles.title}>{String(song.title ?? '')}</Text>
              <Text style={styles.artist}>{String((song as Record<string, unknown>).singer ?? '未知歌手')}</Text>
            </View>
          </View>
          <View style={styles.lyricBox}>
            {showLyrics ? (
              parsedLyrics.length ? (
                <GestureDetector gesture={lyricScrollGesture}>
                  <ScrollView
                    ref={lyricScrollRef}
                    style={styles.lyricScroll}
                    contentContainerStyle={styles.lyricContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {parsedLyrics.map((line, lineIndex) => (
                      <Text key={`${line.time}-${lineIndex}`} style={[styles.lyric, activeLyric === lineIndex && styles.lyricActive]}>
                        {line.text}
                      </Text>
                    ))}
                  </ScrollView>
                </GestureDetector>
              ) : (
                <Text style={styles.lyricEmpty}>暂无歌词</Text>
              )
            ) : (
              <Text style={styles.swipeHint}>{hint}</Text>
            )}
          </View>
        </View>
      </View>
    );
  }, [activeLyric, footerOffset, parsedLyrics]);

  const swipePages = useMemo(() => {
    if (!current) return [];
    const pages = [];
    if (prevSong && canGoPrev) {
      pages.push({ key: `prev-${prevSong.id}`, content: renderSlide(prevSong, '下滑返回当前歌曲') });
    }
    pages.push({ key: `current-${current.id}`, content: renderSlide(current, undefined, true) });
    if (nextSong && canGoNext) {
      pages.push({ key: `next-${nextSong.id}`, content: renderSlide(nextSong, '上滑切换到下一首') });
    } else if (canGoNext) {
      pages.push({ key: `next-placeholder-${current.id}`, content: renderSlide(nextSong ?? current, '上滑切换到下一首') });
    }
    return pages;
  }, [canGoNext, canGoPrev, current, nextSong, prevSong, renderSlide]);

  const swipeIndex = prevSong && canGoPrev ? 1 : 0;

  if (!current) return <View style={styles.loading}><Text style={styles.loadingText}>正在加载音乐…</Text></View>;
  const displayTime = sliderOverrideTime ?? status.currentTime;
  const progress = status.duration
    ? Math.min(100, Math.max(0, displayTime / status.duration * 100))
    : 0;

  return (
    <View style={styles.page}>
      <SafeAreaView style={styles.body} edges={['top']}>
        <Pressable
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="返回"
          onPress={() => goBackOrReplace('/music')}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <VerticalSwipePager
          ref={pagerRef}
          style={{ flex: 1 }}
          pages={swipePages}
          currentIndex={swipeIndex}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onGoPrev={goPrev}
          onGoNext={() => void goNext()}
          simultaneousGestures={[lyricScrollGesture]}
        />
      </SafeAreaView>

      <View style={[styles.overlay, styles.settingBar, { bottom: settingsBottom }]}>
        <Pressable style={styles.settings} onPress={() => setTimerVisible(true)}>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.overlay, styles.footer, { bottom: 0, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.progress}>
          <Text style={styles.time}>{formatTime(displayTime)}</Text>
          <View
            style={styles.sliderTrack}
            onLayout={event => setSliderWidth(event.nativeEvent.layout.width)}
            {...sliderPanResponder.panHandlers}
          >
            <View style={styles.sliderRail}>
              <View style={[styles.sliderFill, { width: `${progress}%` }]} />
            </View>
            <View style={[styles.sliderThumb, { left: `${progress}%` }]} />
          </View>
          <Text style={styles.time}>{formatTime(status.duration)}</Text>
        </View>
        <View style={styles.controls}>
          <Pressable disabled={!canGoPrev} onPress={() => void pagerRef.current?.animateToPrev()} style={[styles.skip, !canGoPrev && styles.skipDisabled]}>
            <Text style={styles.controlText}>上一曲</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (status.playing) {
                player.pause();
                return;
              }
              player.setActiveForLockScreen(true, {
                title: String(current.title ?? ''),
                artist: String((current as Record<string, unknown>).singer ?? '未知歌手'),
                artworkUrl: imageUri(current.cover),
              });
              player.play();
            }}
            style={styles.play}
          >
            <Ionicons name={status.playing ? 'pause' : 'play'} size={24} color="#fff" />
          </Pressable>
          <Pressable disabled={!canGoNext} onPress={() => void pagerRef.current?.animateToNext()} style={[styles.skip, !canGoNext && styles.skipDisabled]}>
            <Text style={styles.controlText}>下一曲</Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={timerVisible} animationType="slide" onRequestClose={() => setTimerVisible(false)}>
        <Pressable style={styles.modalMask} onPress={() => setTimerVisible(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>定时关闭</Text>
            <View style={styles.pills}>
              {[0, 10, 20, 30, 60, 90].map(minutes => (
                <Pressable key={minutes} style={styles.pill} onPress={() => selectTimer(minutes)}>
                  <Text style={styles.pillText}>{minutes === 0 ? '关闭' : minutes}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
