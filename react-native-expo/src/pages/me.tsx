import { styles } from './me.styles';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { AppFooter } from '@/components/AppFooter';
import { api, type ApiItem } from '@/lib/api';

const COS = 'https://assets.izhao.com.cn';
const avatar = `${COS}/images/snowman-8755896_1280.png?imageMogr2/thumbnail/160x`;
const background = `${COS}/images/ai-generated-8432305_1280.jpg?imageMogr2/thumbnail/750x`;
const loginBackground = `${COS}/images/pexels-photo-531880.jpeg?imageMogr2/thumbnail/750x`;
const features = [
  { name: '我的音乐', href: '/music?type=3' },
  { name: '我的视频', href: '/video?type=3' },
  { name: '我的文章', href: '/article?type=6' },
  { name: '我的书单', href: '/book' },
  { name: '我的成绩', href: '/article?type=1' },
];

const roleLabel = (role: unknown) => ({ 1: '超级管理员', 2: '家长', 3: '学生' }[Number(role)] ?? '未知角色');

export default function MeScreen() {
  const [user, setUser] = useState<ApiItem | null>(null);
  const fetchUser = useCallback(() => {
    void api.user().then(setUser).catch(() => setUser(null));
  }, []);
  useEffect(() => { fetchUser(); }, [fetchUser]);
  useFocusEffect(fetchUser);

  const clearCache = () => {
    AsyncStorage.clear().then(() => Alert.alert('提示', '缓存已清除！')).catch(() => Alert.alert('提示', '清除缓存失败'));
  };
  const logout = () => {
    api.logout().then(() => {
      setUser(null);
      router.replace('/');
    }).catch(() => Alert.alert('提示', '登出失败'));
  };

  return <View style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      {user ? <ImageBackground source={{ uri: background }} style={styles.profileBackground}>
        <View style={styles.userInfo}>
          <View style={styles.avatarWrap}><Image source={{ uri: avatar }} style={styles.avatar} /></View>
          <View><View style={styles.nameRow}><Text style={styles.name}>{String(user.nickname ?? user.name ?? '')}</Text><Text style={styles.role}>{roleLabel(user.role)}</Text></View><Pressable onPress={() => Linking.openURL(`tel:${String(user.phone_number ?? '')}`)}><Text style={styles.phone}>{String(user.phone_number ?? '')}</Text></Pressable></View>
        </View>
      </ImageBackground> : <ImageBackground source={{ uri: loginBackground }} style={styles.loginBackground}><Pressable onPress={() => router.push('/login')} style={styles.loginButton}><Text style={styles.loginText}>登录</Text></Pressable></ImageBackground>}

      <View style={styles.main}>
        <View style={styles.group}>{features.map(item => <Row key={item.name} label={item.name} onPress={() => router.push(item.href as never)} />)}</View>
        <View style={styles.group}><Row label="清除缓存" onPress={clearCache} /><Row label="关于" onPress={() => router.push('/me/about')} /></View>
      </View>
      {user && <View style={styles.actions}><Pressable onPress={() => router.push('/login/password')}><Text style={styles.action}>修改密码</Text></Pressable><Text style={styles.separator}>|</Text><Pressable onPress={logout}><Text style={styles.action}>退出登录</Text></Pressable></View>}
    </ScrollView>
    <AppFooter active="me" />
  </View>;
}

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.row}><Text style={styles.rowText}>{label}</Text><Text style={styles.chevron}>›</Text></Pressable>;
}
