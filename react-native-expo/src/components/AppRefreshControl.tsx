import { RefreshControl, type RefreshControlProps } from 'react-native';
import { colors } from '@/common/theme/colors';

export function AppRefreshControl(props: RefreshControlProps) {
  return (
    <RefreshControl
      colors={[colors.primary]}
      tintColor={colors.primary}
      {...props}
    />
  );
}
