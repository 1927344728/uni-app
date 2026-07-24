import { styles } from './ContentBlocks.styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, useWindowDimensions, View, type ImageStyle, type StyleProp } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { AppVideoView } from '@/components/video/AppVideoView';
import { useAppVideoPlayer } from '@/components/video/useAppVideoPlayer';
import { colors } from '@/common/theme/colors';
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

const MODULE_HORIZONTAL_PADDING = 32;

function imageUrl(uri: unknown, width = 750) {
  return typeof uri === 'string' ? `${uri}${uri.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;
}

function resolveImageNaturalSize(event: { nativeEvent: { source?: { width?: number; height?: number }; target?: { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number } } }) {
  const { source, target } = event.nativeEvent;
  const width = source?.width ?? target?.naturalWidth ?? target?.width;
  const height = source?.height ?? target?.naturalHeight ?? target?.height;
  if (!width || !height) return null;
  return { width, height };
}

function collectImageUrls(blocks: ArticleBlock[]) {
  return blocks
    .filter(block => block.type === 'image')
    .flatMap(block => parts(block.content))
    .filter((url): url is string => typeof url === 'string');
}

function ImagePreview({
  urls,
  index,
  onClose,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: width * index, animated: false });
    });
  }, [index, width]);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.previewPage}>
        <Pressable
          style={[styles.previewClose, { top: insets.top + 8 }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="关闭"
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.previewScroll}
        >
          {urls.map((url, urlIndex) => (
            <View key={`${url}-${urlIndex}`} style={[styles.previewSlide, { width, height }]}>
              <Image source={{ uri: url }} style={styles.previewImage} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function getUrlParam(url: string, key: string) {
  const query = url.split('?')[1];
  if (!query) return undefined;
  return new URLSearchParams(query).get(key) ?? undefined;
}

function getVideoHeight(url: string, fullWidth: boolean, windowWidth: number) {
  const contentWidth = fullWidth ? windowWidth : windowWidth - MODULE_HORIZONTAL_PADDING;
  const ratio = Number(getUrlParam(url, 'ratio'));
  if (ratio > 0 && contentWidth > 0) return Math.round(contentWidth * ratio);
  return 225;
}

type ReadTextSegment = { kind: 'title' | 'author' | 'body'; text: string };

function parseReadTextSegments(html: unknown): ReadTextSegment[] {
  const source = String(html ?? '');
  if (!source.includes('<')) return [{ kind: 'body', text: plain(source) }];

  const segments: ReadTextSegment[] = [];
  const pattern = /<([a-z]+)[^>]*class=["'][^"']*\b(title|author)\b[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    const kind = match[2].toLowerCase() as 'title' | 'author';
    const text = plain(match[3]);
    if (text) segments.push({ kind, text });
  }
  if (!segments.length) return [{ kind: 'body', text: plain(source) }];
  return segments;
}

function FlexibleImage({
  uri,
  fullWidth,
  imageStyle,
}: {
  uri: string;
  fullWidth: boolean;
  imageStyle?: StyleProp<ImageStyle>;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const requestWidth = Math.round(fullWidth ? windowWidth : windowWidth - MODULE_HORIZONTAL_PADDING);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const src = imageUrl(uri, requestWidth);

  useEffect(() => {
    if (!src) return;
    setAspectRatio(null);
    Image.getSize(
      src,
      (width, height) => {
        if (width > 0 && height > 0) setAspectRatio(width / height);
      },
      () => undefined,
    );
  }, [src]);

  return (
    <Image
      source={{ uri: src }}
      style={[
        styles.image,
        fullWidth && styles.fullWidthImage,
        imageStyle,
        aspectRatio != null && { aspectRatio },
      ]}
      resizeMode="cover"
      onLoad={event => {
        const size = resolveImageNaturalSize(event);
        if (!size) return;
        setAspectRatio(size.width / size.height);
      }}
    />
  );
}

function ArticleImage({ uri, fullWidth, onPress }: { uri: string; fullWidth: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <FlexibleImage uri={uri} fullWidth={fullWidth} />
    </Pressable>
  );
}

function VideoBlock({
  uri,
  fullWidth,
  playing,
  height,
  objectFit,
}: {
  uri: string;
  fullWidth: boolean;
  playing: boolean;
  height: number;
  objectFit?: 'contain' | 'cover';
}) {
  const player = useAppVideoPlayer(playing ? uri : null, instance => { instance.loop = false; });
  if (!playing) return null;
  return (
    <AppVideoView
      player={player}
      nativeControls
      contentFit={objectFit ?? 'contain'}
      style={[styles.video, { height }, fullWidth && styles.fullWidthVideo]}
    />
  );
}

function VideoPopupBlock({
  item,
  values,
  allBlocks,
  fullWidth,
  isLast,
}: {
  item: ArticleBlock;
  values: unknown[];
  allBlocks: ArticleBlock[];
  fullWidth: boolean;
  isLast?: boolean;
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
    <Pressable onPress={openPlayer} style={[styles.module, fullWidth && styles.fullWidth, isLast && styles.moduleLast]}>
      <View style={[styles.mediaCard, fullWidth && styles.fullWidthMediaCard]}>
        <View style={styles.popupWrapper}>
          {typeof item.poster === 'string' && (
            <Image source={{ uri: imageUrl(item.poster) }} style={styles.popupCover} resizeMode="cover" />
          )}
          <View style={styles.popupMask} />
          <View style={styles.playIcon}>
            <Ionicons name="play" size={18} color="#fff" style={styles.playIconGlyph} />
          </View>
        </View>
      </View>
      {!!item.description && <Text style={styles.videoCaption}>{plain(item.description)}</Text>}
    </Pressable>
  );
}

export function ContentBlocks({ content }: { content: unknown }) {
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ urls: string[]; index: number } | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const blocks = (Array.isArray(content) ? content : []) as ArticleBlock[];
  const imageUrls = useMemo(() => collectImageUrls(blocks), [blocks]);

  useEffect(() => () => { Speech.stop(); }, []);

  const openPreview = (url: string) => {
    const index = imageUrls.findIndex(item => item === url);
    if (index < 0) return;
    setPreview({ urls: imageUrls, index });
  };

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
    <>
      <View style={styles.modules}>
      {blocks.map((item, index) => {
        const values = parts(item.content);
        const fullWidth = item.className === 'full_width';
        const isLast = index === blocks.length - 1;
        const moduleStyle = [styles.module, fullWidth && styles.fullWidth, isLast && styles.moduleLast];
        if (['title', 'author', 'text', 'subTitle', 'richText'].includes(String(item.type))) {
          const blockType = String(item.type);
          return (
            <View
              key={index}
              style={[
                ...moduleStyle,
                blockType === 'title' && styles.titleModule,
                (blockType === 'author' || blockType === 'subTitle') && styles.mutedModule,
              ]}
            >
              {values.map((value, valueIndex) => (
                <Text
                  key={valueIndex}
                  style={[
                    styles.moduleItem,
                    valueIndex === values.length - 1 && styles.moduleItemLast,
                    blockType === 'title' && styles.titleText,
                    blockType === 'author' && styles.authorText,
                    blockType === 'subTitle' && styles.subTitleText,
                    blockType === 'text' && styles.bodyText,
                    blockType === 'richText' && styles.richText,
                  ]}
                >
                  {plain(value)}
                </Text>
              ))}
            </View>
          );
        }
        if (item.type === 'readText') {
          return (
            <Pressable
              key={index}
              onPress={() => speak(item, index)}
              style={[...moduleStyle, styles.readModule]}
            >
              <View style={[styles.readCard, fullWidth && styles.fullWidthReadCard]}>
                <Ionicons
                  name={speakingIndex === index ? 'volume-high' : 'volume-mute'}
                  size={18}
                  color={speakingIndex === index ? colors.primary : colors.textDisabled}
                  style={styles.readIcon}
                />
                {values.map((value, valueIndex) => (
                  <View key={valueIndex}>
                    {parseReadTextSegments(value).map((segment, segmentIndex) => (
                      <Text
                        key={segmentIndex}
                        style={[
                          styles.moduleItem,
                          segment.kind === 'title' && styles.readInnerTitle,
                          segment.kind === 'author' && styles.readInnerAuthor,
                          segment.kind === 'body' && styles.readBodyText,
                        ]}
                      >
                        {segment.text}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </Pressable>
          );
        }
        if (item.type === 'image') {
          return (
            <View key={index} style={[...moduleStyle, styles.imageModule]}>
              {values.map((value, valueIndex) => typeof value === 'string' && (
                <View
                  key={valueIndex}
                  style={[styles.imageItem, valueIndex === values.length - 1 && styles.moduleItemLast]}
                >
                  <ArticleImage uri={value} fullWidth={fullWidth} onPress={() => openPreview(value)} />
                  {!!item.description && valueIndex === values.length - 1 && (
                    <Text style={styles.imageCaption}>{plain(item.description)}</Text>
                  )}
                </View>
              ))}
            </View>
          );
        }
        if (item.type === 'video' && typeof values[0] === 'string') {
          const videoUri = String(values[0]);
          return (
            <View key={index} style={[...moduleStyle, styles.videoModule]}>
              <View style={[styles.mediaCard, fullWidth && styles.fullWidthMediaCard]}>
                <VideoBlock
                  uri={videoUri}
                  fullWidth={fullWidth}
                  playing
                  height={getVideoHeight(videoUri, fullWidth, windowWidth)}
                  objectFit={item.objectFit}
                />
              </View>
              {!!item.description && <Text style={styles.videoCaption}>{plain(item.description)}</Text>}
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
              isLast={isLast}
            />
          );
        }
        if (item.type === 'card') {
          return (
            <Pressable
              key={index}
              onPress={() => speak(item, index)}
              style={[...moduleStyle, styles.cardModule]}
            >
              <View style={[styles.cardWrapper, fullWidth && styles.fullWidthCard]}>
                {typeof values[0] === 'string' && (
                  <FlexibleImage uri={values[0]} fullWidth={fullWidth} imageStyle={styles.cardImage} />
                )}
                {values[1] !== undefined && (
                  <Text style={styles.cardDesc}>{plain(values[1])}</Text>
                )}
              </View>
            </Pressable>
          );
        }
        return null;
      })}
      </View>
      {preview && (
        <ImagePreview
          urls={preview.urls}
          index={preview.index}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
