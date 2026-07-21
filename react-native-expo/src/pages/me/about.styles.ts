import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', backgroundColor: '#f8f8f8' },
  header: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 16 },
  logo: { width: 80, height: 80, marginBottom: 12, borderRadius: 16, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: .1, shadowRadius: 12, elevation: 3 },
  name: { marginBottom: 6, color: '#333', fontSize: 18, fontWeight: '600' }, version: { color: '#666', fontSize: 14 },
  copyright: { position: 'absolute', right: 0, bottom: 22, left: 0, alignItems: 'center', paddingHorizontal: 16 }, text: { color: '#999', fontSize: 12, lineHeight: 20, textAlign: 'center' }, record: { textDecorationLine: 'underline' },
});
