import { Divider } from "@/components/Divider";
import { HStack } from "@/components/HStack";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { Input } from "@/components/Input";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/events";
import { Event } from "@/types/event";
import { UserRole } from "@/types/user";
import { format } from "date-fns/format";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Modal,
  View,
  ScrollView,
} from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { Button } from "@/components/Button";
export default function EventsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [filterVisible, setFilterVisible] = useState(false);
  function onGoToEventPage(id: number) {
    router.push({
      pathname: "/(authed)/(tabs)/(events)/event/[id]",
      params: { id: id.toString() },
    });
  }

  const quickFilters = [
    { label: "Miễn phí", value: 0 },
    { label: "Dưới 100k", value: 100000 },
    { label: "Dưới 500k", value: 500000 },
    { label: "Dưới 1 triệu", value: 1000000 },
    { label: "Dưới 2 triệu", value: 2000000 },
    { label: "Dưới 5 triệu", value: 5000000 },
    { label: "Dưới 10 triệu", value: 10000000 },
  ];

  const filteredEvents = events.filter(
    (event) =>
      event.price <= maxPrice &&
      (user?.role === UserRole.Manager || new Date(event.date) >= new Date())
  );

  const fetchEvents = async (query?: string) => {
    try {
      setIsLoading(true);
      let response;
      if (query && query.trim()) {
        response = await eventService.searchByName(query.trim());
      } else {
        response = await eventService.getAll();
      }
      const eventList = Array.isArray(response.data) ? response.data : [];
      setEvents(eventList);
    } catch (error) {
      setEvents([]);
  Alert.alert("Lỗi", "Không thể lấy danh sách sự kiện");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    fetchEvents(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchEvents();
    Keyboard.dismiss();
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Sự kiện",
      headerTitleStyle: { color: "#3b82f6" },
      headerRight: user?.role === UserRole.Manager ? headerRight : null,
    });
  }, [navigation, user]);

  return (
    <VStack
      flex={1}
      p={20}
      pb={0}
      gap={10}
      style={{ backgroundColor: "#eaf2fb" }}
    >
  {/* Thanh tìm kiếm */}
      <HStack gap={5} alignItems="center">
        <VStack flex={1}>
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            h={40}
            pl={14}
            p={9}
          />
        </VStack>
        <TouchableOpacity
          onPress={handleSearch}
          style={{
            backgroundColor: "#3b82f6",
            borderRadius: 15,
            padding: 10,
            minWidth: 40,
            minHeight: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text color="white">
            <TabBarIcon size={20} name="search" />
          </Text>
        </TouchableOpacity>

        {searchQuery.length === 0 && (
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 15,
              padding: 10,
              minWidth: 40,
              minHeight: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text color="white">
              <TabBarIcon size={20} name="filter" />
            </Text>
          </TouchableOpacity>
        )}

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 15,
              padding: 10,
              minWidth: 40,
              minHeight: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text fontSize={14} color="white">
              <TabBarIcon size={20} name="close" />
            </Text>
          </TouchableOpacity>
        )}
      </HStack>

  {/* Bộ lọc */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(222, 214, 214, 0.884)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <VStack
            p={20}
            style={{ backgroundColor: "#fff", width: "90%", borderRadius: 16 }}
          >
            <Text fontSize={18} bold mb={12} color="#2563eb">
              Lọc theo giá
            </Text>
            <Text fontSize={16} bold color="#2563eb" mb={4}>
              Giá tối đa: {maxPrice.toLocaleString("vi-VN")} VND
            </Text>
            <View style={{ width: "100%", height: 40 }}>
              <Slider
                minimumValue={0}
                maximumValue={10000000}
                step={100000}
                value={maxPrice}
                onValueChange={(value) =>
                  setMaxPrice(Array.isArray(value) ? value[0] : value)
                }
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#d1e0f4"
              />
            </View>
            <HStack gap={8} mt={12}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickFilters.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    onPress={() => setMaxPrice(f.value)}
                    style={{
                      backgroundColor:
                        maxPrice === f.value ? "#2563eb" : "#e5e7eb",
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text color={maxPrice === f.value ? "white" : "#2563eb"}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </HStack>
            <TouchableOpacity
              onPress={() => setFilterVisible(false)}
              style={{ marginTop: 20 }}
            >
              <Button
                onPress={() => setFilterVisible(false)}
                style={{
                  backgroundColor: "#2563eb",
                  borderRadius: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#2563eb",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  color="white"
                  bold
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    letterSpacing: 1,
                  }}
                >
                  Áp dụng
                </Text>
              </Button>
              <Button
                onPress={() => setFilterVisible(false)}
                style={{
                  backgroundColor: "#de1414",
                  borderRadius: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  color="white"
                  bold
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    letterSpacing: 1,
                  }}
                >
                  Hủy
                </Text>
              </Button>
            </TouchableOpacity>
          </VStack>
        </View>
      </Modal>

      <HStack alignItems="center" justifyContent="space-between">
        <Text fontSize={18} bold color="#2563eb">
          {user?.role === UserRole.Manager
            ? `Danh sách sự kiện (${filteredEvents.length})`
            : `Sự kiện sắp diễn ra (${filteredEvents.filter(e => new Date(e.date) >= new Date()).length})`}
        </Text>
      </HStack>

      <FlatList
        keyExtractor={(item) => item.id.toString()}
        data={filteredEvents}
        onRefresh={fetchEvents}
        refreshing={isLoading}
        ItemSeparatorComponent={() => <VStack h={20} />}
        renderItem={({ item: event }) => {
          const isPastEvent = new Date(event.date) < new Date();
          return (
            <VStack
              gap={20}
              p={20}
              style={{
                backgroundColor: isPastEvent ? "#d1e0f4" : "#ffffff",
                borderRadius: 20,
                shadowColor: "#2563eb",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
              }}
              key={event.id}
            >
              <TouchableOpacity
                onPress={() => onGoToEventPage(event.id)}
                disabled={isPastEvent && user?.role === UserRole.Attendee}
              >
                <VStack gap={12}>
                  {/* Tên sự kiện */}
                    <HStack alignItems="center" justifyContent="space-between">
                    <HStack alignItems="center" gap={12} style={{ flex: 1 }}>
                      <TabBarIcon size={24} name="calendar" color="#3b82f6" />
                      <Text
                      numberOfLines={2}
                      style={{
                        flex: 1,
                        fontSize: 22,
                        fontWeight: "bold",
                        color: "#2563eb",
                      }}
                      >
                      {event.name}
                      </Text>
                    </HStack>
                    <TabBarIcon size={20} name="chevron-forward" color="#3b82f6" />
                    </HStack>

                    {/* Địa điểm */}
                    <HStack alignItems="center" gap={12}>
                    <TabBarIcon size={20} name="location" color="#64748b" />
                    <Text
                      numberOfLines={1}
                      style={{
                      flex: 1,
                      fontSize: 18,
                      color: "#64748b",
                      }}
                    >
                      {event.location}
                    </Text>
                    </HStack>

                  {/* Giá vé */}
                  <HStack alignItems="center" gap={12}>
                    <TabBarIcon size={20} name="pricetag" color="#ef4444" />
                    <Text fontSize={18} bold color="#ef4444">
                      {event.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </Text>
                  </HStack>
                </VStack>
              </TouchableOpacity>
              <Divider />
              <HStack justifyContent="space-between">
                <Text bold fontSize={16} color="#64748b">
                  Đã bán: {event.totalTicketsPurchased}
                </Text>
                <Text bold fontSize={16} color="#22c55e">
                  Đã vào: {event.totalTicketsEntered}
                </Text>
              </HStack>
              <Text fontSize={13} color="#64748b">
                {format(new Date(event.date), "dd/MM/yyyy HH:mm")}
              </Text>
            </VStack>
          );
        }}
      />
    </VStack>
  );
}

const headerRight = () => {
  return (
    <TabBarIcon
      size={32}
      color={"#3b82f6"}
      name="add-circle-outline"
      onPress={() => router.push("/(authed)/(tabs)/(events)/new")}
    />
  );
};

// // Lắng nghe deep link callback từ MoMo để chuyển về trang tickets
// useEffect(() => {
//   const handleDeepLink = (event: { url: string }) => {
//     console.log("📱 Deep link received:", event.url);

//     //  Handle cả custom link và query params
//     if (
//       event.url.includes("payment-success") ||
//       event.url.includes("resultCode=0")
//     ) {
//       Alert.alert("Thành công", "Thanh toán thành công! Vé đã được tạo.", [
//         {
//           text: "Xem vé",
//           onPress: () => {
//             fetchEvents();
//             router.push("/(authed)/(tabs)/(tickets)");
//           },
//         },
//       ]);
//     } else if (
//       event.url.includes("payment-failed") ||
//       event.url.includes("resultCode=1")
//     ) {
//       Alert.alert("Thất bại", "Thanh toán không thành công.");
//     }
//   };

//   const subscription = Linking.addEventListener("url", handleDeepLink);
//   return () => subscription.remove();
// }, []);

// async function buyTicket(id: number) {
//   try {
//     setIsLoading(true);

//     //  Gọi API tạo payment
//     const res = await Api.post("/payment/momo", { eventId: id });

//     //  Check response structure hợp lý hơn
//     if (res.status === 200 && res.data) {
//       //  Check errorCode từ MoMo response
//       if (res.data.errorCode === 0 && res.data.payUrl) {
//         //  Hiển thị thông báo trước khi chuyển
//         Alert.alert(
//           "🎫 Chuyển đến MoMo",
//           "Bạn sẽ được chuyển đến MoMo để thanh toán. Sau khi hoàn tất, vui lòng quay về app.",
//           [
//             {
//               text: "Hủy",
//               style: "cancel"
//             },
//             {
//               text: "Tiếp tục",
//               onPress: async () => {
//                 try {
//                   //  Mở MoMo app/web
//                   const canOpen = await Linking.canOpenURL(res.data.payUrl);
//                   if (canOpen) {
//                     await Linking.openURL(res.data.payUrl);
//                   } else {
//                     throw new Error("Không thể mở link thanh toán");
//                   }
//                 } catch (linkError) {
//                   console.error(" Link error:", linkError);
//                   Alert.alert(" Lỗi", "Không thể mở ứng dụng MoMo. Vui lòng thử lại.");
//                 }
//               }
//             }
//           ]
//         );
//       } else {
//         //  MoMo trả về lỗi
//         const errorMsg = res.data.message || `Lỗi MoMo: ${res.data.errorCode}`;
//         Alert.alert(" Lỗi thanh toán", errorMsg);
//       }
//     } else {
//       //  Server response không hợp lệ
//       Alert.alert(" Lỗi", "Server không thể tạo đơn thanh toán");
//     }

//   } catch (error: any) {
//     console.error("💥 Payment error:", error);

//     //  Xử lý các loại lỗi cụ thể
//     let errorMessage = "Có lỗi xảy ra khi tạo đơn thanh toán";

//     if (error.response?.status === 401) {
//       errorMessage = "Phiên đăng nhập đã hết hạn";
//     } else if (error.response?.status === 404) {
//       errorMessage = "Sự kiện không tồn tại";
//     } else if (error.response?.status >= 500) {
//       errorMessage = "Lỗi server. Vui lòng thử lại sau";
//     } else if (error.message?.includes("Network")) {
//       errorMessage = "Không có kết nối mạng";
//     }

//     Alert.alert(" Lỗi", errorMessage);

//   } finally {
//     setIsLoading(false);
//   }
// }
