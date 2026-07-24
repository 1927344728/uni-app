import { StyleSheet } from 'react-native';

export const PROGRESS_HEIGHT = 4;
export const PROGRESS_TRACK_HEIGHT = 20;
export const CAPTION_BOTTOM_GAP = 30;

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#0f0f0f', overflow: 'hidden' },
  slidePage: { flex: 1, overflow: 'hidden', backgroundColor: '#0f0f0f' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f' },
  loadingText: { color: '#fff' },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', transform: [{ scale: 1.2 }] },
  mask: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,.45)' },
  videoStage: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  back: { position: 'absolute', left: 4, zIndex: 20, padding: 6 },
  tapArea: { ...StyleSheet.absoluteFill, zIndex: 3, alignItems: 'center', justifyContent: 'center' },
  swipeHint: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    zIndex: 15,
    color: 'rgba(255,255,255,.7)',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  caption: { position: 'absolute', left: 0, right: 0, zIndex: 8, paddingHorizontal: 12 },
  publisher: { color: '#fff', fontWeight: '600', fontSize: 18, marginBottom: 6 },
  description: { color: '#fff', fontSize: 14, lineHeight: 22 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 12 },
  progressTrack: { height: 20, justifyContent: 'center' },
  progress: { height: PROGRESS_HEIGHT, backgroundColor: 'rgba(255,255,255,.25)', borderRadius: 2, overflow: 'hidden' },
  progressValue: { height: PROGRESS_HEIGHT, backgroundColor: '#fff', borderRadius: 2 },
});
