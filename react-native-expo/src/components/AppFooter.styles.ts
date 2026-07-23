import { StyleSheet } from 'react-native';
import { colors } from '@/common/theme/colors';

export const styles = StyleSheet.create({
  bar: { height: 62, flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, shadowColor: '#000', shadowOpacity: .1, shadowRadius: 6, elevation: 5 },
  studyHalo: { position: 'absolute', left: '38%', top: -19, width: 90, height: 90, borderRadius: 45, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  icon: { color: colors.textMuted, fontSize: 20, lineHeight: 23 },
  studyIcon: { fontSize: 27, marginTop: -6 },
  label: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  active: { color: colors.primary, fontWeight: '700' },
});
