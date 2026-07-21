import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f8f8f8' }, banner: { width: '100%', height: 200, resizeMode: 'cover' },
  form: { margin: 12, padding: 15, borderRadius: 8, backgroundColor: '#fff', gap: 18 }, field: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' }, label: { width: 60, color: '#999', fontSize: 14 }, input: { flex: 1, height: 44, color: '#333', fontSize: 15 }, agreement: { flexDirection: 'row', alignItems: 'center' }, checkbox: { width: 18, height: 18, marginRight: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bbb', borderRadius: 3 }, checkboxActive: { borderColor: '#59c2ad', backgroundColor: '#59c2ad' }, check: { color: '#fff', fontSize: 13, fontWeight: '700' }, agreementText: { color: '#999', fontSize: 14 },
  submit: { marginTop: 22, paddingHorizontal: 12 }, button: { alignItems: 'center', paddingVertical: 12, borderRadius: 50, backgroundColor: '#59c2ad' }, disabled: { backgroundColor: '#b3b3b3' }, buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' }, mock: { paddingVertical: 10, color: '#999', fontSize: 14, textAlign: 'center' },
});
