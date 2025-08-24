import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function EventsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: Platform.OS !== "web",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="new" />
            <Stack.Screen name="event/[id]" />
        </Stack>
    );
}