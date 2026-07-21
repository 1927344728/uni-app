import { styles } from './about.styles';
import { Image, Linking, Pressable, Text, View } from 'react-native';

const COS = 'https://assets.izhao.com.cn';

export default function AboutScreen() {
  return <View style={styles.page}>
    <View style={styles.header}>
      <Image source={{ uri: `${COS}/images/logo.png?imageMogr2/thumbnail/120x` }} style={styles.logo} />
      <Text style={styles.name}>一兆窗含</Text>
      <Text style={styles.version}>版本 1.0.4</Text>
    </View>
    <View style={styles.copyright}>
      <Pressable onPress={() => Linking.openURL('https://beian.miit.gov.cn/#/Integrated/index')}><Text style={[styles.text, styles.record]}>备案号：赣ICP备2026000533号-2A</Text></Pressable>
      <Text style={styles.text}>版权所有 © 2025-{new Date().getFullYear()} 李兆 保留所有权利</Text>
    </View>
  </View>;
}
