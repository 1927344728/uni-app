import { Platform, StyleSheet } from 'react-native';
import { colors } from './colors';

export const inputNoFocusOutline = Platform.select({
  web: { outlineWidth: 0 } as const,
  default: {},
});

export const inputStyles = StyleSheet.create({
  search: {
    height: 42,
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 21,
    backgroundColor: colors.backgroundPatch,
    color: colors.textPrimary,
    fontSize: 15,
    ...inputNoFocusOutline,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  fieldLabel: {
    width: 72,
    color: colors.textMuted,
    fontSize: 14,
  },
  fieldInput: {
    flex: 1,
    height: 44,
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: 'transparent',
    ...inputNoFocusOutline,
  },
});
