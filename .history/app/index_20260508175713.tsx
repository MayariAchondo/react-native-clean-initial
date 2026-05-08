import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';

export default function TransactionsScreen() {
  const { transactions, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const router = useRouter();

  function getCategoryName(categoryId: string) {
    const category = categories.find((c: any) => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
}

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/transaction/new' as any)}
      >
        <Text style={styles.buttonText}>+ Nueva transacción</Text>
      </TouchableOpacity>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.category}>{getCategoryName(item.categoryId)}</Text>
            </View>
            <View style={styles.right}>
              <Text style={item.type === 'income' ? styles.income : styles.expense}>
                ${item.amount}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => router.push(`/transaction/${item.id}` as any)}>
                  <Text style={styles.edit}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                  <Text style={styles.delete}>Eliminar</Text>
                </TouchableOpacity>
              </View>
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
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  description: { fontSize: 16 },
  category: { fontSize: 12, color: '#888' },
  right: { alignItems: 'flex-end' },
  income: { color: 'green', fontWeight: 'bold' },
  expense: { color: 'red', fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 12 },
  edit: { color: 'blue' },
  delete: { color: 'red' },
});