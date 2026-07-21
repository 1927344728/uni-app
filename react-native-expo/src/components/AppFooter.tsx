import { styles } from './AppFooter.styles';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

const tabs = [
  { key: 'index', name: '首页', icon: '⌂', href: '/' },
  { key: 'task', name: '任务', icon: '▣', href: '/task' },
  { key: 'study', name: '学习', icon: '✦', href: '/study' },
  { key: 'life', name: '生活', icon: '♧', href: '/life' },
  { key: 'me', name: '我', icon: '◉', href: '/me' },
] as const;

export function AppFooter({ active }: { active: (typeof tabs)[number]['key'] }) {
  return <View style={styles.bar}>
    <View style={styles.studyHalo} />
    {tabs.map(tab => <Pressable key={tab.key} onPress={() => router.replace(tab.href)} style={styles.item}>
      <Text style={[styles.icon, tab.key === 'study' && styles.studyIcon, active === tab.key && styles.active]}>{tab.icon}</Text>
      <Text style={[styles.label, active === tab.key && styles.active]}>{tab.name}</Text>
    </Pressable>)}
  </View>;
}
