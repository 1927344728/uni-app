import React, { useCallback, useEffect, useMemo, useRef, type ComponentType, type ReactElement } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Text,
  View,
  type RefreshControlProps,
} from 'react-native';
import { colors } from '@/common/theme/colors';

type WebRefreshProps = RefreshControlProps & {
  children?: ReactElement<{ children?: ReactElement; style?: unknown }>;
};

function withAnimated(WrappedComponent: ComponentType<Record<string, unknown>>) {
  class WithAnimated extends React.Component<Record<string, unknown>> {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return Animated.createAnimatedComponent(WithAnimated);
}

/**
 * Web pull-to-refresh. react-native-web has no RefreshControl;
 * ScrollView clones this component with the scroll view as children.
 */
export function AppRefreshControl({
  refreshing,
  onRefresh,
  tintColor = colors.primary,
  colors: colorList,
  style,
  progressViewOffset,
  children,
  size,
  title,
  titleColor,
  enabled,
}: WebRefreshProps) {
  const onRefreshRef = useRef(onRefresh);
  const enabledRef = useRef(enabled);
  const containerRef = useRef<View>(null);
  const pullPosReachedState = useRef(0);
  const pullPosReachedAnimated = useRef(new Animated.Value(0));
  const pullDownSwipeMargin = useRef(new Animated.Value(0));

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    Animated.timing(pullDownSwipeMargin.current, {
      toValue: refreshing ? 50 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
    if (refreshing) {
      pullPosReachedState.current = 0;
      pullPosReachedAnimated.current.setValue(0);
    }
  }, [refreshing]);

  const onPanResponderFinish = useCallback(() => {
    if (pullPosReachedState.current && onRefreshRef.current) {
      onRefreshRef.current();
    }
    if (!pullPosReachedState.current) {
      Animated.timing(pullDownSwipeMargin.current, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start();
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const node = containerRef.current as unknown as { firstChild?: { scrollTop?: number } } | null;
        const scrollContainer = node?.firstChild;
        if (!scrollContainer) return false;
        return (
          scrollContainer.scrollTop === 0 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 2 &&
          Math.abs(gestureState.vy) > Math.abs(gestureState.vx) * 2.5
        );
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (enabledRef.current !== undefined && !enabledRef.current) return;

        const adjustedDy = gestureState.dy <= 0 ? 0 : (gestureState.dy * 150) / (gestureState.dy + 120);
        pullDownSwipeMargin.current.setValue(adjustedDy);
        const newValue = adjustedDy > 45 ? 1 : 0;
        if (newValue !== pullPosReachedState.current) {
          pullPosReachedState.current = newValue;
          Animated.timing(pullPosReachedAnimated.current, {
            toValue: newValue,
            duration: 150,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: onPanResponderFinish,
      onPanResponderTerminate: onPanResponderFinish,
    }),
  );

  const indicatorColor = tintColor ?? colorList?.[0] ?? colors.primary;

  const pullDownIconStyle = useMemo(
    () => ({
      color: indicatorColor,
      fontSize: 18,
      textAlign: 'center' as const,
      marginBottom: 18,
      transform: [
        {
          rotate: pullPosReachedAnimated.current.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        },
      ],
    }),
    [indicatorColor],
  );

  const indicatorTransformStyle = useMemo(
    () => ({
      alignSelf: 'center' as const,
      marginTop: -40,
      height: 40,
      transform: [{ translateY: pullDownSwipeMargin.current }],
    }),
    [],
  );

  const contentChild = children?.props?.children;
  const AnimatedContentContainer = useMemo(() => {
    if (!contentChild?.type) return null;
    return withAnimated(contentChild.type as ComponentType<Record<string, unknown>>);
  }, [contentChild?.type]);

  if (!children || !contentChild || !AnimatedContentContainer) return null;

  const wrappedScrollView = React.cloneElement(
    children,
    null,
    <>
      <Animated.View style={indicatorTransformStyle}>
        {refreshing ? (
          <>
            <ActivityIndicator color={indicatorColor} size={size ?? 'small'} style={{ marginVertical: 10 }} />
            {title ? <Text style={{ color: titleColor, textAlign: 'center', marginTop: 5 }}>{title}</Text> : null}
          </>
        ) : (
          <Animated.Text style={pullDownIconStyle}>↓</Animated.Text>
        )}
      </Animated.View>
      <AnimatedContentContainer
        {...(contentChild.props as Record<string, unknown>)}
        style={[contentChild.props.style, { transform: [{ translateY: pullDownSwipeMargin.current }] }]}
      />
    </>,
  );

  return (
    <View
      ref={containerRef}
      style={[style, { overflow: 'hidden', paddingTop: progressViewOffset }]}
      {...panResponder.current.panHandlers}
    >
      {wrappedScrollView}
    </View>
  );
}
