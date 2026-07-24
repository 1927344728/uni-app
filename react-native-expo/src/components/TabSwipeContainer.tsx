import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { PanResponder, View, type StyleProp, type ViewStyle } from 'react-native';

type TabSwipeContainerProps = {
  tabKeys: string[];
  activeKey: string;
  onChange: (key: string) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const SWIPE_THRESHOLD = 48;
const ACTIVE_OFFSET_X = 24;

/** Horizontal swipe / drag on content area switches parent tabs (uni-vite swiper behavior). */
export function TabSwipeContainer({ tabKeys, activeKey, onChange, children, style }: TabSwipeContainerProps) {
  const tabKeysRef = useRef(tabKeys);
  const activeKeyRef = useRef(activeKey);
  const onChangeRef = useRef(onChange);
  tabKeysRef.current = tabKeys;
  activeKeyRef.current = activeKey;
  onChangeRef.current = onChange;

  const goNext = useCallback(() => {
    const keys = tabKeysRef.current;
    const index = keys.indexOf(activeKeyRef.current);
    if (index >= 0 && index < keys.length - 1) onChangeRef.current(keys[index + 1]);
  }, []);

  const goPrev = useCallback(() => {
    const keys = tabKeysRef.current;
    const index = keys.indexOf(activeKeyRef.current);
    if (index > 0) onChangeRef.current(keys[index - 1]);
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => (
      Math.abs(gesture.dx) > ACTIVE_OFFSET_X
      && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2
    ),
    onMoveShouldSetPanResponderCapture: (_event, gesture) => (
      Math.abs(gesture.dx) > ACTIVE_OFFSET_X
      && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2
    ),
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dx < -SWIPE_THRESHOLD) goNext();
      else if (gesture.dx > SWIPE_THRESHOLD) goPrev();
    },
  }), [goNext, goPrev]);

  if (tabKeys.length < 2) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }

  return (
    <View style={[{ flex: 1 }, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
