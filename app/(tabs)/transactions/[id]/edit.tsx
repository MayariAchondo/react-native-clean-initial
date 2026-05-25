import { SelectPicker } from '@/components/SelectPicker';
import { colors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useLocation } from '@/hooks/useLocation';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction } = useTransactions();
  const { categories } = useCategories();

  const transaction = transactions.find((t) => t.id === id);
  const img = useImagePicker(transaction?.photoUri);
  const loc = useLocation();

  const defaultValues = useMemo(() => {
    return transaction
      ? {
          amount: transaction.amount.toString(),
          type: transaction.type,
          description: transaction.description,
          categoryId: transaction.categoryId,
        }
      : undefined;
  }, [transaction]);

  const form = useTransactionForm({
    mode: 'edit',
    defaultValues,
    onSubmit: async (data) => {
      await updateTransaction(id!, {
        ...data,
        photoUri: img.imageUri ?? undefined,
        location: loc.location ?? undefined,
      });
      router.back();
    },
  });

  if (!transaction) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Transacción no encontrada</Text>
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
          <Text style={styles.title}>Editar transacción</Text>

          <TextInput
            style={[
              styles.input,
              form.errors.amount ? styles.inputError : null,
            ]}
            placeholder="Monto"
            placeholderTextColor={colors.muted}
            value={form.amount}
            onChangeText={form.setAmount}
            keyboardType="numeric"
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
          {form.errors.categoryId ? (
            <Text style={styles.errorLabel}>{form.errors.categoryId}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Comprobante</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={img.pickFromCamera}>
              <Text style={styles.photoBtnText}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={img.pickFromGallery}>
              <Text style={styles.photoBtnText}>Desde galería</Text>
            </TouchableOpacity>
          </View>
          {img.permissionError ? (
            <Text style={styles.errorMessage}>{img.permissionError}</Text>
          ) : null}
          {img.imageUri ? (
            <View>
              <Image
                source={{ uri: img.imageUri }}
                style={styles.preview}
                resizeMode="cover"
              />
              <TouchableOpacity onPress={img.clearImage}>
                <Text style={styles.removeLink}>Quitar foto</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Ubicación</Text>
          {transaction.location && !loc.location ? (
            <Text style={styles.coordsText}>
              Lat: {transaction.location.latitude}, Lon: {transaction.location.longitude}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={loc.getCurrentLocation}
            disabled={loc.loading}
          >
            {loc.loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.locationBtnText}>Registrar ubicación</Text>
            )}
          </TouchableOpacity>
          {loc.permissionError ? (
            <Text style={styles.errorMessage}>{loc.permissionError}</Text>
          ) : null}
          {loc.location ? (
            <View>
              <Text style={styles.coordsText}>
                Lat: {loc.location.latitude}, Lon: {loc.location.longitude}
              </Text>
              <TouchableOpacity onPress={loc.clearLocation}>
                <Text style={styles.removeLink}>Limpiar ubicación</Text>
              </TouchableOpacity>
            </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
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
  inputError: { borderColor: colors.danger },
  errorLabel: { fontSize: 12, color: colors.danger, marginBottom: 8 },
  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  photoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  photoBtnText: { fontSize: 14, color: colors.tint, fontWeight: '600' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  removeLink: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  locationBtn: {
    backgroundColor: colors.tint,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  locationBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  coordsText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: colors.tint,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 18, color: colors.danger, marginBottom: 12 },
  backLink: { fontSize: 16, color: colors.tint, fontWeight: '600' },
});
