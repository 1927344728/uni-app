import { styles } from './login.styles';
import { type ComponentProps, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { inputStyles } from '@/common/theme/input';
import { appAssets } from '@/config/assets';
import { api } from '@/lib/api';

const banner = appAssets.loginBanner;

export default function LoginScreen() {
  const { requestUrl } = useLocalSearchParams<{ requestUrl?: string }>();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const valid = useMemo(() => /^\d{11}$/.test(account) && /^\d{6}$/.test(password) && agreed, [account, agreed, password]);

  useEffect(() => { AsyncStorage.getItem('USER_MOBILE').then(value => value && setAccount(value)).catch(() => undefined); }, []);

  const login = () => {
    if (!valid || submitting) {
      if (!agreed) Alert.alert('提示', '请阅读并同意《用户协议》');
      else Alert.alert('提示', '请输入正确的手机号和 6 位密码');
      return;
    }
    setSubmitting(true);
    api.login(account, password).then(async () => {
      await AsyncStorage.setItem('USER_MOBILE', account);
      Alert.alert('提示', '登录成功！', [{ text: '确定', onPress: () => router.replace((requestUrl || '/') as never) }]);
    }).catch(error => Alert.alert('提示', error instanceof Error ? error.message : '登录失败')).finally(() => setSubmitting(false));
  };

  return (
    <View style={styles.page}>
      <Image source={{ uri: banner }} style={styles.banner} />
      <View style={styles.form}>
        <Field label="账号" value={account} onChangeText={setAccount} placeholder="请输入手机号" keyboardType="phone-pad" maxLength={11} />
        <Field label="密码" value={password} onChangeText={setPassword} placeholder="请输入密码" secureTextEntry maxLength={12} />
        <Pressable onPress={() => setAgreed(value => !value)} style={styles.agreement}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Text style={styles.check}>✓</Text>}
          </View>
          <Text style={styles.agreementText}>我已阅读并同意《用户协议》</Text>
        </Pressable>
      </View>
      <View style={styles.submit}>
        <Pressable onPress={login} style={[styles.button, (!valid || submitting) && styles.disabled]}>
          <Text style={styles.buttonText}>{submitting ? '登录中…' : '登录'}</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => router.replace('/')}>
        <Text style={styles.mock}>暂不登录</Text>
      </Pressable>
    </View>
  );
}

function Field({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={[inputStyles.fieldInput, styles.input]} placeholderTextColor="#b3b3b3" />
    </View>
  );
}
