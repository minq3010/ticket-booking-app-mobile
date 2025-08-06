import { VStack } from "@/components/VStack";
import { HStack } from "@/components/HStack";
import { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { Text } from "@/components/Text";
import { Api } from "@/services/api";
import { BarChart } from "react-native-chart-kit";
import { styles } from "@/styles/_global";
import { Event } from "@/types/event";

const screenWidth = Dimensions.get("window").width;
// Loại dữ liệu từ backend Stats API
type Stats = {
  id: number;
  eventId: number;
  totalTicketsSold: number;
  totalTicketsEntered: number;
  totalTicketsDeleted: number;
  revenue: number;
  updatedAt: string;
};

type OverallStats = {
  totalEvents: number;
  totalTicketsSold: number;
  totalTicketsEntered: number;
  totalTicketsDeleted: number;
  totalRevenue: number;
};

export default function StatisticsScreen() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "detail">("overview");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await Api.get("/event"); // Đổi thành endpoint trả về danh sách sự kiện
      if (Array.isArray(res)) {
        setEvents(res);
      } else if (res.data && Array.isArray(res.data)) {
        setEvents(res.data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("❌ Event fetch error:", err);
      setEvents([]);
    }
  };
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching stats from API...");
      const res = await Api.get("/stat");

      let statsData: Stats[] = [];

      if (Array.isArray(res)) {
        statsData = res;
      } else if (res.data && Array.isArray(res.data)) {
        statsData = res.data;
      } else {
        console.warn("⚠️ Unexpected response structure");
        statsData = [];
      }

      console.log("📊 Final stats data:", statsData);
      console.log("📊 Number of stats records:", statsData.length);

      setStats(statsData);
      calculateOverallStats(statsData);
    } catch (err: any) {
      console.error("❌ Stats fetch error:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = (statsData: Stats[]) => {
    console.log("🔢 Calculating overall stats from data:", statsData);

    if (!statsData || statsData.length === 0) {
      console.log("⚠️  No stats data available, setting zeros");
      setOverallStats({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalTicketsEntered: 0,
        totalTicketsDeleted: 0,
        totalRevenue: 0,
      });
      return;
    }

    const eventGroups = statsData.reduce((acc, stat) => {
      if (!acc[stat.eventId]) {
        acc[stat.eventId] = [];
      }
      acc[stat.eventId].push(stat);
      return acc;
    }, {} as Record<number, Stats[]>);

    console.log("📋 Event groups:", eventGroups);

    const totalEvents = Object.keys(eventGroups).length;
    let totalTicketsSold = 0;
    let totalTicketsEntered = 0;
    let totalTicketsDeleted = 0;
    let totalRevenue = 0;

    Object.values(eventGroups).forEach((eventStats) => {
      // Chỉ lấy bản ghi duy nhất cho mỗi event
      const stat = eventStats[0];
      console.log("📊 Processing stat for event:", stat.eventId, stat);
      totalTicketsSold += stat.totalTicketsSold;
      totalTicketsEntered += stat.totalTicketsEntered;
      totalTicketsDeleted += stat.totalTicketsDeleted;
      totalRevenue += stat.revenue;
    });

    const calculatedStats = {
      totalEvents,
      totalTicketsSold,
      totalTicketsEntered,
      totalTicketsDeleted,
      totalRevenue,
    };

    console.log("✅ Calculated overall stats:", calculatedStats);
    setOverallStats(calculatedStats);
  };

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  const getCurrentEventData = () => {
    if (selectedEvent === "all") {
      let totalSold = 0,
        totalCheckin = 0,
        totalCancelled = 0,
        totalRevenue = 0;
      stats.forEach((stat) => {
        totalSold += stat.totalTicketsSold;
        totalCheckin += stat.totalTicketsEntered;
        totalCancelled += stat.totalTicketsDeleted;
        totalRevenue += stat.revenue;
      });
      return {
        sold: totalSold,
        checkin: totalCheckin,
        cancelled: totalCancelled,
        revenue: totalRevenue,
      };
    } else {
      // Sửa so sánh kiểu dữ liệu
      const stat = stats.find((s) => s.eventId.toString() === selectedEvent);
      return stat
        ? {
            sold: stat.totalTicketsSold,
            checkin: stat.totalTicketsEntered,
            cancelled: stat.totalTicketsDeleted,
            revenue: stat.revenue,
          }
        : { sold: 0, checkin: 0, cancelled: 0, revenue: 0 };
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <VStack gap={4} p={16}>
        <Text fontSize={24} bold color="white">
          📊 Thống Kê Sự Kiện
        </Text>
        <Text fontSize={14} color="#e6f2ff">
          Quản lý và theo dõi hiệu suất bán vé
        </Text>
      </VStack>
    </View>
  );

  const renderToggleButtons = () => (
    <View style={styles.toggleContainer}>
      <HStack gap={8} p={16}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "overview"
              ? styles.activeToggle
              : styles.inactiveToggle,
          ]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            fontSize={14}
            bold
            color={activeTab === "overview" ? "white" : "#6b7280"}
          >
            📈 Tổng Quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "detail"
              ? styles.activeToggle
              : styles.inactiveToggle,
          ]}
          onPress={() => setActiveTab("detail")}
        >
          <Text
            fontSize={14}
            bold
            color={activeTab === "detail" ? "white" : "#6b7280"}
          >
            🎫 Chi Tiết
          </Text>
        </TouchableOpacity>
      </HStack>
    </View>
  );

  const renderOverviewSection = () => {
    if (!overallStats) return null;

    // Chart data
    const chartData = {
      labels: stats.map((stat) => `EVT${stat.eventId}`),
      datasets: [
        {
          data: stats.map((stat) => stat.totalTicketsSold),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <VStack gap={16} p={16}>
        {/* Summary Cards Grid */}
        <HStack gap={12}>
          <StatsCard
            icon="🎪"
            title="Tổng Sự Kiện"
            value={overallStats.totalEvents.toString()}
            bgColor="#dbeafe"
            textColor="#1d4ed8"
          />
          <StatsCard
            icon="🎫"
            title="Tổng Vé Bán"
            value={overallStats.totalTicketsSold.toLocaleString()}
            bgColor="#dcfce7"
            textColor="#15803d"
          />
        </HStack>

        <HStack gap={12}>
          <StatsCard
            icon="✅"
            title="Tổng Check-in"
            value={overallStats.totalTicketsEntered.toLocaleString()}
            bgColor="#dbeafe"
            textColor="#1d4ed8"
          />
          <StatsCard
            icon="💰"
            title="Tổng Doanh Thu"
            value={formatCurrencyShort(overallStats.totalRevenue)}
            bgColor="#f3e8ff"
            textColor="#7c3aed"
          />
        </HStack>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <Text fontSize={18} bold color="#1f2937" mb={12} pl={5}>
            📊 Biểu Đồ Tổng Quan
          </Text>
          {/* Chart Toggle Buttons */}
          <VStack gap={16}>
            {/* Chart Vé đã bán */}
            <View>
              <Text
                fontSize={14}
                bold
                color="#3b82f6"
                mb={8}
                style={{ textAlign: "right" }}
              >
                📊 Vé Đã Bán
              </Text>
              <BarChart
                data={{
                  labels: stats.map((stat) => `EVT${stat.eventId}`),
                  datasets: [
                    {
                      data: stats.map((stat) => stat.totalTicketsSold),
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    },
                  ],
                }}
                width={screenWidth - 64}
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#e5e7eb",
                    strokeWidth: 1,
                  },
                }}
                style={{ marginVertical: 8, borderRadius: 16 }}
                showValuesOnTopOfBars={true}
              />
            </View>

            {/* Chart Check-in */}
            <View>
              <Text
                fontSize={14}
                bold
                color="#b91037"
                mb={8}
                style={{ textAlign: "right" }}
              >
                ✅ Đã Check-in
              </Text>
              <BarChart
                data={{
                  labels: stats.map((stat) => `EVT${stat.eventId}`),
                  datasets: [
                    {
                      data: stats.map((stat) => stat.totalTicketsEntered),
                      color: (opacity = 1) => `rgba(185, 16, 55, ${opacity})`,
                    },
                  ],
                }}
                width={screenWidth - 64}
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#e5e7eb",
                    strokeWidth: 1,
                  },
                }}
                style={{ marginVertical: 8, borderRadius: 16 }}
                showValuesOnTopOfBars={true}
              />
            </View>
          </VStack>
        </View>
      </VStack>
    );
  };

  const renderDetailSection = () => {
    const currentEventData = getCurrentEventData();

    return (
      <VStack gap={16} p={16}>
        {/* Event Selector */}
        <View style={styles.selectorContainer}>
          <Text fontSize={14} bold color="#374151" mb={8}>
            Chọn Sự Kiện
          </Text>
          <TouchableOpacity
            style={styles.customSelector}
            onPress={() => setModalVisible(true)}
          >
            <Text>
              {selectedEvent === "all"
                ? "Tất Cả Sự Kiện"
                : `${
                    events.find(
                      (event) => event.id.toString() === selectedEvent
                    )?.name
                  } (EVT${selectedEvent})`}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={[
                    { id: "all", name: "Tất Cả Sự Kiện" },
                    ...stats.map((stat) => ({
                      id: stat.eventId,
                      name: `${events.find(
                        (event) => event.id.toString() === stat.eventId.toString()
                      )?.name}`,
                    })),
                  ]}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setSelectedEvent(item.id.toString());
                        setModalVisible(false);
                      }}
                    >
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text>{item.name}</Text>
                        {item.id !== "all" && (
                          <Text color="#6b7280" fontSize={12}>
                            {`ID: EVT${item.id}`}
                          </Text>
                        )}
                      </HStack>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>

        {/* Event Stats */}
        <View style={styles.eventStatsContainer}>
          <HStack justifyContent="space-between" alignItems="center" mb={16}>
            <Text fontSize={18} bold color="#1f2937">
              📋 Chi Tiết Sự Kiện
            </Text>
            <View style={styles.statusBadge}>
              <Text fontSize={12} bold color="#059669">
                Đang Diễn Ra
              </Text>
            </View>
          </HStack>

          <HStack gap={8} mb={16}>
            <DetailStatsCard
              value={currentEventData.sold.toLocaleString()}
              label="Vé Đã Bán"
              color="#1d4ed8"
            />
            <DetailStatsCard
              value={currentEventData.checkin.toLocaleString()}
              label="Check-in"
              color="#059669"
            />
            <DetailStatsCard
              value={currentEventData.cancelled.toLocaleString()}
              label="Đã Hủy"
              color="#dc2626"
            />
          </HStack>

          <View style={styles.revenueRow}>
            <Text fontSize={14} color="#6b7280">
              Doanh Thu:
            </Text>
            <Text fontSize={18} bold color="#7c3aed">
              {formatCurrency(currentEventData.revenue)}
            </Text>
          </View>
        </View>

        {/* Event List */}
        <View style={styles.eventListContainer}>
          <Text fontSize={18} bold color="#1f2937" mb={12}>
            📝 Danh Sách Sự Kiện
          </Text>
          <VStack gap={12}>
            {stats.map((stat, index) => (
              <EventCard
                key={index}
                event={{
                  name: `${events.find(
                      (event) => event.id.toString() === stat.eventId.toString()
                    )?.name}`,
                  id: `EVT${stat.eventId}`,
                  sold: stat.totalTicketsSold,
                  checkin: stat.totalTicketsEntered,
                  cancelled: stat.totalTicketsDeleted,
                  revenue: stat.revenue,
                }}
              />
            ))}
          </VStack>
        </View>
      </VStack>
    );
  };

  if (loading && !overallStats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text mt={8} color="#6b7280">
          Loading statistics...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text fontSize={18} bold color="#dc2626" mb={8}>
          ❌ Lỗi
        </Text>
        <Text color="#6b7280" mb={16} style={{ textAlign: "center" }}>
          {error}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#3b82f6", padding: 12, borderRadius: 8 }}
          onPress={fetchStats}
        >
          <Text color="white" bold>
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Debug info
  console.log("🎯 Current state:", {
    stats: stats.length,
    overallStats,
    loading,
    error,
    activeTab,
  });

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStats} />
        }
      >
        <View style={{ marginTop: -8 }}>
          {renderToggleButtons()}

          {/* Debug section - remove this in production */}
          {/* <View
            style={{
              padding: 16,
              backgroundColor: "#f9fafb",
              margin: 16,
              borderRadius: 8,
            }}
          >
            <Text fontSize={12} bold color="#374151" mb={4}>
              🐛 Debug Info:
            </Text>
            <Text fontSize={10} color="#6b7280">
              Stats count: {stats.length}
            </Text>
            <Text fontSize={10} color="#6b7280">
              Overall stats: {overallStats ? "✅" : "❌"}
            </Text>
            <Text fontSize={10} color="#6b7280">
              Loading: {loading ? "✅" : "❌"}
            </Text>
            <Text fontSize={10} color="#6b7280">
              Error: {error || "None"}
            </Text>
          </View> */}

          {activeTab === "overview"
            ? renderOverviewSection()
            : renderDetailSection()}
        </View>
      </ScrollView>
    </View>
  );
}

// Components
function StatsCard({
  icon,
  title,
  value,
  bgColor,
  textColor,
}: {
  icon: string;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <View style={[styles.statsCard, { flex: 1 }]}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Text fontSize={18}>{icon}</Text>
      </View>
      <Text
        fontSize={12}
        color="#6b7280"
        bold
        style={{ textAlign: "center" }}
        mt={8}
      >
        {title}
      </Text>
      <Text
        fontSize={20}
        bold
        color={textColor}
        style={{ textAlign: "center" }}
      >
        {value}
      </Text>
    </View>
  );
}

function DetailStatsCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.detailStatsCard, { flex: 1 }]}>
      <Text fontSize={18} bold color={color} style={{ textAlign: "center" }}>
        {value}
      </Text>
      <Text fontSize={12} color="#6b7280" style={{ textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <View style={styles.eventCard}>
      <HStack justifyContent="space-between" alignItems="flex-start" mb={8}>
        <VStack flex={1}>
          <Text fontSize={14} bold color="#1f2937" numberOfLines={2}>
            {event.name}
          </Text>
          <Text fontSize={12} color="#6b7280" mt={4}>
            ID: {event.id}
          </Text>
        </VStack>
      </HStack>

      <HStack gap={8} mb={8}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text fontSize={16} color="#1d4ed8" bold>
            {event.sold}
          </Text>
          <Text fontSize={12} color="#6b7280">
            Vé đã bán
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text fontSize={16} color="#059669" bold>
            {event.checkin}
          </Text>
          <Text fontSize={12} color="#6b7280">
            Check-in
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text fontSize={16} color="#dc2626" bold>
            {event.cancelled}
          </Text>
          <Text fontSize={12} color="#6b7280">
            Đã hủy
          </Text>
        </View>
      </HStack>

      <View style={styles.eventCardDivider} />

      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize={14} color="#6b7280">
          Doanh thu:
        </Text>
        <Text fontSize={16} bold color="#7c3aed">
          {formatCurrency(event.revenue)}
        </Text>
      </HStack>
    </View>
  );
}

// Helper functions
function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B VNĐ`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)}M VNĐ`;
  } else {
    return amount.toLocaleString() + " VNĐ";
  }
}
