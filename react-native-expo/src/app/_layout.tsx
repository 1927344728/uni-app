import { Stack, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

export default function RootLayout() {
  const pathname = usePathname();
  const title = pageTitles.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] ?? APP_NAME;

  return (
    <SafeAreaProvider>
      <Head><title>{title}</title></Head>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.backgroundMinor } }} />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
