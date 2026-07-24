import { createElement, useEffect, useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { AppVideoPlayer } from './useAppVideoPlayer.web';

type Props = {
  player: AppVideoPlayer;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'contain' | 'cover';
  nativeControls?: boolean;
  playsInline?: boolean;
};

export function AppVideoView({
  player,
  style,
  contentFit = 'contain',
  nativeControls = false,
  playsInline = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    player.mount(video);
    return () => player.unmount(video);
  }, [player]);

  const flat = StyleSheet.flatten(style) ?? {};

  return createElement('video', {
    ref: videoRef,
    controls: nativeControls,
    playsInline,
    style: {
      ...flat,
      objectFit: contentFit,
      backgroundColor: '#000',
    },
  });
}
