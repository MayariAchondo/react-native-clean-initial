import { Stack } from 'expo-router';

export default function CategoryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="create"
        options={{ title: 'Nueva categoría', headerBackTitle: 'Listado' }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{ title: 'Detalle', headerBackTitle: 'Listado' }}
      />
      <Stack.Screen name="[id]/edit" options={{ title: 'Editar categoría' }} />
    </Stack>
  );
}
