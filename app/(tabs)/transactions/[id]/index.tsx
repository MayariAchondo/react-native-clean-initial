import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import { colors } from '@/constants/theme';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);
  const { deleteTransaction, getTransactionById } = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getTransactionById(transactionId);
          if (!cancelled) setTransaction(data);
        } catch {
          if (!cancelled) setError('Transacción no encontrada');
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => { cancelled = true; };
    }, [transactionId, getTransactionById]),
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Transacción no encontrada'}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleEliminar = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro?')) {
        deleteTransaction(transactionId).then(() => router.back());
      }
    } else {
      Alert.alert('Eliminar transacción', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transactionId);
            router.back();
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.amount}>
          {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
        </Text>

        <Text style={styles.type}>
          {transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Descripción</Text>
        <Text style={styles.value}>{transaction.description}</Text>

        <Text style={styles.label}>Categoría</Text>
        <Text style={styles.value}>{transaction.category?.name ?? 'Sin categoría'}</Text>

        <Text style={styles.label}>Fecha</Text>
        <Text style={styles.value}>
          {new Date(transaction.date).toLocaleDateString()}
        </Text>

        {transaction.receiptUrl ? (
          <View>
            <Text style={styles.label}>Comprobante</Text>
            <Image
              source={{ uri: transaction.receiptUrl }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {transaction.latitude && transaction.longitude ? (
          <View>
            <Text style={styles.label}>Ubicación</Text>
            <Text style={styles.value}>
              Lat: {transaction.latitude}, Lon: {transaction.longitude}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/transactions/[id]/edit',
                params: { id: transactionId },
              })
            }
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleEliminar}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  type: { fontSize: 14, color: colors.muted, marginBottom: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  photo: { width: '100%', height: 200, borderRadius: 8, marginTop: 4 },
  label: { fontSize: 12, color: colors.muted, marginBottom: 2, marginTop: 12 },
  value: { fontSize: 16, color: colors.text },
  actions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  editButton: {
    flex: 1,
    backgroundColor: colors.tint,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 18, color: colors.danger, marginBottom: 12 },
  backLink: { fontSize: 16, color: colors.tint, fontWeight: '600' },
});