import { colors } from '@/constants/theme';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

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
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.arrow}>⌵</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.centeredBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.closeBtn}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerText: { fontSize: 16, color: colors.text },
  placeholder: { color: colors.muted },
  arrow: { fontSize: 16, color: colors.muted },
  centeredBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  sheet: {
    backgroundColor: colors.surface,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  closeBtn: { fontSize: 16, color: colors.tint },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: { backgroundColor: colors.tint + '20' },
  optionText: { fontSize: 16, color: colors.text },
  optionTextSelected: { color: colors.tint, fontWeight: '600' },
});
