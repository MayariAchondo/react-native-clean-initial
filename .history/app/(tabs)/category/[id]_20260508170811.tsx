import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../../hooks/useCategories';
import { useCategoryForm } from '../../../hooks/useCategoryForm';

export default function CategoryFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = id !== 'new';
  const router = useRouter();
  const { categories, addCategory, updateCategory } = useCategories();
  const { name, setName, error, validate, reset } = useCategoryForm();

  useEffect(() => {
    if (isEditing) {
      const category = categories.find(c => c.id === id);
      if (category) {
        setName(category.name);
      }
    }
  }, [id, isEditing, categories, setName]);

  async function handleSave() {
    if (!validate()) return;
    if (isEditing) {
      await updateCategory(id, name);
    } else {
      await addCategory(name);
    }
    reset();
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Editar' : 'Nueva'} categoría</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 8 },
  error: { color: 'red', marginBottom: 8 },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});