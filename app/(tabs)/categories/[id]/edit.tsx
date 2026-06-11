import { router, useLocalSearchParams } from 'expo-router';
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
import { useCategoryForm } from '@/hooks/useCategoryForm';
import { useMemo } from 'react';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, updateCategory } = useCategories();
  const categoryId = Number(id);
  const category = categories.find((n) => n.id === categoryId);

  const defaultValues = useMemo(() => {
    return category ? { nombre: category.name } : undefined;
  }, [category]);

  const form = useCategoryForm({
    mode: 'edit',
    defaultValues,
    onSubmit: async (data) => {
      await updateCategory(categoryId, data);
      router.back();
    },
  });

  if (!category) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Categoría no encontrada</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <Text style={styles.title}>Editar categoría</Text>

          <TextInput
            style={[
              styles.input,
              form.errors.titulo ? styles.inputError : null,
            ]}
            placeholder="Título"
            placeholderTextColor={colors.muted}
            value={form.name}
            onChangeText={form.setName}
          />
          {form.errors.titulo ? (
            <Text style={styles.errorLabel}>{form.errors.titulo}</Text>
          ) : null}

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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
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
  errorText: { fontSize: 18, color: colors.danger, marginBottom: 12 },
  backLink: { fontSize: 16, color: colors.tint, fontWeight: '600' },
});
