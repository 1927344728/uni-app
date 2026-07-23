import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from './DataPicker.styles';

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
        <Text style={[styles.caret, active && styles.triggerTextActive]}>⌄</Text>
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
