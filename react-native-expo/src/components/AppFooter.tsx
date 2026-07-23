import { styles } from './AppFooter.styles';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { FOOTER_TABS } from '@/config/navigation';
import { colors } from '@/common/theme/colors';

export function AppFooter({ active }: { active: (typeof FOOTER_TABS)[number]['key'] }) {
  return (
    <View style={styles.bar}>
      <View style={styles.studyHalo} />
      {FOOTER_TABS.map(tab => (
        <Pressable key={tab.key} onPress={() => router.replace(tab.href)} style={styles.item}>
          <Ionicons
            name={active === tab.key ? tab.activeIcon : tab.icon}
            size={tab.key === 'study' ? 27 : 20}
            color={active === tab.key ? colors.primary : colors.textMuted}
            style={[styles.icon, tab.key === 'study' && styles.studyIcon]}
          />
          <Text style={[styles.label, active === tab.key && styles.active]}>{tab.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}
