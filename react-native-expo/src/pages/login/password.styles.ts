import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f8f8f8' }, banner: { width: '100%', height: 200, resizeMode: 'cover' },
  form: { margin: 12, padding: 15, borderRadius: 8, backgroundColor: '#fff', gap: 18 }, field: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' }, label: { width: 86, color: '#999', fontSize: 14 }, input: { flex: 1, height: 44, color: '#333', fontSize: 15 },
  submit: { marginTop: 22, paddingHorizontal: 12 }, button: { alignItems: 'center', paddingVertical: 12, borderRadius: 50, backgroundColor: '#59c2ad' }, disabled: { backgroundColor: '#b3b3b3' }, buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
