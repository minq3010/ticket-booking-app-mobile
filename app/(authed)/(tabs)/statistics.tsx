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
  Pressable,
  Vibration,
} from "react-native";
import { Text } from "@/components/Text";
import { Api } from "@/services/api";
import { BarChart, LineChart } from "react-native-chart-kit";
import { styles } from "@/styles/_global";
import { Event } from "@/types/event";
import { useNavigation } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
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

type MonthlyStats = {
  month: string;
  year: number;
  ticketsSold: number;
  revenue: number;
  events: number;
};

export default function StatisticsScreen() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "detail" | "monthly">("overview");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [chartTooltip, setChartTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: {
      month: string;
      value: number;
      type: 'tickets' | 'revenue';
    };
    isUpperHalf?: boolean;
  } | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitleStyle: { color: "#3b82f6" },
    });
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await Api.get("/event");
      if (Array.isArray(res)) {
        setEvents(res);
      } else if (res.data && Array.isArray(res.data)) {
        setEvents(res.data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Event fetch error:", err);
      setEvents([]);
    }
  };

  const generateMonthlyStats = (statsData: Stats[], eventsData: Event[]) => {
    const monthlyData: { [key: string]: MonthlyStats } = {};
    
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${selectedYear}-${i.toString().padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: i.toString().padStart(2, '0'),
        year: selectedYear,
        ticketsSold: 0,
        revenue: 0,
        events: 0
      };
    }
    
    eventsData.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate.getFullYear() === selectedYear) {
        const monthKey = `${selectedYear}-${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].events += 1;
          
          // Tìm stats tương ứng với event này
          const eventStats = statsData.find(stat => stat.eventId === event.id);
          if (eventStats) {
            monthlyData[monthKey].ticketsSold += eventStats.totalTicketsSold;
            monthlyData[monthKey].revenue += eventStats.revenue;
          }
        }
      }
    });
    
    // Chuyển object thành array và sắp xếp theo tháng
    const monthlyArray = Object.values(monthlyData).sort((a, b) => 
      parseInt(a.month) - parseInt(b.month)
    );
    
    setMonthlyStats(monthlyArray);
  };
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await Api.get("/manager/stat");

      let statsData: Stats[] = [];

      if (Array.isArray(res)) {
        statsData = res;
      } else if (res.data && Array.isArray(res.data)) {
        statsData = res.data;
      } else {
        console.warn("⚠️ Unexpected response structure");
        statsData = [];
      }

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
    if (!statsData || statsData.length === 0) {
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


    const totalEvents = Object.keys(eventGroups).length;
    let totalTicketsSold = 0;
    let totalTicketsEntered = 0;
    let totalTicketsDeleted = 0;
    let totalRevenue = 0;

    Object.values(eventGroups).forEach((eventStats) => {
      const stat = eventStats[0];
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

    setOverallStats(calculatedStats);
  };

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (stats.length > 0 && events.length > 0) {
      generateMonthlyStats(stats, events);
    }
  }, [stats, events, selectedYear]);

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
          Thống Kê Sự Kiện
        </Text>
        <Text fontSize={14} color="#e6f2ff">
          Quản lý và theo dõi hiệu suất bán vé
        </Text>
      </VStack>
    </View>
  );

  const renderToggleButtons = () => (
    <View style={styles.toggleContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              Tổng Quan
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
              Chi Tiết
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === "monthly"
                ? styles.activeToggle
                : styles.inactiveToggle,
            ]}
            onPress={() => setActiveTab("monthly")}
          >
            <Text
              fontSize={14}
              bold
              color={activeTab === "monthly" ? "white" : "#6b7280"}
            >
              Theo Tháng
            </Text>
          </TouchableOpacity>
        </HStack>
      </ScrollView>
    </View>
  );

  const renderOverviewSection = () => {
    if (!overallStats) return null;

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
            title="Tổng Vé Đã Bán"
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
            Biểu Đồ Tổng Quan
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
                Vé Đã Bán
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: stats.map((stat) => `EVT${stat.eventId}`),
                    datasets: [
                      {
                        data: stats.map((stat) => stat.totalTicketsSold),
                        color: (opacity = 1) =>
                          `rgba(59, 130, 246, ${opacity})`,
                      },
                    ],
                  }}
                  width={Math.max(stats.length * 60, screenWidth - 80)}
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
              </ScrollView>
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
                Đã Check-in
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                  width={Math.max(stats.length * 60, screenWidth - 80)}
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
              </ScrollView>
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
                      name: `${
                        events.find(
                          (event) =>
                            event.id.toString() === stat.eventId.toString()
                        )?.name
                      }`,
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
              label="Đã Bán"
              color="#1d4ed8"
            />
            <DetailStatsCard
              value={currentEventData.checkin.toLocaleString()}
              label="Đã Check-in"
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
              Doanh thu:
            </Text>
            <Text fontSize={18} bold color="#7c3aed">
              {formatCurrency(currentEventData.revenue)}
            </Text>
          </View>
        </View>

        {/* Event List */}
        <View style={styles.eventListContainer}>
          <Text fontSize={18} bold color="#1f2937" mb={12}>
            Danh Sách Sự Kiện
          </Text>
          <VStack gap={12}>
            {stats.map((stat, index) => (
              <EventCard
                key={index}
                event={{
                  name: `${
                    events.find(
                      (event) => event.id.toString() === stat.eventId.toString()
                    )?.name
                  }`,
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

  const renderMonthlySection = () => {
    const availableYears = Array.from(
      new Set([
        ...events.map(event => new Date(event.date).getFullYear()),
        new Date().getFullYear()
      ])
    ).sort((a, b) => b - a);

    // Kiểm tra dữ liệu trước khi render chart
    if (!monthlyStats || monthlyStats.length === 0 || monthlyStats.some(stat => isNaN(stat.ticketsSold) || isNaN(stat.revenue))) {
      return <Text color="red" style={{ textAlign: 'center', margin: 24 }}>Không có dữ liệu thống kê tháng</Text>;
    }

    const chartData = {
      labels: monthlyStats.map(stat => `T${stat.month}`),
      datasets: [
        {
          data: monthlyStats.map(stat => Number(stat.ticketsSold) || 0),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    const revenueChartData = {
      labels: monthlyStats.map(stat => `T${stat.month}`),
      datasets: [
        {
          data: monthlyStats.map(stat => Number(stat.revenue) / 1000000 || 0), // Chuyển sang triệu VNĐ
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    return (
      <VStack gap={16} p={16}>
        {/* Year Selector */}
        <View style={styles.selectorContainer}>
          <Text fontSize={14} bold color="#374151" mb={8}>
            Chọn năm
          </Text>
          <TouchableOpacity
            style={styles.customSelector}
            onPress={() => setYearModalVisible(true)}
          >
            <Text>Năm {selectedYear}</Text>
          </TouchableOpacity>
          <Modal
            visible={yearModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setYearModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={availableYears}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setSelectedYear(item);
                        setYearModalVisible(false);
                      }}
                    >
                      <Text>Năm {item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>

        {/* Summary Cards */}
        <HStack gap={12}>
          <StatsCard
            icon="🎫"
            title="Tổng vé bán"
            value={monthlyStats.reduce((sum, stat) => sum + stat.ticketsSold, 0).toLocaleString()}
            bgColor="#dcfce7"
            textColor="#15803d"
          />
          <StatsCard
            icon="💰"
            title="Tổng doanh thu"
            value={formatCurrencyShort(monthlyStats.reduce((sum, stat) => sum + stat.revenue, 0))}
            bgColor="#f3e8ff"
            textColor="#7c3aed"
          />
        </HStack>

        <HStack gap={12}>
          <StatsCard
            icon="🎪"
            title="Tổng sự kiện"
            value={monthlyStats.reduce((sum, stat) => sum + stat.events, 0).toString()}
            bgColor="#dbeafe"
            textColor="#1d4ed8"
          />
          <StatsCard
            icon="📊"
            title="TB vé/tháng"
            value={Math.round(monthlyStats.reduce((sum, stat) => sum + stat.ticketsSold, 0) / 12).toLocaleString()}
            bgColor="#fef3c7"
            textColor="#d97706"
          />
        </HStack>

        {/* Tickets Chart */}
        <View style={styles.chartContainer}>
          <Text fontSize={18} bold color="#1f2937" mb={12}>
            Vé bán theo tháng - {selectedYear}
          </Text>
          <View style={{ position: 'relative', zIndex: 1 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={Math.max(monthlyStats.length * 80, screenWidth - 32)}
                height={220}
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
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#3b82f6"
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                onDataPointClick={(data) => {
                  const monthIndex = data.index;
                  const monthStat = monthlyStats[monthIndex];
                  
                  Vibration.vibrate(50);
                  
                  const chartHeight = 220;
                  const isUpperHalf = data.y < chartHeight / 2;
                  
                  setChartTooltip({
                    visible: true,
                    x: data.x + 8, // offset như trong file index
                    y: isUpperHalf ? data.y + 40 : data.y - 80,
                    data: {
                      month: `Tháng ${monthStat.month}`,
                      value: monthStat.ticketsSold,
                      type: 'tickets'
                    },
                    isUpperHalf
                  });
                  
                  // Tự động ẩn tooltip sau 4 giây
                  setTimeout(() => {
                    setChartTooltip(null);
                  }, 4000);
                }}
              />
              
              {/* Tooltip for Tickets Chart */}
              {chartTooltip && chartTooltip.data.type === 'tickets' && (
                <View style={{ 
                  position: 'absolute', 
                  left: Math.max(10, Math.min(chartTooltip.x - 60, Math.max(screenWidth, monthlyStats.length * 80) - 130)), 
                  top: chartTooltip.y,
                  zIndex: 1000,
                  elevation: 10
                }}>
                  <View style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: 12, 
                    padding: 12, 
                    shadowColor: '#000', 
                    shadowOpacity: 0.25, 
                    shadowRadius: 8, 
                    elevation: 8, 
                    minWidth: 120, 
                    alignItems: 'center', 
                    borderWidth: 2, 
                    borderColor: '#2563eb' 
                  }}>
                    <Pressable 
                      onPress={() => setChartTooltip(null)} 
                      style={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        backgroundColor: '#ef4444', 
                        borderRadius: 10, 
                        width: 20, 
                        height: 20, 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}
                    >
                      <FontAwesome name="close" size={10} color="#fff" />
                    </Pressable>
                    
                    <Text fontSize={13} bold color="#2563eb">
                      {chartTooltip.data.month} {selectedYear}
                    </Text>
                    
                    <Text fontSize={16} bold color="#059669">
                      {chartTooltip.data.value.toLocaleString()} vé
                    </Text>
                    
                    {/* Arrow indicator */}
                    {chartTooltip.isUpperHalf && (
                      <View style={{ 
                        position: 'absolute', 
                        top: -10, 
                        left: '50%', 
                        marginLeft: -5, 
                        width: 0, 
                        height: 0, 
                        borderLeftWidth: 5, 
                        borderRightWidth: 5, 
                        borderBottomWidth: 10, 
                        borderLeftColor: 'transparent', 
                        borderRightColor: 'transparent', 
                        borderBottomColor: '#2563eb' 
                      }} />
                    )}
                    
                    {!chartTooltip.isUpperHalf && (
                      <View style={{ 
                        position: 'absolute', 
                        bottom: -10, 
                        left: '50%', 
                        marginLeft: -5, 
                        width: 0, 
                        height: 0, 
                        borderLeftWidth: 5, 
                        borderRightWidth: 5, 
                        borderTopWidth: 10, 
                        borderLeftColor: 'transparent', 
                        borderRightColor: 'transparent', 
                        borderTopColor: '#2563eb' 
                      }} />
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartContainer}>
          <Text fontSize={18} bold color="#1f2937" mb={12}>
            Doanh thu theo tháng - {selectedYear} (triệu VNĐ)
          </Text>
          <View style={{ position: 'relative', zIndex: 1 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={revenueChartData}
                width={Math.max(monthlyStats.length * 80, screenWidth - 32)}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#e5e7eb",
                    strokeWidth: 1,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#22c55e"
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                onDataPointClick={(data) => {
                  const monthIndex = data.index;
                  const monthStat = monthlyStats[monthIndex];
                  
                  Vibration.vibrate(50);
                  
                  const chartHeight = 220;
                  const isUpperHalf = data.y < chartHeight / 2;
                  
                  setChartTooltip({
                    visible: true,
                    x: data.x + 8, // offset như trong file index
                    y: isUpperHalf ? data.y + 40 : data.y - 80,
                    data: {
                      month: `Tháng ${monthStat.month}`,
                      value: monthStat.revenue,
                      type: 'revenue'
                    },
                    isUpperHalf
                  });
                  
                  setTimeout(() => {
                    setChartTooltip(null);
                  }, 4000);
                }}
              />
              
              {/* Tooltip for Revenue Chart */}
              {chartTooltip && chartTooltip.data.type === 'revenue' && (
                <View style={{ 
                  position: 'absolute', 
                  left: Math.max(10, Math.min(chartTooltip.x - 60, Math.max(screenWidth, monthlyStats.length * 80) - 130)), 
                  top: chartTooltip.y,
                  zIndex: 1000,
                  elevation: 10
                }}>
                  <View style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: 12, 
                    padding: 12, 
                    shadowColor: '#000', 
                    shadowOpacity: 0.25, 
                    shadowRadius: 8, 
                    elevation: 8, 
                    minWidth: 120, 
                    alignItems: 'center', 
                    borderWidth: 2, 
                    borderColor: '#059669' 
                  }}>
                    <Pressable 
                      onPress={() => setChartTooltip(null)} 
                      style={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        backgroundColor: '#ef4444', 
                        borderRadius: 10, 
                        width: 20, 
                        height: 20, 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}
                    >
                      <FontAwesome name="close" size={10} color="#fff" />
                    </Pressable>
                    
                    <Text fontSize={13} bold color="#059669">
                      {chartTooltip.data.month} {selectedYear}
                    </Text>
                    
                    <Text fontSize={16} bold color="#2563eb">
                      {formatCurrency(chartTooltip.data.value)}
                    </Text>
                    
                    {/* Arrow indicator */}
                    {chartTooltip.isUpperHalf && (
                      <View style={{ 
                        position: 'absolute', 
                        top: -10, 
                        left: '50%', 
                        marginLeft: -5, 
                        width: 0, 
                        height: 0, 
                        borderLeftWidth: 5, 
                        borderRightWidth: 5, 
                        borderBottomWidth: 10, 
                        borderLeftColor: 'transparent', 
                        borderRightColor: 'transparent', 
                        borderBottomColor: '#059669' 
                      }} />
                    )}
                    
                    {!chartTooltip.isUpperHalf && (
                      <View style={{ 
                        position: 'absolute', 
                        bottom: -10, 
                        left: '50%', 
                        marginLeft: -5, 
                        width: 0, 
                        height: 0, 
                        borderLeftWidth: 5, 
                        borderRightWidth: 5, 
                        borderTopWidth: 10, 
                        borderLeftColor: 'transparent', 
                        borderRightColor: 'transparent', 
                        borderTopColor: '#059669' 
                      }} />
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Monthly Details Table */}
        <View style={styles.chartContainer}>
          <Text fontSize={18} bold color="#1f2937" mb={12}>
            Chi tiết theo tháng
          </Text>
          <VStack gap={8}>
            {monthlyStats.map((stat, index) => (
              <MonthlyStatsCard key={index} monthStat={stat} />
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
          Đang tải thống kê...
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

          {activeTab === "overview"
            ? renderOverviewSection()
            : activeTab === "detail"
            ? renderDetailSection()
            : renderMonthlySection()}
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
            Đã Bán
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text fontSize={16} color="#059669" bold>
            {event.checkin}
          </Text>
          <Text fontSize={12} color="#6b7280">
            Đã Check-in
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text fontSize={16} color="#dc2626" bold>
            {event.cancelled}
          </Text>
          <Text fontSize={12} color="#6b7280">
            Đã Hủy
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

function MonthlyStatsCard({ monthStat }: { monthStat: MonthlyStats }) {
  const monthNames = [
    "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <View style={styles.eventCard}>
      <HStack justifyContent="space-between" alignItems="center" mb={12}>
        <Text fontSize={16} bold color="#1f2937">
          {monthNames[parseInt(monthStat.month)]} {monthStat.year}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: monthStat.events > 0 ? "#dcfce7" : "#f3f4f6" }]}>
          <Text fontSize={12} bold color={monthStat.events > 0 ? "#059669" : "#6b7280"}>
            {monthStat.events} sự kiện
          </Text>
        </View>
      </HStack>

      <HStack gap={8} mb={8}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text fontSize={18} color="#1d4ed8" bold>
            {monthStat.ticketsSold.toLocaleString()}
          </Text>
          <Text fontSize={12} color="#6b7280">
            Vé bán
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text fontSize={18} color="#059669" bold>
            {formatCurrencyShort(monthStat.revenue)}
          </Text>
          <Text fontSize={12} color="#6b7280">
            Doanh thu
          </Text>
        </View>
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
