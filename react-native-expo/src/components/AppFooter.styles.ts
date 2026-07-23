import { StyleSheet } from 'react-native';
import { colors } from '@/common/theme/colors';
import { shadow } from '@/common/theme/shadow';

export const styles = StyleSheet.create({
  bar: { height: 62, flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, ...shadow({ opacity: .1, radius: 6, elevation: 5 }) },
  studyHalo: { position: 'absolute', left: '38%', top: -19, width: 90, height: 90, borderRadius: 45, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  studyIcon: { fontSize: 27, marginTop: -6 },
  label: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  active: { color: colors.primary, fontWeight: '700' },
});
