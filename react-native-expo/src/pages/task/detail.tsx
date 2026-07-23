import { styles } from './detail.styles';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api, type ApiItem } from '@/lib/api';

const statuses: Record<string, string> = { '1': '未开始', '2': '进行中', '3': '已完成', '4': '已取消' };

function date(value: unknown) {
  const time = new Date(Number(value));
  return Number.isNaN(time.getTime()) ? '' : `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`;
}

function text(value: unknown) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function DetailBlocks({ data }: { data: unknown }) {
  const blocks = Array.isArray(data) ? data : [];
  return (
    <View>
      {blocks.map((block, index) => {
        const item = block as ApiItem;
        const content = Array.isArray(item.content) ? item.content : [item.content];
        return (
          <View key={`${String(item.type)}-${index}`} style={styles.block}>
            {content.filter(Boolean).map((value, contentIndex) => (
              <Text key={contentIndex} style={styles.blockText}>{text(value)}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [task, setTask] = useState<ApiItem | null>(null);

  useEffect(() => { if (id) api.task(id).then(value => setTask(value ?? null)).catch(() => setTask(null)); }, [id]);
  if (!task) return <View style={styles.loading}><Text style={styles.loadingText}>加载中…</Text></View>;

  const progress = Math.max(0, Math.min(100, Number(task.progress ?? 0)));
  const detail = (label: string, value: unknown) => (
    <View style={styles.item} key={label}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{text(value)}</Text>
    </View>
  );

  const sectionTitles = { awards: '奖励', attachments: '附件', works: '作品' } as const;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{text(task.title)}</Text>
      {!!task.publisher && <Text style={styles.author}>{text(task.publisher)}</Text>}
      {detail('任务人', task.targeter)}
      {task.publishTime !== undefined && detail('发布时间', date(task.publishTime))}
      {task.startTime !== undefined && detail('开始时间', date(task.startTime))}
      {task.endTime !== undefined && detail('结束时间', date(task.endTime))}
      {detail('任务内容', task.content)}
      {detail('验收标准', task.finished)}
      <View style={styles.item}>
        <Text style={styles.label}>状态</Text>
        <View style={[styles.status, styles[`status${String(task.status)}` as keyof typeof styles]]}>
          <Text style={styles.statusText}>{statuses[String(task.status)] ?? '未知'}</Text>
        </View>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>进度</Text>
        <View style={styles.progressWrap}>
          <View style={styles.track}>
            <View style={[styles.progress, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
      {(['awards', 'attachments', 'works'] as const).map(key => (
        Array.isArray(task[key]) && task[key].length > 0 && (
          <View style={styles.section} key={key}>
            <Text style={styles.sectionTitle}>{sectionTitles[key]}</Text>
            <DetailBlocks data={task[key]} />
          </View>
        )
      ))}
    </ScrollView>
  );
}
