import { styles } from './password.styles';
import { type ComponentProps, useMemo, useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { appAssets } from '@/config/assets';
import { api } from '@/lib/api';

const banner = appAssets.passwordBanner;

export default function PasswordScreen() {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const valid = useMemo(() => Boolean(password) && /^.{6,12}$/.test(newPassword) && confirmPassword === newPassword, [confirmPassword, newPassword, password]);

  const updatePassword = () => {
    if (!valid || submitting) {
      const message = !password ? '请输入旧密码' : !/^.{6,12}$/.test(newPassword) ? '新密码不能少于6位' : '两次输入的新密码不一致';
      Alert.alert('提示', message);
      return;
    }
    setSubmitting(true);
    api.updatePassword(password, newPassword).then(() => {
      Alert.alert('提示', '密码修改成功！', [{ text: '确定', onPress: () => router.replace('/login') }]);
    }).catch(error => Alert.alert('提示', error instanceof Error ? error.message : '密码修改失败')).finally(() => setSubmitting(false));
  };

  return <View style={styles.page}>
    <Image source={{ uri: banner }} style={styles.banner} />
    <View style={styles.form}>
      <Field label="旧密码" value={password} onChangeText={setPassword} placeholder="请输入旧密码" />
      <Field label="新密码" value={newPassword} onChangeText={setNewPassword} placeholder="请输入新密码" />
      <Field label="确认新密码" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="请再次输入新密码" />
    </View>
    <View style={styles.submit}><Pressable onPress={updatePassword} style={[styles.button, (!valid || submitting) && styles.disabled]}><Text style={styles.buttonText}>{submitting ? '提交中…' : '提交'}</Text></Pressable></View>
  </View>;
}

function Field({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} secureTextEntry style={styles.input} placeholderTextColor="#b3b3b3" maxLength={12} /></View>;
}
