import { useAuth } from "@/context/AuthContext";
import { Api } from "@/services/api";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
  BackHandler,
} from "react-native";

type Info = {
  avatar: string;
  name: string;
  phone: string;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [avatar, setAvatarUrl] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Lấy thông tin user
  let mounted = true;
  const fetchUserInfo = async () => {
    try {
      const res = await Api.get(`/user/${user?.id}`);
      // API trả về dữ liệu ở res.data.data
      const userData = res.data;
      console.log("User data:", userData);
      if (mounted && userData) {
        setInfo({
          avatar: userData.avatar ?? "",
          name: userData.name ?? "",
          phone: userData.phone ?? "",
        });
        setAvatarUrl(userData.avatar ?? "");
        setName(userData.name ?? "");
        setPhone(userData.phone ?? "");
      }
    } catch (error) {
      if (mounted) {
        Alert.alert(
          "Error",
          "Could not fetch user information. Please try again later."
        );
      }
    } finally {
      if (mounted) setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.id) fetchUserInfo();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Avatar cycle
  const handleChangeAvatar = async () => {
    // Xin quyền truy cập thư viện ảnh
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Thiếu quyền",
        "Bạn cần cấp quyền truy cập thư viện ảnh để chọn avatar."
      );
      return;
    }

    // Mở thư viện ảnh
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;

    // Với expo-image-picker v14 trở lên, kết quả nằm trong result.assets
    const asset = result.assets?.[0];
    if (asset?.uri) {
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        type: asset.type || "image/jpeg",
        name: asset.fileName || "avatar.jpg",
      } as any);
      formData.append("name", name);
      formData.append("phone", phone);
      try {
        const uploadRes = await Api.put(
          `/user/${user?.id}`, // Đổi thành endpoint upload của bạn
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        const url = uploadRes.data.url;
        setAvatarUrl(url);
        Alert.alert("Thành công", "Ảnh đã được upload!");
      } catch (err) {
        Alert.alert("Lỗi", "Không thể upload ảnh");
        console.log("Upload error:", (err as any)?.response?.data || err);
      }
    }
  };

  // Save
  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(
        "Info Incomplete",
        "Please fill in all fields before saving."
      );
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);

      const res = await Api.put(`/user/${user?.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedData = res.data;
      setInfo({
        ...info,
        name: updatedData.name ?? name ?? "",
        phone: updatedData.phone ?? phone ?? "",
        avatar: info?.avatar ?? "",
      });
      setEdit(false);
      Alert.alert("Success", "Update Completed!");
      if (user?.id) fetchUserInfo();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel
  const handleCancel = () => {
    setEdit(false);
    if (info) {
      setAvatarUrl(info.avatar ?? "");
      setName(info.name ?? "");
      setPhone(info.phone ?? "");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ color: "#666", marginTop: 16 }}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: "#6593ed" }]}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              onPress={edit ? handleChangeAvatar : undefined}
              activeOpacity={edit ? 0.7 : 1}
            >
              <Image
                source={{
                  uri:
                    avatar ||
                    info?.avatar ||
                    "https://res.cloudinary.com/dwuxlt4vt/image/upload/v1753775085/ev2jqk3owuxcv41o6knc.jpg",
                }}
                style={styles.avatar}
              />
              {edit && (
                <View style={styles.editBadge}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>✏️</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {edit && <Text style={styles.editText}>Edit Avatar</Text>}
        </View>
        {/* Form */}
        <View style={[styles.formSection, { backgroundColor: "#ffffff" }]}>
          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Fullname</Text>
            {edit ? (
              <TextInput
                style={styles.formInput}
                value={name}
                placeholder="Your full name"
                placeholderTextColor="#aaa"
                onChangeText={setName}
              />
            ) : (
              <Text style={styles.formValue}>{info?.name}</Text>
            )}
          </View>
          {/* Phone */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone number</Text>
            {edit ? (
              <TextInput
                style={styles.formInput}
                value={phone}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
                placeholderTextColor="#aaa"
                onChangeText={setPhone}
              />
            ) : (
              <Text style={styles.formValue}>{info?.phone}</Text>
            )}
          </View>
          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <Text style={[styles.formValue, { color: "#666" }]}>
              {user?.email}
            </Text>
          </View>
          {/* Role */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Role</Text>
            <Text style={styles.formValue}>{user?.role ?? ""}</Text>
          </View>
          {/* Divider */}
          <View style={styles.divider} />
          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {edit ? (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, { flex: 1, backgroundColor: "#3b82f6" }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving && (
                    <ActivityIndicator
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    {saving ? "Saving ..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text style={{ color: "#111", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { flex: 1, backgroundColor: "#3b82f6" }]}
                onPress={() => setEdit(true)}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Divider */}
          <View style={styles.divider} />
          {/* Logout */}
          <TouchableOpacity
            style={[styles.btn, styles.btnDanger, {flex: 1, backgroundColor: "#ef4444" }]}
            onPress={logout}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles giữ nguyên như bạn yêu cầu
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#fff", // Chủ đạo trắng
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatarSection: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: "#fff",
    borderWidth: 4,
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  editBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#111",
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  editText: {
    color: "#111",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "500",
  },
  formSection: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  formInput: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#111",
  },
  formValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    fontWeight: "600",
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    flexDirection: "row",
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: "#000",
    borderWidth: 0,
    shadowColor: "#111",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  btnSecondary: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderWidth: 2,
  },
  btnDanger: {
    backgroundColor: "transparent",
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  toast: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    zIndex: 1000,
    minWidth: 160,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  toastSuccess: {
    backgroundColor: "#111",
  },
  toastError: {
    backgroundColor: "#ef4444",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
