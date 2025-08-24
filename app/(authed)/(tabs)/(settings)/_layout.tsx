import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="settings" options={{ title: "Cài đặt" }} />
            <Stack.Screen name="setting/profile" options={{ title: "Thông tin cá nhân" }} />
            <Stack.Screen name="setting/adminUserManagement" options={{ title: "Quản lý người dùng" }} />
            <Stack.Screen name="setting/userDetail" options={{ title: "Chi tiết người dùng" }} />
        </Stack>
    )
}