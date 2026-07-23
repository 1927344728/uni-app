import { Platform, type TextStyle, type ViewStyle } from 'react-native';

function hexToRgba(hex: string, opacity: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return hex;
}

type ShadowOptions = {
  color?: string;
  opacity?: number;
  radius?: number;
  offset?: { width?: number; height?: number };
  elevation?: number;
};

export function shadow({
  color = '#000',
  opacity = 0.1,
  radius = 4,
  offset = { width: 0, height: 0 },
  elevation,
}: ShadowOptions = {}): ViewStyle {
  if (Platform.OS === 'web') {
    const rgba = color.startsWith('rgba') ? color : hexToRgba(color, opacity);
    return {
      boxShadow: `${offset.width ?? 0}px ${offset.height ?? 0}px ${radius}px ${rgba}`,
      ...(elevation != null ? { elevation } : {}),
    };
  }
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: offset.width ?? 0, height: offset.height ?? 0 },
    ...(elevation != null ? { elevation } : {}),
  };
}

export function textShadow({
  color = 'rgba(0,0,0,.3)',
  offset = { width: 2, height: 2 },
  radius = 4,
}: {
  color?: string;
  offset?: { width?: number; height?: number };
  radius?: number;
} = {}): TextStyle {
  if (Platform.OS === 'web') {
    return {
      textShadow: `${offset.width ?? 0}px ${offset.height ?? 0}px ${radius}px ${color}`,
    };
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: offset.width ?? 0, height: offset.height ?? 0 },
    textShadowRadius: radius,
  };
}
