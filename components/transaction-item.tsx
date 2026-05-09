import { colors } from '@/constants/theme';
import { Transaction } from '@/types/transaction';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  item: Transaction;
  onPress: () => void;
}

export default function TransactionItem({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{item.amount}</Text>
      <Text style={styles.cardContent}>{item.description}</Text>
      <Text style={styles.cardType}>
        {item.type === 'income' ? 'ingreso' : 'egreso'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardContent: { fontSize: 14, color: colors.muted, marginBottom: 8 },
  cardType: {
    fontSize: 12,
    color: colors.surface,
    backgroundColor: colors.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textAlign: 'center',
    alignSelf: 'flex-start',
  },
});
