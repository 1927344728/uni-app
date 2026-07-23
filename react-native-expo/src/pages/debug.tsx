import { styles } from './debug.styles';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { api } from '@/lib/api';

export default function DebugScreen() {
  const [result, setResult] = useState('点击按钮测试接口连接。');
  const [loading, setLoading] = useState(false);

  const testConnection = () => {
    setLoading(true);
    api.welcome().then(data => setResult(JSON.stringify(data, null, 2) || '接口连接成功'))
      .catch(error => setResult(error instanceof Error ? error.message : '请求异常'))
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>测试页面</Text>
      <Text style={styles.description}>验证应用能否连接服务端。</Text>
      <Pressable onPress={testConnection} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? '测试中…' : '测试接口连接'}</Text>
      </Pressable>
      <ScrollView style={styles.result}>
        <Text selectable style={styles.resultText}>{result}</Text>
      </ScrollView>
    </View>
  );
}
