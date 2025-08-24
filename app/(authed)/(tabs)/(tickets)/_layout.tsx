import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function TicketsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Vé",
        headerShown: Platform.OS !== "web",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ticket/[id]" />
    </Stack>
  );
}
