import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import type { ApiItem } from '@/lib/api';

type OpenUrlOptions = { replace?: boolean };

function toExpoPath(href: string) {
  const [path, query = ''] = href.split('?');
  const normalized = path
    .replace(/^\/pages\//, '/')
    .replace(/\/index$/, '')
    .replace(/\/$/, '') || '/';
  return query ? `${normalized}?${query}` : normalized;
}

function navigate(href: string, replace?: boolean) {
  if (replace) router.replace(href as never);
  else router.push(href as never);
}

/**
 * Mirrors uni-vite `openUrl`: honor `url` + `jumpTo` for list/detail navigation.
 */
export function openUrl(
  item: Pick<ApiItem, 'url' | 'jumpTo'> & Record<string, unknown>,
  fallback?: string,
  options: OpenUrlOptions = {},
) {
  const href = String(item.url ?? fallback ?? '').trim();
  if (!href) return false;

  const jumpTo = String(item.jumpTo ?? (href.startsWith('/static/') || href.endsWith('.html') ? 'webview' : 'navigate'));
  const { replace } = options;

  if (href.includes('hanyupinyin')) {
    navigate('/recommend/hanyupinyin', replace);
    return true;
  }

  if (jumpTo === 'webview' || href.startsWith('/static/') || href.endsWith('.html')) {
    navigate(`/webview?url=${encodeURIComponent(href)}`, replace);
    return true;
  }

  if (jumpTo === 'web') {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = href;
      return true;
    }
    void Linking.openURL(href).catch(() => {
      navigate(`/webview?url=${encodeURIComponent(href)}`, replace);
    });
    return true;
  }

  if (href.startsWith('/pages/') || href.startsWith('/')) {
    navigate(toExpoPath(href), replace);
    return true;
  }

  if (/^https?:\/\//i.test(href)) {
    navigate(`/webview?url=${encodeURIComponent(href)}`, replace);
    return true;
  }

  return false;
}
