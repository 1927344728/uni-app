import { styles } from './rhyme.styles';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { pinyin } from 'pinyin-pro';

type RawWord = { word: string; mark: number };
type Group = { key: string; title: string; leftRhyme: string; rightRhyme: string; left: RawWord[]; right: RawWord[] };
type Item = RawWord & { pinyin: string; pyArr: string[]; leftRhyme: string; rightRhyme: string; answer: 'front' | 'back'; uid: string; result?: 'ok' | 'bad' | 'skip' };
const words = (items: string, marks: number[]) => items.split(' ').map((word, index) => ({ word, mark: marks[index] ?? 0 }));
const contrasts: Group[] = [
  { key: 'an-ang', title: 'an（前鼻韵） 和 ang（后鼻韵）', leftRhyme: 'an', rightRhyme: 'ang', left: words('早安 答案 蓝天 万年 看见 元旦 干净 雨伞 危险 语言 河边 饭碗 喜欢 公园 饭店 光盘 温暖 探险 栏杆 安然 竹竿 沙滩 帆船 衬衫 赶路 站着', [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0]), right: words('太阳 花香 明亮 灯光 长江 放学 广场 房子 一样 让步 方向 帮忙 商场 冰箱 银行 希望 想象 绵羊 池塘 窗户 强壮 风霜 粮食 海浪 当然 唱歌 往来', [1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,0]) },
  { key: 'en-eng', title: 'en（前鼻韵） 和 eng（后鼻韵）', leftRhyme: 'en', rightRhyme: 'eng', left: words('什么 文字 认识 早晨 我们 分数 花盆 身体 认真 本子 门口 森林 温暖 树根 灰尘 衬衫 新闻', [0,0,0,1,1,0,1,0,1,0,0,0,0,1,1,0,1]), right: words('生日 灯光 成长 朋友 声音 风筝 丰盛 蜜蜂 名称 长城 乘凉 梦境', [0,0,0,0,0,1,1,1,1,1,0,0]) },
  { key: 'in-ing', title: 'in（前鼻韵） 和 ing（后鼻韵）', leftRhyme: 'in', rightRhyme: 'ing', left: words('今天 一斤 森林 进步 毛巾 拼音 新年 心里 近处 金鱼 信心 前进 辛勤 亲近 阴天 银杏', [0,1,1,0,1,1,0,0,0,0,1,1,1,0,0,0]), right: words('听写 明天 晴天 星星 高兴 事情 安静 蜻蜓 电影 透明 姓名 苹果 青菜 清水 井口 北京', [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1]) },
];
const singles = [{ key: 'un', title: 'un（前鼻韵）', words: words('春天 轮船 昆仑 论文 群体 困难 裙子 村庄 温顺 运气', [0,0,1,0,0,0,0,0,1,0]) }, { key: 'ong', title: 'ong（后鼻韵）', words: words('中国 冬天 松鼠 雄鹰 孔雀 彩虹 闹钟 重要 红色 运动 空气', [0,0,0,0,0,1,1,0,0,1,0]) }];
const enrich = (raw: RawWord) => ({ ...raw, pinyin: pinyin(raw.word, { toneType: 'symbol' }), pyArr: pinyin(raw.word, { type: 'array', toneType: 'symbol' }) as string[] });

function WordCell({ item, onPress }: { item: ReturnType<typeof enrich>; onPress: () => void }) {
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <View style={styles.characters}>
        {[...item.word].map((character, index) => (
          <Text key={`${character}-${index}`} style={[styles.character, item.mark === index && styles.mark]}>
            {character}
          </Text>
        ))}
      </View>
      <View style={styles.pinyin}>
        {item.pyArr.map((syllable, index) => (
          <Text key={`${syllable}-${index}`} style={[styles.syllable, item.mark === index && styles.mark]}>
            {syllable}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

export default function RhymeScreen() {
  const [detecting, setDetecting] = useState(false);
  const [results, setResults] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [choices, setChoices] = useState<Record<number, 'front' | 'back'>>({});
  const [score, setScore] = useState(0);
  const [scoreOpen, setScoreOpen] = useState(false);
  const scorePercent = items.length ? Math.floor(score / items.length * 100) : 0;

  const start = () => {
    const pool: Item[] = contrasts.flatMap(group => [
      ...group.left.map(raw => ({ ...enrich(raw), leftRhyme: group.leftRhyme, rightRhyme: group.rightRhyme, answer: 'front' as const })),
      ...group.right.map(raw => ({ ...enrich(raw), leftRhyme: group.leftRhyme, rightRhyme: group.rightRhyme, answer: 'back' as const })),
    ]).sort(() => Math.random() - .5);
    setItems(Array.from({ length: 50 }, (_, index) => ({ ...pool[index % pool.length], uid: `${Date.now()}-${index}` })));
    setChoices({});
    setResults(false);
    setDetecting(true);
  };
  const complete = () => {
    let total = 0;
    const next = items.map((item, index) => {
      const result = choices[index] ? choices[index] === item.answer ? 'ok' : 'bad' : 'skip';
      if (result === 'ok') total++;
      return { ...item, result };
    });
    setScore(total);
    setItems(next);
    setResults(true);
    setScoreOpen(true);
  };
  const sorted = useMemo(() => [...items].sort((a, b) => ({ bad: 0, ok: 1, skip: 2 }[a.result ?? 'skip'] - { bad: 0, ok: 1, skip: 2 }[b.result ?? 'skip'])), [items]);
  const speak = (word: string) => { Speech.stop(); Speech.speak(word, { language: 'zh-CN' }); };

  const handleBottomPress = () => {
    if (!detecting) start();
    else if (!results) complete();
    else { setDetecting(false); setResults(false); }
  };

  return (
    <SafeAreaView style={styles.page} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {!detecting ? (
          <>
            {contrasts.map(group => (
              <View key={group.key} style={styles.outer}>
                <Text style={styles.title}>{group.title}</Text>
                <View style={styles.contrast}>
                  <View style={styles.column}>
                    {group.left.map(item => (
                      <WordCell key={item.word} item={enrich(item)} onPress={() => speak(item.word)} />
                    ))}
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.column}>
                    {group.right.map(item => (
                      <WordCell key={item.word} item={enrich(item)} onPress={() => speak(item.word)} />
                    ))}
                  </View>
                </View>
              </View>
            ))}
            {singles.map(group => (
              <View key={group.key} style={styles.outer}>
                <Text style={styles.title}>{group.title}</Text>
                <View style={styles.twoColumns}>
                  {group.words.map(item => (
                    <WordCell key={item.word} item={enrich(item)} onPress={() => speak(item.word)} />
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : !results ? (
          <>
            {items.map((item, index) => (
              <View style={styles.question} key={item.uid}>
                <Pressable
                  onPress={() => setChoices(old => ({ ...old, [index]: 'front' }))}
                  style={[styles.choice, choices[index] === 'front' && styles.choiceOn]}
                >
                  <Text style={choices[index] === 'front' && styles.choiceTextOn}>{item.leftRhyme}</Text>
                </Pressable>
                <View style={styles.questionWord}>
                  {[...item.word].map((character, characterIndex) => (
                    <Text key={characterIndex} style={[styles.character, characterIndex === item.mark && styles.questionMark]}>
                      {character}
                    </Text>
                  ))}
                </View>
                <Pressable
                  onPress={() => setChoices(old => ({ ...old, [index]: 'back' }))}
                  style={[styles.choice, choices[index] === 'back' && styles.choiceOn]}
                >
                  <Text style={choices[index] === 'back' && styles.choiceTextOn}>{item.rightRhyme}</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.results}>
            {sorted.map(item => (
              <View
                key={item.uid}
                style={[styles.result, item.result === 'ok' ? styles.ok : item.result === 'bad' ? styles.bad : styles.skip]}
              >
                <View style={styles.characters}>
                  {[...item.word].map((character, index) => (
                    <Text key={index} style={[styles.character, index === item.mark && styles.mark]}>{character}</Text>
                  ))}
                </View>
                <View style={styles.pinyin}>
                  {item.pyArr.map((syllable, index) => (
                    <Text key={index} style={[styles.syllable, index === item.mark && styles.mark]}>{syllable}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.bottom}>
        {detecting && (
          <Text style={styles.hint}>
            {results ? (
              <>检测完成：答对 <Text style={styles.num}>{score}</Text> / <Text style={styles.num}>{items.length}</Text> 题</>
            ) : '请根据每行左右韵母，选择该词更接近哪一侧'}
          </Text>
        )}
        <Pressable
          style={[styles.bottomButton, results && styles.resetButton, detecting && !results && styles.doneButton]}
          onPress={handleBottomPress}
        >
          <Text style={[styles.bottomButtonText, results && styles.resetText]}>
            {!detecting ? '韵母拼音检测' : !results ? '完成检测' : '重新检测'}
          </Text>
        </Pressable>
      </View>
      <Modal transparent visible={scoreOpen} onRequestClose={() => setScoreOpen(false)}>
        <Pressable style={styles.modalMask} onPress={() => setScoreOpen(false)}>
          <Pressable style={styles.modal} onPress={() => undefined}>
            <Text style={styles.modalTitle}>检测完成</Text>
            <Text style={styles.modalScore}>
              得分 <Text style={styles.modalNumber}>{scorePercent}</Text> 分
            </Text>
            <Pressable style={styles.modalButton} onPress={() => setScoreOpen(false)}>
              <Text style={styles.bottomButtonText}>知道了</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
