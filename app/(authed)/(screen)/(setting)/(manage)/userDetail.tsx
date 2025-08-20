import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Api } from "@/services/api";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { User } from "@/types/user";

export default function UserDetailScreen() {
  const params = useLocalSearchParams();
  const userId = params.id;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUser();

    navigation.setOptions({
      headerShown: true,
      title: "User Details",
      headerLeft: () => (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <TabBarIcon name="arrow-back" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await Api.get(`/user/${userId}`);
      let userData = response.data?.data || response.data;
      setUser(userData);
      console.log("userId param:", userId);
      const ticketRes = await Api.get(`/ticket/user/${userId}`);
      const tickets = Array.isArray(ticketRes.data) ? ticketRes.data : [];
      const ticketCount = tickets.length;

      const enteredEventIds = Array.from(
        new Set(
          tickets
            .filter((t: any) => t.entered === true)
            .map((t: any) => t.eventId)
        )
      );
      const eventCount = enteredEventIds.length;

      setTicketCount(ticketCount);
      setEventCount(eventCount);
    } catch (error) {
      console.error("Error fetching user details:", error);
      Alert.alert("Error", "Could not load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting user with ID:", userId);
              await Api.delete(`/user/${userId}`);
              Alert.alert("Success", "User has been deleted");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://res.cloudinary.com/dwuxlt4vt/image/upload/v1753775085/ev2jqk3owuxcv41o6knc.jpg",
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name || "No name"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{ticketCount}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{eventCount}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>
              {user?.phone || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteUser}
        >
          <Text style={styles.deleteButtonText}>Delete User</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  profileHeader: {
    backgroundColor: "#3b82f6",
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: -20,
    marginHorizontal: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginLeft: 16,
  },
});
