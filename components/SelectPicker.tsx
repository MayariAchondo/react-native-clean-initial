// components/SelectPicker.tsx
import { colors } from '@/constants/theme';
import { Picker } from '@react-native-picker/picker';
import { Platform, View } from 'react-native';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SelectPicker({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
}: Props) {
  if (Platform.OS === 'web') {
    return (
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.border,
            borderRadius: 8,
            padding: '14px 12px',
            fontSize: 16,
            color: value ? colors.text : colors.muted,
            backgroundColor: colors.surface,
            width: '100%',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: 15,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: 18,
            color: colors.muted,
          }}
        >
          ⌵
        </div>
      </div>
    );
  }

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        marginBottom: 8,
      }}
    >
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={{ color: colors.text }}
      >
        <Picker.Item label={placeholder} value="" />
        {options.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
    </View>
  );
}
