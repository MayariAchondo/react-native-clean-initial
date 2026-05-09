import { colors } from '@/constants/theme';
import { Category } from '@/types/category';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  item: Category;
  onPress: () => void;
}

export default function CategoryItem({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{item.name}</Text>
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
  cardDate: { fontSize: 12, color: colors.muted },
});
