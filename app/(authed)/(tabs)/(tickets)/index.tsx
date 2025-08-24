import { HStack } from "@/components/HStack";
import { FontAwesome } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { ticketService } from "@/services/tickets";
import { Ticket } from "@/types/ticket";
import {} from "@react-navigation/native";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

export default function TicketScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showTicketBreakdown, setShowTicketBreakdown] = useState(false);
  const [showExpenseBreakdown, setShowExpenseBreakdown] = useState(false);
  const [modalType, setModalType] = useState<null | "ticket" | "expense">(null);
  const [selectedPoint, setSelectedPoint] = useState<null | {
    x: number;
    y: number;
    value: number;
    label: string;
    isUpperHalf?: boolean;
  }>(null);
  const chartScrollRef = useRef(null);
  const totalPaid = tickets.reduce(
    (sum, ticket) => sum + (ticket.event.price || 0),
    0
  );
  const enteredTickets = tickets.filter((t) => t.entered).length;
  const notEnteredTickets = tickets.filter((t) => !t.entered).length;
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const availableYears = Array.from(
    new Set([
      ...tickets.map((ticket) => new Date(ticket.event.date).getFullYear()),
      new Date().getFullYear(),
    ])
  ).sort((a, b) => b - a);

  const getMonthlyDataByYear = (year: number) => {
    const monthlyStats: { [key: string]: number } = {};
    const months = [
      "Th1",
      "Th2",
      "Th3",
      "Th4",
      "Th5",
      "Th6",
      "Th7",
      "Th8",
      "Th9",
      "Th10",
      "Th11",
      "Th12",
    ];
    months.forEach((month) => {
      monthlyStats[month] = 0;
    });
    tickets.forEach((ticket) => {
      const date = new Date(ticket.event.date);
      if (date.getFullYear() === year) {
        const month = months[date.getMonth()];
        monthlyStats[month]++;
      }
    });
    return Object.entries(monthlyStats).map(([month, count]) => ({
      month,
      count,
    }));
  };
  const monthlyData = getMonthlyDataByYear(selectedYear);

  const ticketsOfYear = tickets.filter(ticket => new Date(ticket.event.date).getFullYear() === selectedYear);
  const totalPaidOfYear = ticketsOfYear.reduce(
    (sum, ticket) => sum + (ticket.event.price || 0),
    0
  );

  function onGoToTicketPage(id: number) {
    router.push({
      pathname: "/(authed)/(tabs)/(tickets)/ticket/[id]",
      params: { id: id.toString() },
    });
  }

  async function fetchTickets() {
    try {
      setIsLoading(true);
      const response = await ticketService.getAll();
      setTickets(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch tickets");
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitleStyle: { color: "#3b82f6" },
      headerTitle: "Danh sách vé",
      headerLeft: showStats
        ? () => (
            <TouchableOpacity
              onPress={() => {
                setShowStats(false);
              }}
              style={{ marginLeft: 12 }}
            >
              <TabBarIcon name="arrow-back" size={24} color="#2563eb" />
            </TouchableOpacity>
          )
        : undefined,
      headerRight: !showStats
        ? () => (
            <TouchableOpacity
              onPress={() => {
                setShowStats((s) => !s);
                setShowChart(false);
              }}
              style={{ marginRight: 12 }}
            >
              <FontAwesome
                name="bar-chart"
                size={24}
                color={showStats ? "#059669" : "#2563eb"}
              />
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [navigation, showStats]);

  return (
    <VStack
      flex={1}
      p={20}
      pb={0}
      gap={20}
      style={{ backgroundColor: "#f0f6ff" }}
    >
      {!showStats && (
        <HStack alignItems="center" justifyContent="space-between">
          <Text fontSize={18} bold color="#2563eb">
            {tickets.length} Vé
          </Text>
        </HStack>
      )}
      {showStats ? (
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack gap={24}>
              <VStack gap={20} style={{ marginTop: 0 }}>
                {/* Chọn năm xem biểu đồ */}
                <View style={{ marginBottom: 12, position: "relative" }}>
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      zIndex: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#2563eb",
                        borderRadius: 16,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        minHeight: 32,
                        minWidth: 60,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: "#2563eb",
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 2,
                      }}
                      onPress={() => setShowChart((s) => !s)}
                    >
                      <Text fontSize={13} bold color="white">
                        Năm: {selectedYear}
                      </Text>
                    </TouchableOpacity>
                    {showChart && (
                      <View
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: 12,
                          padding: 8,
                          marginTop: 8,
                          shadowColor: "#000",
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        {availableYears.map((year) => (
                          <TouchableOpacity
                            key={year}
                            onPress={() => {
                              setSelectedYear(year);
                              setShowChart(false);
                            }}
                            style={{ padding: 8, alignItems: "center" }}
                          >
                            <Text fontSize={13} color="#2563eb">
                              Năm {year}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
                <HStack justifyContent="center" alignItems="center" gap={8}>
                  <Text
                    fontSize={22}
                    bold
                    style={{
                      textAlign: "center",
                      letterSpacing: 1,
                      color: "#2563eb",
                      textShadowColor: "#60a5fa",
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 4,
                      backgroundColor: "#e0e7ff",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}
                  >
                    Số vé theo tháng
                  </Text>
                </HStack>
                <View
                  style={{ marginTop: 22, zIndex: 1, position: "relative" }}
                >
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ref={chartScrollRef}
                  >
                    <LineChart
                      data={{
                        labels: monthlyData.map((d) => d.month),
                        datasets: [{ data: monthlyData.map((d) => d.count) }],
                      }}
                      width={Math.max(
                        Dimensions.get("window").width,
                        monthlyData.length * 60
                      )}
                      height={320}
                      yAxisLabel={""}
                      yAxisSuffix={""}
                      chartConfig={{
                        backgroundColor: "#f8fafc",
                        backgroundGradientFrom: "#f0f6ff",
                        backgroundGradientTo: "#f0f6ff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                        labelColor: (opacity = 1) =>
                          `rgba(100, 116, 139, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForBackgroundLines: { stroke: "#e5e7eb" },
                        propsForDots: {
                          r: "5",
                          strokeWidth: "2",
                          stroke: "#2563eb",
                        },
                      }}
                      bezier
                      style={{ borderRadius: 16, marginLeft: 8 }}
                      fromZero
                      onDataPointClick={({ value, getColor, x, y, index }) => {
                        const chartHeight = 320;
                        const isUpperHalf = y < chartHeight / 2;
                        setSelectedPoint({
                          x: x + 8,
                          y: isUpperHalf ? y + 40 : y - 80,
                          value,
                          label: monthlyData[index].month,
                          isUpperHalf,
                        });
                      }}
                    />
                    {selectedPoint && (
                      <View
                        style={{
                          position: "absolute",
                          left: Math.max(
                            10,
                            Math.min(
                              selectedPoint.x - 60,
                              Math.max(
                                Dimensions.get("window").width,
                                monthlyData.length * 60
                              ) - 130
                            )
                          ),
                          top: selectedPoint.y,
                          zIndex: 1000,
                          elevation: 10,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            padding: 12,
                            shadowColor: "#000",
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 8,
                            minWidth: 120,
                            alignItems: "center",
                            borderWidth: 2,
                            borderColor: "#2563eb",
                          }}
                        >
                          <Pressable
                            onPress={() => setSelectedPoint(null)}
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              backgroundColor: "#ef4444",
                              borderRadius: 10,
                              width: 20,
                              height: 20,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <FontAwesome name="close" size={10} color="#fff" />
                          </Pressable>
                          <Text fontSize={13} bold color="#2563eb">
                            {selectedPoint.label} {selectedYear}
                          </Text>
                          <Text fontSize={16} bold color="#059669">
                            {selectedPoint.value} vé
                          </Text>
                          {selectedPoint.isUpperHalf && (
                            <View
                              style={{
                                position: "absolute",
                                top: -10,
                                left: "50%",
                                marginLeft: -5,
                                width: 0,
                                height: 0,
                                borderLeftWidth: 5,
                                borderRightWidth: 5,
                                borderBottomWidth: 10,
                                borderLeftColor: "transparent",
                                borderRightColor: "transparent",
                                borderBottomColor: "#2563eb",
                              }}
                            />
                          )}
                          {!selectedPoint.isUpperHalf && (
                            <View
                              style={{
                                position: "absolute",
                                bottom: -10,
                                left: "50%",
                                marginLeft: -5,
                                width: 0,
                                height: 0,
                                borderLeftWidth: 5,
                                borderRightWidth: 5,
                                borderTopWidth: 10,
                                borderLeftColor: "transparent",
                                borderRightColor: "transparent",
                                borderTopColor: "#2563eb",
                              }}
                            />
                          )}
                        </View>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </VStack>
              <HStack
                gap={16}
                style={{ justifyContent: "space-between", flexWrap: "wrap" }}
              >
                <TouchableOpacity
                  style={{ flex: 1, minWidth: 160, maxWidth: "48%" }}
                  onPress={() => setModalType("ticket")}
                >
                  <VStack
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: 18,
                      padding: 18,
                      shadowColor: "#2563eb",
                      shadowOpacity: 0.12,
                      shadowRadius: 8,
                      elevation: 3,
                      alignItems: "center",
                    }}
                    gap={10}
                  >
                    <HStack alignItems="center" gap={8}>
                      <FontAwesome name="ticket" size={18} color="#2563eb" />
                        <Text
                        fontSize={15}
                        bold
                        color="#2563eb"
                        style={{
                          backgroundColor: '#e0e7ff',
                          borderRadius: 8,
                          paddingHorizontal: 14,
                          paddingVertical: 4,
                        }}
                        >
                        Tổng số vé
                        </Text>
                    </HStack>
                    <Text
                      fontSize={28}
                      bold
                      color="#2563eb"
                      style={{ letterSpacing: 1, textShadowColor: '#60a5fa', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 }}
                    >
                      {ticketsOfYear.length}
                    </Text>
                    <Text
                      fontSize={12}
                      color="#2563eb"
                      style={{
                        marginTop: 2,
                        textDecorationLine: "underline",
                      }}
                    >
                      Xem chi tiết
                    </Text>
                  </VStack>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, minWidth: 160, maxWidth: "48%" }}
                  onPress={() => setModalType("expense")}
                >
                  <VStack
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: 18,
                      padding: 18,
                      shadowColor: "#059669",
                      shadowOpacity: 0.12,
                      shadowRadius: 8,
                      elevation: 3,
                      alignItems: "center",
                    }}
                    gap={10}
                  >
                    <HStack alignItems="center" gap={8}>
                      <FontAwesome name="money" size={18} color="#059669" />
                        <Text
                        fontSize={15}
                        bold
                        color="#059669"
                        style={{
                          backgroundColor: '#bbf7d0', // màu xanh lá nhạt hơn, diện tích lớn hơn
                          borderRadius: 8,
                          paddingHorizontal: 14,
                          paddingVertical: 4,
                        }}
                        >
                        Tổng tiền
                        </Text>
                    </HStack>
                    <Text
                      fontSize={24}
                      bold
                      color="#059669"
                      style={{ letterSpacing: 1, textShadowColor: '#bbf7d0', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 }}
                    >
                      {totalPaidOfYear.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Text>
                    <Text
                      fontSize={12}
                      color="#2563eb"
                      style={{
                        marginTop: 2,
                        textDecorationLine: "underline",
                      }}
                    >
                      Xem chi tiết
                    </Text>
                  </VStack>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </ScrollView>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            keyExtractor={({ id }) => id.toString()}
            data={tickets}
            onRefresh={fetchTickets}
            refreshing={isLoading}
            renderItem={({ item: ticket }) => (
              <TouchableOpacity
                disabled={ticket.entered}
                onPress={() => onGoToTicketPage(ticket.id)}
              >
                <VStack
                  gap={20}
                  h={140}
                  key={ticket.id}
                  style={{ opacity: ticket.entered ? 0.5 : 1 }}
                >
                  <HStack>
                    <VStack
                      h={130}
                      w={"69%"}
                      p={15}
                      justifyContent="space-between"
                      style={{
                        backgroundColor: "#ffffff",
                        borderTopLeftRadius: 20,
                        borderBottomLeftRadius: 20,
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                      }}
                    >
                      <HStack alignItems="center">
                        <Text
                          numberOfLines={2}
                          adjustsFontSizeToFit
                          fontSize={15}
                          bold
                          color="#2563eb"
                        >
                          {ticket.event.name}
                        </Text>
                      </HStack>
                      <Text fontSize={12} color="#64748b">
                        {new Date(ticket.event.date).toLocaleString("vi-VN")}
                      </Text>
                      <Text
                        fontSize={15}
                        style={{ flexWrap: "wrap" }}
                        color="#2563eb"
                      >
                        {ticket.event.location}
                      </Text>
                      <Text fontSize={15} bold color="#059669">
                        Giá vé:{" "}
                        {ticket.event.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </Text>
                    </VStack>
                    <VStack
                      h={120}
                      w={"1%"}
                      style={{
                        alignSelf: "center",
                        borderColor: "#dbeafe",
                        borderWidth: 2,
                        borderStyle: "dashed",
                      }}
                    />
                    <VStack
                      h={130}
                      w={"29%"}
                      justifyContent="center"
                      alignItems="center"
                      style={{
                        backgroundColor: ticket.entered ? "#ffffff" : "#b6d1f9",
                        borderTopRightRadius: 20,
                        borderBottomRightRadius: 20,
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                      }}
                    >
                      <Text
                        fontSize={20}
                        bold
                        color={ticket.entered ? "#dc2626" : "#2563eb"}
                      >
                        {ticket.entered ? "Used" : "Available"}
                      </Text>
                      {ticket.entered && (
                        <Text
                          style={{
                            fontSize: 10,
                            paddingLeft: 18,
                            paddingTop: 5,
                          }}
                          mt={12}
                          color="#64748b"
                        >
                          {new Date(ticket.updatedAt).toLocaleString("vi-VN")}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </VStack>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <VStack h={20} />}
          />
        </View>
      )}
      <Modal
        visible={modalType !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModalType(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.25)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "90%",
              maxHeight: "80%",
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Pressable
              onPress={() => setModalType(null)}
              style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}
            >
              <FontAwesome name="close" size={24} color="#64748b" />
            </Pressable>
            <ScrollView
              style={{ marginTop: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {modalType === "ticket" && (
                <VStack gap={16}>
                  <Text
                    fontSize={18}
                    bold
                    color="#2563eb"
                    style={{ textAlign: "center" }}
                  >
                    Chi tiết
                  </Text>
                  <HStack gap={16} style={{ justifyContent: "center" }}>
                    <VStack
                      alignItems="center"
                      style={{
                        flex: 1,
                        backgroundColor: "#f8fafc",
                        padding: 12,
                        borderRadius: 10,
                      }}
                    >
                      <Text fontSize={14} color="#059669">
                        Đã sử dụng
                      </Text>
                      <Text fontSize={22} bold color="#059669">
                        {enteredTickets}
                      </Text>
                    </VStack>
                    <VStack
                      alignItems="center"
                      style={{
                        flex: 1,
                        backgroundColor: "#fff7ed",
                        padding: 12,
                        borderRadius: 10,
                      }}
                    >
                      <Text fontSize={14} color="#ea580c">
                        Chưa sử dụng
                      </Text>
                      <Text fontSize={22} bold color="#ea580c">
                        {notEnteredTickets}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text
                    fontSize={15}
                    color="#64748b"
                    style={{ textAlign: "center", marginTop: 8 }}
                  >
                    Tổng số vé:{" "}
                    <Text bold color="#2563eb">
                      {ticketsOfYear.length}
                    </Text>
                  </Text>
                </VStack>
              )}
              {modalType === "expense" && (
                <VStack gap={16}>
                  <Text
                    fontSize={18}
                    bold
                    color="#059669"
                    style={{ textAlign: "center" }}
                  >
                    Chi tiết thanh toán
                  </Text>
                  <VStack gap={8}>
                    {tickets.map((ticket) => (
                      <HStack
                        key={ticket.id}
                        justifyContent="space-between"
                        alignItems="center"
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: 8,
                          padding: 10,
                        }}
                      >
                        <Text fontSize={14} color="#2563eb">
                          {ticket.event.name}
                        </Text>
                        <Text fontSize={14} color="#059669">
                          {ticket.event.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <Text
                    fontSize={15}
                    color="#64748b"
                    style={{ textAlign: "center", marginTop: 8 }}
                  >
                    Tổng tiền đã thanh toán:{" "}
                    <Text bold color="#059669">
                      {totalPaid.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </Text>
                  </Text>
                </VStack>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </VStack>
  );
}
