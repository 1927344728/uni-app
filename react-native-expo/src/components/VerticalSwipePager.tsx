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
  const pageKeys = pages.map(page => page.key).join('|');
  const canGoPrevRef = useRef(canGoPrev);
  const canGoNextRef = useRef(canGoNext);
  const currentIndexRef = useRef(currentIndex);
  const heightRef = useRef(height);
  const pagesLengthRef = useRef(pages.length);
  const onGoPrevRef = useRef(onGoPrev);
  const onGoNextRef = useRef(onGoNext);

  canGoPrevRef.current = canGoPrev;
  canGoNextRef.current = canGoNext;
  currentIndexRef.current = currentIndex;
  heightRef.current = height;
  pagesLengthRef.current = pages.length;
  onGoPrevRef.current = onGoPrev;
  onGoNextRef.current = onGoNext;

  const syncOffset = useCallback((animated = false) => {
    if (heightRef.current <= 0) return;
    const target = -currentIndexRef.current * heightRef.current;
    cancelAnimation(offsetY);
    if (animated) {
      offsetY.value = withSpring(target, { damping: 22, stiffness: 220 });
    } else {
      offsetY.value = target;
    }
  }, [offsetY]);

  useEffect(() => {
    if (height <= 0) return;
    syncOffset(false);
  }, [currentIndex, height, pageKeys, syncOffset]);

  const finishSwitch = useCallback(() => {
    switching.value = false;
    syncOffset(false);
  }, [switching, syncOffset]);

  const triggerNext = useCallback(async () => {
    try {
      await onGoNextRef.current();
    } finally {
      finishSwitch();
    }
  }, [finishSwitch]);

  const triggerPrev = useCallback(async () => {
    try {
      await onGoPrevRef.current();
    } finally {
      finishSwitch();
    }
  }, [finishSwitch]);

  const animateToNext = useCallback(() => new Promise<void>(resolve => {
    const pageHeight = heightRef.current;
    const index = currentIndexRef.current;
    if (pageHeight <= 0 || !canGoNextRef.current) {
      resolve();
      return;
    }
    switching.value = true;
    const target = -(index + 1) * pageHeight;
    offsetY.value = withTiming(target, { duration: 280 }, finished => {
      if (!finished) {
        runOnJS(finishSwitch)();
        runOnJS(resolve)();
        return;
      }
      runOnJS(async () => {
        await triggerNext();
        resolve();
      })();
    });
  }), [finishSwitch, offsetY, switching, triggerNext]);

  const animateToPrev = useCallback(() => new Promise<void>(resolve => {
    const pageHeight = heightRef.current;
    const index = currentIndexRef.current;
    if (pageHeight <= 0 || !canGoPrevRef.current) {
      resolve();
      return;
    }
    switching.value = true;
    const target = -(index - 1) * pageHeight;
    offsetY.value = withTiming(target, { duration: 280 }, finished => {
      if (!finished) {
        runOnJS(finishSwitch)();
        runOnJS(resolve)();
        return;
      }
      runOnJS(async () => {
        await triggerPrev();
        resolve();
      })();
    });
  }), [finishSwitch, offsetY, switching, triggerPrev]);

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
      startY.value = offsetY.value;
    })
    .onUpdate(event => {
      if (switching.value) return;
      const pageHeight = heightRef.current;
      if (pageHeight <= 0) return;

      let dy = event.translationY;
      const index = currentIndexRef.current;
      const pageCount = pagesLengthRef.current;
      const minOffset = -(pageCount - 1) * pageHeight;

      if (index === 0 && dy > 0 && !canGoPrevRef.current) dy = Math.min(dy * 0.3, 50);
      if (index === pageCount - 1 && dy < 0 && !canGoNextRef.current) dy = Math.max(dy * 0.3, -50);

      let next = startY.value + dy;
      if (next > 0) next = canGoPrevRef.current ? next : Math.min(next, 50);
      if (next < minOffset) next = canGoNextRef.current ? next : Math.max(next, minOffset - 50);
      offsetY.value = next;
    })
    .onEnd(event => {
      if (switching.value) return;
      const pageHeight = heightRef.current;
      const index = currentIndexRef.current;
      if (pageHeight <= 0) return;

      const dy = event.translationY;
      if (dy < -SWIPE_THRESHOLD && canGoNextRef.current) {
        runOnJS(startNextAnimation)();
        return;
      }
      if (dy > SWIPE_THRESHOLD && canGoPrevRef.current) {
        runOnJS(startPrevAnimation)();
        return;
      }
      offsetY.value = withSpring(-index * pageHeight, { damping: 22, stiffness: 220 });
    });

    simultaneousGestures.forEach(externalGesture => {
      gesture = gesture.simultaneousWithExternalGesture(externalGesture);
    });
    return gesture;
  }, [animateToNext, animateToPrev, offsetY, simultaneousGestures, startNextAnimation, startPrevAnimation, startY, switching]);

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
