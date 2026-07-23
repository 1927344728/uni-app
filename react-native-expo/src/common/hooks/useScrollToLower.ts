import { useCallback, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/** Matches uni-app scroll-view @scrolltolower — fires when scrolled near the bottom. */
export function useScrollToLower(onReachEnd: () => void | Promise<void>, enabled = true, threshold = 50) {
  const pending = useRef(false);

  return useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!enabled) return;
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (contentSize.height <= layoutMeasurement.height) {
      pending.current = false;
      return;
    }
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom > threshold) {
      pending.current = false;
      return;
    }
    if (pending.current) return;
    pending.current = true;
    void Promise.resolve(onReachEnd()).finally(() => {
      pending.current = false;
    });
  }, [enabled, onReachEnd, threshold]);
}
