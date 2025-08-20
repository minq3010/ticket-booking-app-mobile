import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen name="setting/profile" options={{ title: "Profile" }} />
            <Stack.Screen name="setting/adminUserManagement" options={{ title: "User Management" }} />
            <Stack.Screen name="setting/userDetail" options={{ title: "User Details" }} />
        </Stack>
    )
}