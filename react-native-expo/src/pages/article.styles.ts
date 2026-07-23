import { StyleSheet } from 'react-native';
import { LIST_BOTTOM_PADDING } from '@/common/theme/layout';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  typesRow: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  types: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 8, minHeight: 44 },
  type: { paddingHorizontal: 11, paddingVertical: 8, color: '#666', fontSize: 13 },
  typeActive: { color: '#59c2ad', fontWeight: '700' },
  searchRow: { paddingBottom: 4 },
  list: { paddingBottom: LIST_BOTTOM_PADDING },
  item: { flexDirection: 'row', alignItems: 'center', minHeight: 84, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  thumb: { width: 60, height: 60, marginRight: 12, borderRadius: 6, backgroundColor: '#eee' },
  itemInfo: { flex: 1 },
  itemTitle: { color: '#333', fontSize: 16 },
  note: { marginTop: 4, color: '#999', fontSize: 13, lineHeight: 19 },
  itemActive: { color: '#59c2ad', fontWeight: '700' },
  chevron: { marginLeft: 8, color: '#bbb', fontSize: 25 },
  more: { paddingVertical: 16, color: '#999', textAlign: 'center' },
  empty: { paddingVertical: 80, color: '#999', textAlign: 'center' },
});
