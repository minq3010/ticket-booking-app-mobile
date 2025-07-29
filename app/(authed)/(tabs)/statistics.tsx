import { Divider } from "@/components/Divider";
import { VStack } from "@/components/VStack";
import { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Api } from "@/services/api"; // Nếu bạn muốn dùng Axios hoặc Api wrapper

// Loại dữ liệu
type Statistic = {
  TotalEvents: number;
  TotalRevenue: number;
  TotalTickets: number;
};

export default function StatisticsScreen() {
  const [stats, setStats] = useState<Statistic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await Api.get<Statistic>("/stats");
      console.log("Fetched stats:", res);
      setStats(res);
    } catch (err) {
      setError("Failed to load statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRetry = () => {
    setLoading;
    fetchStats();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
        <Button mt={4} onPress={handleRetry}>
          Retry
        </Button>
      </View>
    );
  }

  if (stats === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No statistics data available.</Text>
      </View>
    );
  }

  return (
      <ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    refreshControl={
      <RefreshControl refreshing={loading} onRefresh={fetchStats} />
    }
  >
      <VStack flex={1} m={20} gap={20}>
        <Text fontSize={22} bold>
          📊 Event Statistics
        </Text>
        <Divider />

        <VStack gap={10}>
          <ProfileField label="Total Events" value={stats.TotalEvents} />
          <ProfileField
            label="Total Tickets Sold"
            value={stats.TotalTickets.toString()}
          />
          <ProfileField
            label="Total Revenue"
            value={formatCurrency(stats.TotalRevenue)}
          />
        </VStack>

        <Divider />
      </VStack>
    </ScrollView>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <VStack>
      <Text fontSize={16} color="gray">
        {label}
      </Text>
      <Text fontSize={18} bold>
        {value}
      </Text>
    </VStack>
  );
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
