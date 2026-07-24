import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { styles } from './DataPicker.styles';
import { colors } from '@/common/theme/colors';

export type PickerOption = { value: string; label: string };

type DataPickerProps = {
  value: string | null;
  options: PickerOption[];
  placeholder: string;
  title: string;
  onChange: (value: string | null) => void;
};

export function DataPicker({ value, options, placeholder, title, onChange }: DataPickerProps) {
  const [visible, setVisible] = useState(false);
  const active = options.find(option => option.value === value);

  return (
    <>
      <Pressable style={[styles.trigger, active && styles.triggerActive]} onPress={() => setVisible(true)}>
        <Text style={[styles.triggerText, active && styles.triggerTextActive]} numberOfLines={1}>
          {active?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={14} color={active ? colors.primary : '#999'} />
      </Pressable>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.mask} onPress={() => setVisible(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Pressable onPress={() => { onChange(null); setVisible(false); }}>
                <Text style={styles.clear}>清空</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.options}>
              {options.map(option => (
                <Pressable
                  key={option.value}
                  style={[styles.option, value === option.value && styles.optionActive]}
                  onPress={() => { onChange(option.value); setVisible(false); }}
                >
                  <Text style={[styles.optionText, value === option.value && styles.optionTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
