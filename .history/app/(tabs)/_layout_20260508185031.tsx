import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Transacciones' }}
      />
      <Tabs.Screen
        name="balance"
        options={{ title: 'Balance' }}
      />
      <Tabs.Screen
        name="categories"
        options={{ title: 'Categorías' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="category/[id]"
        options={{ href: null, title: 'Categoría' }}
      />
      <Tabs.Screen
        name="transaction/[id]"
        options={{ href: null, title: 'Transacción' }}
      />
    </Tabs>
  );
}