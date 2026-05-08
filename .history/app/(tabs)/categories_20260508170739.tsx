import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../hooks/useCategories';

export default function CategoriesScreen() {
  const { categories, deleteCategory } = useCategories();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/category/new' as any)}
      >
        <Text style={styles.buttonText}>+ Nueva categoría</Text>
      </TouchableOpacity>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => router.push(`/category/${item.id}` as any)}>
                <Text style={styles.edit}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCategory(item.id)}>
                <Text style={styles.delete}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  button: { backgroundColor: '#000', padding: 12, borderRadius: 6, marginBottom: 16 },
  buttonText: { color: '#fff', textAlign: 'center' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  itemText: { fontSize: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  edit: { color: 'blue' },
  delete: { color: 'red' },
});