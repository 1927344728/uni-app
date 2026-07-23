import { StyleSheet } from 'react-native';
import { LIST_BOTTOM_PADDING } from '@/common/theme/layout';
import { shadow } from '@/common/theme/shadow';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f7fa' },
  toolbar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  selectRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, gap: 10 },
  list: { padding: 12, paddingBottom: LIST_BOTTOM_PADDING },
  card: { padding: 12, paddingBottom: 2, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, ...shadow({ opacity: .04, radius: 3, elevation: 1 }) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  title: { flex: 1, color: '#222', fontSize: 16, fontWeight: '600' },
  tag: { overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 4, color: '#fff', fontSize: 12, borderRadius: 12, backgroundColor: '#999' },
  status1: { backgroundColor: 'red' },
  status2: { backgroundColor: '#1687e6' },
  status3: { backgroundColor: '#1dd41d' },
  status4: { backgroundColor: 'gray' },
  meta: { color: '#999', fontSize: 14, lineHeight: 22 },
  content: { color: '#333', fontSize: 15, lineHeight: 21, marginTop: 4, marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  progressTrack: { flex: 1, height: 8, overflow: 'hidden', borderRadius: 6, backgroundColor: '#f0f2f5' },
  progress: { height: '100%', backgroundColor: '#4facfe' },
  progressText: { width: 40, textAlign: 'right', color: '#666', fontSize: 12 },
  noMore: { color: '#999', textAlign: 'center', paddingVertical: 16 },
});
