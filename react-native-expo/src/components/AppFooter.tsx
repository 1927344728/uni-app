import { styles } from './AppFooter.styles';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const tabs = [
  { key: 'index', name: '首页', icon: 'home-outline', activeIcon: 'home', href: '/' },
  { key: 'task', name: '任务', icon: 'wallet-outline', activeIcon: 'wallet', href: '/task' },
  { key: 'study', name: '学习', icon: 'school-outline', activeIcon: 'school', href: '/study' },
  { key: 'life', name: '生活', icon: 'gift-outline', activeIcon: 'gift', href: '/life' },
  { key: 'me', name: '我', icon: 'person-outline', activeIcon: 'person', href: '/me' },
] as const;

export function AppFooter({ active }: { active: (typeof tabs)[number]['key'] }) {
  return <View style={styles.bar}>
    <View style={styles.studyHalo} />
    {tabs.map(tab => <Pressable key={tab.key} onPress={() => router.replace(tab.href)} style={styles.item}>
      <Ionicons
        name={active === tab.key ? tab.activeIcon : tab.icon}
        size={tab.key === 'study' ? 27 : 20}
        color={active === tab.key ? '#59c2ad' : '#999'}
        style={[styles.icon, tab.key === 'study' && styles.studyIcon]}
      />
      <Text style={[styles.label, active === tab.key && styles.active]}>{tab.name}</Text>
    </Pressable>)}
  </View>;
}
