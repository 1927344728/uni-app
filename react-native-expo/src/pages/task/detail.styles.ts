import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' }, content: { padding: 12, paddingBottom: 28 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }, loadingText: { color: '#999' },
  title: { marginBottom: 18, paddingHorizontal: 40, color: '#333', fontSize: 18, fontWeight: '700', textAlign: 'center' }, author: { marginTop: -6, marginBottom: 18, color: '#999', textAlign: 'center' },
  item: { flexDirection: 'row', marginBottom: 10 }, label: { width: 62, marginRight: 12, color: '#999', fontSize: 14 }, value: { flex: 1, color: '#333', fontSize: 14, lineHeight: 21 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 13, paddingVertical: 3, borderRadius: 16, backgroundColor: '#fff' }, statusText: { color: '#1687e6', fontSize: 12 }, status1: { backgroundColor: 'red' }, status2: { backgroundColor: '#1687e6' }, status3: { backgroundColor: '#1dd41d' }, status4: { backgroundColor: 'gray' },
  progressWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }, track: { flex: 1, height: 8, overflow: 'hidden', borderRadius: 8, backgroundColor: '#f0f2f5' }, progress: { height: '100%', backgroundColor: '#4facfe' }, progressText: { width: 40, color: '#666', fontSize: 12, textAlign: 'right' },
  section: { marginTop: 7, marginBottom: 11 }, sectionTitle: { marginBottom: 6, color: '#333', fontSize: 14, fontWeight: '700' }, block: { marginBottom: 10 }, blockText: { color: '#333', fontSize: 14, lineHeight: 22 },
});
