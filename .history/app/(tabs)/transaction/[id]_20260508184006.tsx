import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../../hooks/useCategories';
import { useTransactionForm } from '../../../hooks/useTransactionForm';
import { useTransactions } from '../../../hooks/useTransactions';


export default function TransactionFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = id !== 'new';
  const router = useRouter();
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { categories, loadCategories } = useCategories();
  const { amount, setAmount, type, setType, description, setDescription, categoryId, setCategoryId, errors, validate, reset } = useTransactionForm();

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  useEffect(() => {
    if (isEditing) {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setAmount(transaction.amount.toString());
        setType(transaction.type);
        setDescription(transaction.description);
        setCategoryId(transaction.categoryId);
      }
    }
  }, [id, isEditing, transactions, setAmount, setType, setDescription, setCategoryId]);

  async function handleSave() {
    if (!validate()) return;
    const data = { amount: parseFloat(amount), type, description, categoryId };
    if (isEditing) {
      await updateTransaction(id, data);
    } else {
      await addTransaction(data);
    }
    reset();
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Editar' : 'Nueva'} transacción</Text>
      <TextInput
        style={styles.input}
        placeholder="Monto"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      {errors.amount ? <Text style={styles.error}>{errors.amount}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      {errors.description ? <Text style={styles.error}>{errors.description}</Text> : null}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={type === 'income' ? styles.typeSelected : styles.typeOption}
          onPress={() => setType('income')}
        >
          <Text>Ingreso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={type === 'expense' ? styles.typeSelected : styles.typeOption}
          onPress={() => setType('expense')}
        >
          <Text>Egreso</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Categoría:</Text>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={cat.id === categoryId ? styles.typeSelected : styles.typeOption}
          onPress={() => setCategoryId(cat.id)}
        >
          <Text>{cat.name}</Text>
        </TouchableOpacity>
      ))}
      {errors.categoryId ? <Text style={styles.error}>{errors.categoryId}</Text> : null}
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
  label: { fontSize: 16, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeOption: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
  typeSelected: { borderWidth: 1, borderColor: '#000', padding: 10, borderRadius: 6, backgroundColor: '#eee' },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});