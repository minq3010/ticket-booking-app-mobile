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
import { useRouter } from "expo-router";
import { styles } from "@/styles/_global";

export default function SettingsIndex() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    // quick local init from user context
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
            style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }}
          />
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111" }}>{name}</Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#2563eb", paddingVertical: 14, marginBottom: 12 }]}
          onPress={() => router.push("/(authed)/(screen)/(setting)/profile")}
        >
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>View Profile</Text>
        </TouchableOpacity>

        {user?.role === "manager" && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#0ea5a4", paddingVertical: 14, marginBottom: 12 }]}
            onPress={() => router.push("/(authed)/(screen)/(setting)/(manage)/adminUserManagement")}
          >
            <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>User Management</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#ef4444", paddingVertical: 14 }]}
          onPress={() =>
            Alert.alert(
              "Confirm Logout",
              "Are you sure you want to logout?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => logout() },
              ]
            )
          }
        >
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
