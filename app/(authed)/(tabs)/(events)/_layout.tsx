import { Stack } from "expo-router";

export default function EventsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index"/>
            <Stack.Screen name="new"/>
            <Stack.Screen name="event/[id]"/>
        </Stack>
    )
}