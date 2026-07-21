import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bar: { height: 62, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', shadowColor: '#000', shadowOpacity: .1, shadowRadius: 6, elevation: 5 },
  studyHalo: { position: 'absolute', left: '38%', top: -19, width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  icon: { color: '#999', fontSize: 20, lineHeight: 23 },
  studyIcon: { fontSize: 27, marginTop: -6 },
  label: { color: '#999', fontSize: 12, lineHeight: 18 },
  active: { color: '#59c2ad', fontWeight: '700' },
});
