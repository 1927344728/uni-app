import { styles } from './detail.styles';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { VideoView, useVideoPlayer } from 'expo-video';
import { api, type ApiItem } from '@/lib/api';

type ArticleBlock = ApiItem & { type?: string; content?: unknown; description?: string; className?: string; poster?: string; rate?: number; objectFit?: 'contain' | 'cover' };

function plain(value: unknown) {
  return String(value ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/div>|<\/li>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim();
}
function parts(value: unknown) {
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}
function imageUrl(uri: unknown, width = 750) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;
}

function VideoBlock({ uri, fullWidth }: { uri: string; fullWidth: boolean }) {
  const player = useVideoPlayer(uri, player => { player.loop = false; });
  return <VideoView player={player} nativeControls contentFit="contain" style={[styles.video, fullWidth && styles.fullWidthVideo]} />;
}

function ContentBlocks({ content }: { content: unknown }) {
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const blocks = (Array.isArray(content) ? content : []) as ArticleBlock[];
  useEffect(() => () => { Speech.stop(); }, []);

  const speak = (item: ArticleBlock, index: number) => {
    if (speakingIndex === index) { Speech.stop(); setSpeakingIndex(null); return; }
    Speech.stop();
    setSpeakingIndex(index);
    Speech.speak(parts(item.content).map(plain).join(''), { language: 'zh-CN', rate: Number(item.rate ?? .5), onDone: () => setSpeakingIndex(null), onStopped: () => setSpeakingIndex(null), onError: () => setSpeakingIndex(null) });
  };

  return (
    <View style={styles.modules}>
      {blocks.map((item, index) => {
        const values = parts(item.content);
        const fullWidth = item.className === 'full_width';
        if (['title', 'author', 'text', 'subTitle', 'richText'].includes(String(item.type))) {
          return (
            <View
              key={index}
              style={[
                styles.module,
                fullWidth && styles.fullWidth,
                item.type === 'title' && styles.moduleTitle,
                (item.type === 'author' || item.type === 'subTitle') && styles.centerMuted,
              ]}
            >
              {values.map((value, valueIndex) => (
                <Text key={valueIndex} style={[styles.moduleText, item.type === 'richText' && styles.justify]}>
                  {plain(value)}
                </Text>
              ))}
            </View>
          );
        }
        if (item.type === 'readText') {
          return (
            <Pressable key={index} onPress={() => speak(item, index)} style={[styles.module, styles.readCard, fullWidth && styles.fullWidth]}>
              <View>
                <Text style={styles.readIcon}>{speakingIndex === index ? '🔊' : '🔇'}</Text>
                {values.map((value, valueIndex) => (
                  <Text key={valueIndex} style={styles.moduleText}>{plain(value)}</Text>
                ))}
              </View>
            </Pressable>
          );
        }
        if (item.type === 'image') {
          return (
            <View key={index} style={[styles.module, fullWidth && styles.fullWidth]}>
              {values.map((value, valueIndex) => typeof value === 'string' && (
                <Image key={valueIndex} source={{ uri: imageUrl(value) }} style={styles.image} resizeMode="contain" />
              ))}
              {!!item.description && <Text style={styles.caption}>{plain(item.description)}</Text>}
            </View>
          );
        }
        if (item.type === 'video' && typeof values[0] === 'string') {
          return (
            <View key={index} style={[styles.module, fullWidth && styles.fullWidth]}>
              <VideoBlock uri={String(values[0])} fullWidth={fullWidth} />
              {!!item.description && <Text style={styles.caption}>{plain(item.description)}</Text>}
            </View>
          );
        }
        if (item.type === 'videoPopup') {
          return (
            <View key={index} style={[styles.module, fullWidth && styles.fullWidth]}>
              {typeof item.poster === 'string' && (
                <Image source={{ uri: imageUrl(item.poster) }} style={styles.popupCover} />
              )}
              {typeof values[0] === 'string' && <VideoBlock uri={String(values[0])} fullWidth={fullWidth} />}
              {!!item.description && <Text style={styles.caption}>{plain(item.description)}</Text>}
            </View>
          );
        }
        if (item.type === 'card') {
          return (
            <View key={index} style={[styles.card, fullWidth && styles.fullWidth]}>
              {typeof values[0] === 'string' && (
                <Image source={{ uri: imageUrl(values[0]) }} style={styles.cardImage} resizeMode="contain" />
              )}
              {values[1] !== undefined && <Text style={styles.cardText}>{plain(values[1])}</Text>}
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}

export default function ArticleDetailScreen() {
  const { id, articleId } = useLocalSearchParams<{ id?: string; articleId?: string }>();
  const [article, setArticle] = useState<ApiItem | null>(null);
  useEffect(() => { const articleIdValue = id ?? articleId; if (articleIdValue) api.article(articleIdValue).then(value => setArticle(value ?? null)).catch(() => setArticle(null)); }, [id, articleId]);
  if (!article) return <View style={styles.loading}><Text style={styles.loadingText}>加载中…</Text></View>;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ContentBlocks content={article.content} />
    </ScrollView>
  );
}
