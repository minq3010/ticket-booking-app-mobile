import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { styles } from "@/styles/_global";

export default function SettingsIndex() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitleStyle: { color: "#3b82f6" },
    });
  }, []);

  useEffect(() => {
    setAvatar(user?.avatar ?? "");
    setName(user?.name ?? "");
    setLoading(false);
  }, [user?.id]);


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Image
            source={{ uri: avatar || "https://res.cloudinary.com/dwuxlt4vt/image/upload/v1753775085/ev2jqk3owuxcv41o6knc.jpg" }}
            style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 12 }}
          />
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#3b82f6" }}>{name}</Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#2563eb", paddingVertical: 14, marginBottom: 12 }]}
          onPress={() => router.push("/(authed)/(tabs)/(settings)/setting/profile")}
        >
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Xem thông tin cá nhân</Text>
        </TouchableOpacity>

        {user?.role === "manager" && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#0ea5a4", paddingVertical: 14, marginBottom: 12 }]}
            onPress={() => router.push("/(authed)/(tabs)/(settings)/setting/adminUserManagement")}
          >
            <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Quản lý người dùng</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#ef4444", paddingVertical: 14 }]}
          onPress={() =>
            Alert.alert(
              "Xác nhận đăng xuất",
              "Bạn có chắc chắn muốn đăng xuất không?",
              [
                { text: "Hủy", style: "cancel" },
                { text: "Đăng xuất", style: "destructive", onPress: () => logout() },
              ]
            )
          }
        >
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
