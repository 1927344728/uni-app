import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function WebviewScreen() {
  const { url } = useLocalSearchParams<{ url?: string | string[] }>();
  const uri = Array.isArray(url) ? url[0] : url;
  return <View style={{ flex: 1 }}>{uri ? <WebView source={{ uri: decodeURIComponent(uri) }} style={{ flex: 1 }} /> : null}</View>;
}
