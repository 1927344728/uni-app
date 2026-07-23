import { StyleSheet } from 'react-native';
import { LIST_BOTTOM_PADDING } from '@/common/theme/layout';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  bookPage: { backgroundColor: '#f9f6ff' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabBar: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabBarContent: { flexGrow: 1 },
  tab: { minWidth: 80, paddingHorizontal: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: '#333', fontSize: 15 },
  tabTextActive: { color: '#59c2ad', fontSize: 18, fontWeight: '700' },
  underline: { position: 'absolute', bottom: 0, height: 3, width: 18, borderRadius: 3, backgroundColor: '#59c2ad' },
  subtypesRow: { paddingTop: 6, paddingBottom: 2 },
  subtypes: { paddingHorizontal: 10, gap: 7 },
  subtype: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, backgroundColor: '#f8f8f8', color: '#666', fontSize: 12 },
  subtypeActive: { backgroundColor: '#e6f7f3', color: '#59c2ad', fontWeight: '700' },
  searchRow: { paddingBottom: 4 },
  list: { paddingBottom: LIST_BOTTOM_PADDING },
  item: { minHeight: 84, padding: 12, flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f0f0f0' },
  imageBox: { width: 60, height: 60, borderRadius: 6, backgroundColor: '#e9eeee' },
  itemContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  title: { fontSize: 16, color: '#333' },
  note: { marginTop: 5, color: '#999', lineHeight: 18 },
  activeText: { color: '#59c2ad', fontWeight: '700' },
  badge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 5, borderRadius: 3, color: '#fff', fontSize: 11, backgroundColor: 'red' },
  empty: { paddingVertical: 24, textAlign: 'center', color: '#999' },
});
