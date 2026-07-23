import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

const APP_ORIGIN = 'https://app.izhao.com.cn';

function resolveWebUri(raw?: string) {
  if (!raw) return undefined;
  const uri = decodeURIComponent(raw);
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  if (uri.startsWith('/static/')) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}${uri}`;
    }
    return `${APP_ORIGIN}${uri}`;
  }
  return uri;
}

export default function WebviewScreen() {
  const { url } = useLocalSearchParams<{ url?: string | string[] }>();
  const raw = Array.isArray(url) ? url[0] : url;
  const uri = resolveWebUri(raw);

  return (
    <WebView
      source={{ uri: uri ?? 'about:blank' }}
      style={{ flex: 1 }}
      originWhitelist={['*']}
      allowsInlineMediaPlayback
    />
  );
}
