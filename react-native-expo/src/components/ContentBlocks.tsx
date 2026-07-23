import { styles } from './ContentBlocks.styles';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { VideoView, useVideoPlayer } from 'expo-video';
import { type ApiItem } from '@/lib/api';

export type ArticleBlock = ApiItem & {
  type?: string;
  content?: unknown;
  description?: string;
  className?: string;
  poster?: string;
  rate?: number;
  objectFit?: 'contain' | 'cover';
};

function plain(value: unknown) {
  return String(value ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/div>|<\/li>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim();
}

function parts(value: unknown) {
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

function imageUrl(uri: unknown, width = 750) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;
}

function VideoBlock({ uri, fullWidth, playing }: { uri: string; fullWidth: boolean; playing: boolean }) {
  const player = useVideoPlayer(playing ? uri : null, player => { player.loop = false; });
  if (!playing) return null;
  return <VideoView player={player} nativeControls contentFit="contain" style={[styles.video, fullWidth && styles.fullWidthVideo]} />;
}

function VideoPopupBlock({
  item,
  values,
  allBlocks,
  fullWidth,
}: {
  item: ArticleBlock;
  values: unknown[];
  allBlocks: ArticleBlock[];
  fullWidth: boolean;
}) {
  const url = typeof values[0] === 'string' ? values[0] : '';
  const authorItem = allBlocks.find(block => block.type === 'author');
  const publisher = plain(authorItem?.content);

  const openPlayer = () => {
    const queue = allBlocks
      .filter(block => block.type === 'videoPopup' && block.content)
      .map((block, index) => ({
        id: `popup-${index}`,
        url: String(Array.isArray(block.content) ? block.content[0] : block.content),
        cover: block.poster,
        desc: block.description,
        publisher,
        objectFit: block.objectFit ?? 'cover',
      }));
    const current = queue.find(video => video.url === url) ?? queue[0];
    if (!current) return;
    router.push({
      pathname: '/video/play',
      params: {
        mode: 'inline',
        ids: JSON.stringify(queue),
        id: current.id,
      },
    });
  };

  return (
    <Pressable onPress={openPlayer} style={[styles.module, fullWidth && styles.fullWidth]}>
      <View style={styles.popupWrapper}>
        {typeof item.poster === 'string' && (
          <Image source={{ uri: imageUrl(item.poster) }} style={styles.popupCover} resizeMode="cover" />
        )}
        <View style={styles.popupMask} />
        <View style={styles.playIcon}>
          <Text style={styles.playIconText}>▶</Text>
        </View>
      </View>
      {!!item.description && <Text style={styles.caption}>{plain(item.description)}</Text>}
    </Pressable>
  );
}

export function ContentBlocks({ content }: { content: unknown }) {
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const blocks = (Array.isArray(content) ? content : []) as ArticleBlock[];

  useEffect(() => () => { Speech.stop(); }, []);

  const speak = (item: ArticleBlock, index: number) => {
    if (speakingIndex === index) { Speech.stop(); setSpeakingIndex(null); return; }
    Speech.stop();
    setSpeakingIndex(index);
    Speech.speak(parts(item.content).map(plain).join(''), {
      language: 'zh-CN',
      rate: Number(item.rate ?? .5),
      onDone: () => setSpeakingIndex(null),
      onStopped: () => setSpeakingIndex(null),
      onError: () => setSpeakingIndex(null),
    });
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
              <VideoBlock uri={String(values[0])} fullWidth={fullWidth} playing />
              {!!item.description && <Text style={styles.caption}>{plain(item.description)}</Text>}
            </View>
          );
        }
        if (item.type === 'videoPopup') {
          return (
            <VideoPopupBlock
              key={index}
              item={item}
              values={values}
              allBlocks={blocks}
              fullWidth={fullWidth}
            />
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
