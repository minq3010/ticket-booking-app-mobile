import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { Api } from "@/services/api";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { User } from "@/types/user";
import { HStack } from "@/components/HStack";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    navigation.setOptions({
      headerTitleStyle: { color: "#3b82f6" },
      headerLeft: () => (
        <TabBarIcon color={"#3b82f6"} name="arrow-back" size={24} onPress={() => router.back()} />
      ),
    });
  }, [users.length]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await Api.get("/user");

      if (response.data && response.data.status === "success") {
        let userData = response.data.data || [];

        const attendees = userData.filter(
          (user: User) => user.role === "attendee"
        );
        setUsers(attendees);
      } else if (response.data) {
        let userData = [];
        if (Array.isArray(response.data)) {
          userData = response.data;
        } else if (response.data && Array.isArray(response.data)) {
          userData = response.data;
        }

        const attendees = userData.filter(
          (user: User) => user.role === "attendee"
        );
        setUsers(attendees);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = (userId: number) => {
    router.push(`./userDetail?id=${userId}`);
  };

  const filteredUsers = users.filter(
    (user: User) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc email"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View>
        <VStack p={15} >
          <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize={18} bold color="#2563eb">
              Tổng số người dùng: {users.length}
            </Text>
          </HStack>
        </VStack>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => viewUserDetails(item.id)}
            >
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: "#3b82f6" }]}> 
                  {item.name || "Không có tên"}
                </Text>
                <Text style={[styles.userEmail, { color: "#666" }]}> 
                  {item.email}
                </Text>
                <Text style={[styles.userPhone, { color: "#888" }]}> 
                  {item.phone || "Không có số điện thoại"}
                </Text>
              </View>
              <TabBarIcon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  userCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#888",
  },
  emptyList: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    marginLeft: 16,
  },
});
