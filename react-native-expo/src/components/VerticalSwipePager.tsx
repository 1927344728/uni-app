import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type VerticalSwipePage = {
  key: string;
  content: ReactNode;
};

export type VerticalSwipePagerHandle = {
  animateToNext: () => Promise<void>;
  animateToPrev: () => Promise<void>;
};

type VerticalSwipePagerProps = {
  pages: VerticalSwipePage[];
  currentIndex: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onGoPrev: () => void | Promise<void>;
  onGoNext: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
  simultaneousGestures?: Parameters<ReturnType<typeof Gesture.Pan>['simultaneousWithExternalGesture']>[0][];
};

const SWIPE_THRESHOLD = 50;

export const VerticalSwipePager = forwardRef<VerticalSwipePagerHandle, VerticalSwipePagerProps>(function VerticalSwipePager({
  pages,
  currentIndex,
  canGoPrev,
  canGoNext,
  onGoPrev,
  onGoNext,
  style,
  simultaneousGestures = [],
}, ref) {
  const [height, setHeight] = useState(0);
  const offsetY = useSharedValue(0);
  const startY = useSharedValue(0);
  const switching = useSharedValue(false);
  const pageHeightSV = useSharedValue(0);
  const currentIndexSV = useSharedValue(0);
  const pagesLengthSV = useSharedValue(1);
  const canGoPrevSV = useSharedValue(false);
  const canGoNextSV = useSharedValue(false);
  const pageKeys = pages.map(page => page.key).join('|');

  // JS-only refs: never read inside worklets.
  const onGoPrevRef = useRef(onGoPrev);
  const onGoNextRef = useRef(onGoNext);
  const pendingResolveRef = useRef<(() => void) | null>(null);
  onGoPrevRef.current = onGoPrev;
  onGoNextRef.current = onGoNext;

  useEffect(() => {
    pageHeightSV.value = height;
  }, [height, pageHeightSV]);

  useEffect(() => {
    currentIndexSV.value = currentIndex;
  }, [currentIndex, currentIndexSV]);

  useEffect(() => {
    pagesLengthSV.value = pages.length;
  }, [pages.length, pagesLengthSV]);

  useEffect(() => {
    canGoPrevSV.value = canGoPrev;
  }, [canGoPrev, canGoPrevSV]);

  useEffect(() => {
    canGoNextSV.value = canGoNext;
  }, [canGoNext, canGoNextSV]);

  const syncOffset = useCallback((animated = false) => {
    if (height <= 0) return;
    const target = -currentIndex * height;
    cancelAnimation(offsetY);
    if (animated) {
      offsetY.value = withSpring(target, { damping: 22, stiffness: 220 });
    } else {
      offsetY.value = target;
    }
  }, [currentIndex, height, offsetY]);

  useEffect(() => {
    if (height <= 0) return;
    syncOffset(false);
  }, [currentIndex, height, pageKeys, syncOffset]);

  const finishSwitch = useCallback(() => {
    switching.value = false;
    syncOffset(false);
  }, [switching, syncOffset]);

  const settlePending = useCallback(() => {
    const resolve = pendingResolveRef.current;
    pendingResolveRef.current = null;
    resolve?.();
  }, []);

  const handleNextAnimationEnd = useCallback((finished: boolean) => {
    if (!finished) {
      finishSwitch();
      settlePending();
      return;
    }
    void (async () => {
      try {
        await onGoNextRef.current();
      } finally {
        finishSwitch();
        settlePending();
      }
    })();
  }, [finishSwitch, settlePending]);

  const handlePrevAnimationEnd = useCallback((finished: boolean) => {
    if (!finished) {
      finishSwitch();
      settlePending();
      return;
    }
    void (async () => {
      try {
        await onGoPrevRef.current();
      } finally {
        finishSwitch();
        settlePending();
      }
    })();
  }, [finishSwitch, settlePending]);

  const animateToNext = useCallback(() => new Promise<void>(resolve => {
    const pageHeight = pageHeightSV.value;
    const index = currentIndexSV.value;
    if (pageHeight <= 0 || !canGoNextSV.value) {
      resolve();
      return;
    }
    switching.value = true;
    pendingResolveRef.current = resolve;
    const target = -(index + 1) * pageHeight;
    offsetY.value = withTiming(target, { duration: 280 }, finished => {
      'worklet';
      runOnJS(handleNextAnimationEnd)(!!finished);
    });
  }), [canGoNextSV, currentIndexSV, handleNextAnimationEnd, offsetY, pageHeightSV, switching]);

  const animateToPrev = useCallback(() => new Promise<void>(resolve => {
    const pageHeight = pageHeightSV.value;
    const index = currentIndexSV.value;
    if (pageHeight <= 0 || !canGoPrevSV.value) {
      resolve();
      return;
    }
    switching.value = true;
    pendingResolveRef.current = resolve;
    const target = -(index - 1) * pageHeight;
    offsetY.value = withTiming(target, { duration: 280 }, finished => {
      'worklet';
      runOnJS(handlePrevAnimationEnd)(!!finished);
    });
  }), [canGoPrevSV, currentIndexSV, handlePrevAnimationEnd, offsetY, pageHeightSV, switching]);

  useImperativeHandle(ref, () => ({
    animateToNext,
    animateToPrev,
  }), [animateToNext, animateToPrev]);

  const startNextAnimation = useCallback(() => { void animateToNext(); }, [animateToNext]);
  const startPrevAnimation = useCallback(() => { void animateToPrev(); }, [animateToPrev]);

  const panGesture = useMemo(() => {
    let gesture = Gesture.Pan()
      .activeOffsetY([-15, 15])
      .failOffsetX([-25, 25])
      .onBegin(() => {
        'worklet';
        startY.value = offsetY.value;
      })
      .onUpdate(event => {
        'worklet';
        if (switching.value) return;
        const pageHeight = pageHeightSV.value;
        if (pageHeight <= 0) return;

        let dy = event.translationY;
        const index = currentIndexSV.value;
        const pageCount = pagesLengthSV.value;
        const minOffset = -(pageCount - 1) * pageHeight;

        if (index === 0 && dy > 0 && !canGoPrevSV.value) dy = Math.min(dy * 0.3, 50);
        if (index === pageCount - 1 && dy < 0 && !canGoNextSV.value) dy = Math.max(dy * 0.3, -50);

        let next = startY.value + dy;
        if (next > 0) next = canGoPrevSV.value ? next : Math.min(next, 50);
        if (next < minOffset) next = canGoNextSV.value ? next : Math.max(next, minOffset - 50);
        offsetY.value = next;
      })
      .onEnd(event => {
        'worklet';
        if (switching.value) return;
        const pageHeight = pageHeightSV.value;
        const index = currentIndexSV.value;
        if (pageHeight <= 0) return;

        const dy = event.translationY;
        if (dy < -SWIPE_THRESHOLD && canGoNextSV.value) {
          runOnJS(startNextAnimation)();
          return;
        }
        if (dy > SWIPE_THRESHOLD && canGoPrevSV.value) {
          runOnJS(startPrevAnimation)();
          return;
        }
        offsetY.value = withSpring(-index * pageHeight, { damping: 22, stiffness: 220 });
      });

    simultaneousGestures.forEach(externalGesture => {
      gesture = gesture.simultaneousWithExternalGesture(externalGesture);
    });
    return gesture;
  }, [
    canGoNextSV,
    canGoPrevSV,
    currentIndexSV,
    offsetY,
    pageHeightSV,
    pagesLengthSV,
    simultaneousGestures,
    startNextAnimation,
    startPrevAnimation,
    startY,
    switching,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  const enabled = pages.length > 1 && height > 0;

  return (
    <View style={[style, { overflow: 'hidden' }]} onLayout={event => setHeight(event.nativeEvent.layout.height)}>
      {enabled && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ height: pages.length * height, width: '100%' }, animatedStyle]}>
            {pages.map((page, index) => (
              <View key={page.key} style={{ position: 'absolute', top: index * height, left: 0, right: 0, height }}>
                {page.content}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      )}
      {!enabled && height > 0 && pages[0] && (
        <View style={{ height, width: '100%' }}>
          {pages.find((_, index) => index === currentIndex)?.content ?? pages[0].content}
        </View>
      )}
    </View>
  );
});
