import { StyleSheet } from 'react-native';
import { LIST_BOTTOM_PADDING } from '@/common/theme/layout';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabs: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabsContent: { flexGrow: 1 },
  tab: { minWidth: 80, height: 44, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: '#333', fontSize: 15 },
  tabTextActive: { color: '#59c2ad', fontSize: 18, fontWeight: '700' },
  underline: { position: 'absolute', bottom: 0, width: 18, height: 3, borderRadius: 3, backgroundColor: '#59c2ad' },
  subtypesRow: { paddingTop: 6, paddingBottom: 2 },
  subtypes: { gap: 7, paddingHorizontal: 10 },
  subtype: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, backgroundColor: '#f8f8f8', color: '#666', fontSize: 12 },
  subtypeActive: { backgroundColor: '#e6f7f3', color: '#59c2ad', fontWeight: '700' },
  searchRow: { paddingBottom: 4 },
  list: { paddingBottom: LIST_BOTTOM_PADDING },
  item: { minHeight: 84, flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  image: { width: 60, height: 60, borderRadius: 6, backgroundColor: '#e9eeee' },
  itemContent: { flex: 1, justifyContent: 'center', marginLeft: 12 },
  title: { color: '#333', fontSize: 16 },
  note: { marginTop: 5, color: '#999', lineHeight: 18 },
  activeText: { color: '#59c2ad', fontWeight: '700' },
  badge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 5, borderRadius: 3, backgroundColor: 'red', color: '#fff', fontSize: 11 },
  empty: { paddingVertical: 24, color: '#999', textAlign: 'center' },
});
