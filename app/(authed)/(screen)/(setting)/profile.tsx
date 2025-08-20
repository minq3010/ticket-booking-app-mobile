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
  SafeAreaView,
} from "react-native";
import { styles } from "@/styles/_global";
import { useNavigation } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

type Info = {
  avatar: string;
  name: string;
  phone: string;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [info, setInfo] = useState<Info | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatar, setAvatarUrl] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  let mounted = true;
  const fetchUserInfo = async () => {
    try {
      const res = await Api.get(`/user/${user?.id}`);
      const userData = res.data;
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

  useEffect(() => {
    // show native header with a back button
    navigation.setOptions({
      headerShown: true,
      title: "Profile",
      headerLeft: () => (
        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => navigation.goBack()}>
          <TabBarIcon name="arrow-back" size={24} />
        </TouchableOpacity>
      ),
    });
  }, []);

  const handleChangeAvatar = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Thiếu quyền",
        "Bạn cần cấp quyền truy cập thư viện ảnh để chọn avatar."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;

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
        const uploadRes = await Api.put(`/user/${user?.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const url = uploadRes.data.url;
        setAvatarUrl(url);
        Alert.alert("Thành công", "Ảnh đã được upload!");
      } catch (err) {
        Alert.alert("Lỗi", "Không thể upload ảnh");
        console.log("Upload error:", (err as any)?.response?.data || err);
      }
    }
  };

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
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
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
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      ✏️
                    </Text>
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
                <Text style={[styles.formValue, { color: "#3b82f6" }]}>
                  {info?.name}
                </Text>
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
                <Text style={[styles.formValue, { color: "#3b82f6" }]}>
                  {info?.phone}
                </Text>
              )}
            </View>
            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <Text style={[styles.formValue, { color: "#666" }]}>
                {" "}
                {user?.email}{" "}
              </Text>
            </View>
            {/* Role */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Role</Text>
              <Text style={[styles.formValue, { color: "#3b82f6" }]}>
                {user?.role ?? ""}
              </Text>
            </View>
            {/* Divider */}
            <View style={styles.divider} />
            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              {edit ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      styles.btnPrimary,
                      { flex: 1, backgroundColor: "#3b82f6" },
                    ]}
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
                    <Text style={{ color: "#111", fontWeight: "600" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.btnPrimary,
                    { flex: 1, backgroundColor: "#3b82f6" },
                  ]}
                  onPress={() => setEdit(true)}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Divider */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
