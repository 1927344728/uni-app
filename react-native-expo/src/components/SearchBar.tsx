import { TextInput, type TextInputProps } from 'react-native';
import { inputStyles } from '@/common/theme/input';

type SearchBarProps = Omit<TextInputProps, 'style'> & { style?: TextInputProps['style'] };

export function SearchBar({ placeholder = '请输入搜索词', placeholderTextColor = '#b3b3b3', style, ...props }: SearchBarProps) {
  return (
    <TextInput
      {...props}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      style={[inputStyles.search, style]}
    />
  );
}
