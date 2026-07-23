import { StyleSheet } from 'react-native';
import { colors } from '@/common/theme/colors';

export const styles = StyleSheet.create({
  trigger: {
    height: 36,
    minWidth: 145,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundPatch,
    gap: 8,
  },
  triggerActive: { backgroundColor: '#e6f7f3' },
  triggerText: { flex: 1, color: '#b3b3b3', fontSize: 14 },
  triggerTextActive: { color: colors.primary },
  caret: { color: '#999', fontSize: 14 },
  mask: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.45)' },
  sheet: { maxHeight: '55%', backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  clear: { color: colors.primary, fontSize: 14 },
  options: { paddingBottom: 24 },
  option: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionActive: { backgroundColor: '#f0faf8' },
  optionText: { color: colors.textPrimary, fontSize: 15 },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
});
