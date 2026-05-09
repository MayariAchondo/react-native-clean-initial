import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';

import { colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BalanceScreen() {
  const { totalIncome, totalExpense, balance, reload } = useTransactions();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Balance</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total ingresos:</Text>
          <Text style={styles.income}>${totalIncome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total egresos:</Text>
          <Text style={styles.expense}>${totalExpense}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Balance:</Text>
          <Text style={styles.balance}>${balance}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: { fontSize: 16 },
  income: { fontSize: 16, color: 'green', fontWeight: 'bold' },
  expense: { fontSize: 16, color: 'red', fontWeight: 'bold' },
  balance: { fontSize: 16, fontWeight: 'bold' },
});
