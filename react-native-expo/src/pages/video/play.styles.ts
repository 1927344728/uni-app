import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#0f0f0f' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f' },
  loadingText: { color: '#fff' },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', transform: [{ scale: 1.2 }] },
  mask: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,.45)' },
  video: { ...StyleSheet.absoluteFill },
  overlay: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
  back: { padding: 6 },
  backText: { color: '#fff', fontSize: 36, lineHeight: 36 },
  tapArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  play: { color: 'rgba(255,255,255,.7)', fontSize: 72 },
  caption: { paddingHorizontal: 16, paddingBottom: 12 },
  publisher: { color: '#fff', fontWeight: '600', fontSize: 18, marginBottom: 6 },
  description: { color: '#fff', fontSize: 14, lineHeight: 22 },
  hint: { marginTop: 6, color: 'rgba(255,255,255,.65)', fontSize: 12 },
  footer: { paddingHorizontal: 0, paddingBottom: 0 },
  progress: { height: 4, backgroundColor: 'rgba(255,255,255,.25)' },
  progressValue: { height: 4, backgroundColor: '#fff' },
});
