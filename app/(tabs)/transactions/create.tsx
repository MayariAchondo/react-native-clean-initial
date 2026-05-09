import { SelectPicker } from '@/components/SelectPicker';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { useTransactions } from '@/hooks/useTransactions';

export default function CreateTransactionScreen() {
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();

  const form = useTransactionForm({
    mode: 'create',
    onSubmit: async (data) => {
      await addTransaction(data);
      router.back();
    },
  });

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Nueva transacción</Text>

          <TextInput
            style={[
              styles.input,
              form.errors.amount ? styles.inputError : null,
            ]}
            placeholder="Monto"
            placeholderTextColor={colors.muted}
            value={form.amount}
            onChangeText={form.setAmount}
          />
          {form.errors.amount ? (
            <Text style={styles.errorLabel}>{form.errors.amount}</Text>
          ) : null}

          <TextInput
            style={[
              styles.input,
              form.errors.description ? styles.inputError : null,
            ]}
            placeholder="Descripción"
            placeholderTextColor={colors.muted}
            value={form.description}
            onChangeText={form.setDescription}
          />
          {form.errors.description ? (
            <Text style={styles.errorLabel}>{form.errors.description}</Text>
          ) : null}

          <View style={styles.typeRow}>
            <TouchableOpacity
              style={
                form.type === 'income' ? styles.typeSelected : styles.typeOption
              }
              onPress={() => form.setType('income')}
            >
              <Text>Ingreso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                form.type === 'expense'
                  ? styles.typeSelected
                  : styles.typeOption
              }
              onPress={() => form.setType('expense')}
            >
              <Text>Egreso</Text>
            </TouchableOpacity>
          </View>

          <SelectPicker
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
            value={form.categoryId}
            onChange={form.setCategoryId}
            placeholder="Seleccionar categoría..."
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={form.handleSubmit}
            disabled={form.submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {form.submitting ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  inputMultiline: { minHeight: 120, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
  },
  typeSelected: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  label: { fontSize: 16, marginBottom: 8 },
  inputError: { borderColor: colors.danger },
  errorLabel: { fontSize: 12, color: colors.danger, marginBottom: 8 },
  submitButton: {
    backgroundColor: colors.tint,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
