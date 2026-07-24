import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME } from '@/config/app';
import { colors } from '@/common/theme/colors';

const pageTitles: Array<[string, string]> = [
  ['/study/dictation', '听写小助手'],
  ['/study/gen-dictation', '听写链接生成器'],
  ['/study/rhyme', '前后鼻韵母强化练习'],
  ['/recommend/hanyupinyin', '汉语拼音发音学习'],
  ['/login/password', '修改密码'],
  ['/login', '登录'],
  ['/task/detail', '任务详情'],
  ['/task', '任务'],
  ['/study', '学习'],
  ['/life', '生活'],
  ['/me/about', '关于'],
  ['/me', '我'],
  ['/book/detail', '书籍简介'],
  ['/book', '书籍列表'],
  ['/music/play', '音乐播放'],
  ['/music', '音乐'],
  ['/video/play', '视频播放'],
  ['/video', '视频'],
  ['/article/detail', '文章详情'],
  ['/article', '文章列表'],
  ['/webview', '网页'],
  ['/debug', '测试页面'],
];

const immersiveRoutes = ['/music/play', '/video/play'];

export default function RootLayout() {
  const pathname = usePathname();
  const title = pageTitles.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] ?? APP_NAME;
  const immersive = immersiveRoutes.some(route => pathname === route || pathname.startsWith(`${route}?`));

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;
    let node: HTMLElement | null = active;
    while (node) {
      if (node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true') {
        active.blur();
        break;
      }
      node = node.parentElement;
    }
  }, [pathname]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.backgroundMinor }}
          edges={immersive ? [] : ['top']}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.backgroundMinor },
              ...(Platform.OS === 'web' ? { detachInactiveScreens: false } : {}),
            }}
          />
        </SafeAreaView>
        <Head><title>{title}</title></Head>
        <StatusBar style={immersive ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
