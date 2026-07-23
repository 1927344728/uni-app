import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import type { RefreshControlProps } from 'react-native';
import { colors } from '@/common/theme/colors';

export function AppRefreshControl(props: RefreshControlProps) {
  return (
    <WebRefreshControl
      colors={[colors.primary]}
      tintColor={colors.primary}
      {...props}
    />
  );
}
