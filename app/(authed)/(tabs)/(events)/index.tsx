import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { HStack } from "@/components/HStack";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { Input } from "@/components/Input";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useAuth } from "@/context/AuthContext";
import { Api } from "@/services/api";
import { eventService } from "@/services/events";
import { Event } from "@/types/event";
import { UserRole } from "@/types/user";
import { format } from "date-fns/format";
import { vi } from "date-fns/locale";
import * as Linking from "expo-linking";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, TouchableOpacity, Keyboard } from "react-native";
export default function EventsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  function onGoToEventPage(id: number) {
    //  Cả Manager và Attendee đều có thể xem event detail
    router.push({
      pathname: "/(authed)/(tabs)/(events)/event/[id]",
      params: { id: id.toString() },
    });
  }
  
  
  const fetchEvents = async (query?: string) => {
    try {
      setIsLoading(true);
      let response;
      if (query && query.trim()) {
        // Tìm kiếm với query
        response = await eventService.searchByName(query.trim());
      } else {
        // Load tất cả events
        response = await eventService.getAll();
      }
      const eventList = Array.isArray(response.data) ? response.data : [];
      setEvents(eventList);
    } catch (error) {
      setEvents([]);
      Alert.alert("Error", "Failed to fetch events");
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
      headerTitle: "Events",
      headerRight: user?.role === UserRole.Manager ? headerRight : null,
    });
  }, [navigation, user]);

  return (
    <VStack flex={1} p={20} pb={0} gap={10}>
      {/* Search Bar */}
      <HStack gap={5} alignItems="center">
        <VStack flex={1} >
          <Input
            placeholder="Search events..."
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

      <HStack alignItems="center" justifyContent="space-between">
        <Text fontSize={18} bold>
          {events.length} Events
        </Text>
      </HStack>

      <FlatList
        keyExtractor={(item) => item.id.toString()}
        data={events}
        onRefresh={fetchEvents}
        refreshing={isLoading}
        ItemSeparatorComponent={() => <VStack h={20} />}
        renderItem={({ item: event }) => (
          <VStack
          gap={20}
          p={20}
          style={{
            backgroundColor: "white",
            borderRadius: 20,
          }}
          key={event.id}
          >
            <TouchableOpacity onPress={() => onGoToEventPage(event.id)}>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" style={{ flexWrap: "wrap" }}>
                  <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    fontSize={20}
                    bold
                    >
                    {event.name}
                  </Text>
                  <Text fontSize={26} bold>
                    {" "}
                    <TabBarIcon size={20} name="location" />{" "}
                  </Text>
                  <Text fontSize={20} bold>
                    {event.location}
                  </Text>
                </HStack>
                {/*  Hiển thị chevron cho tất cả user */}
                <TabBarIcon
                  size={24}
                  name="chevron-forward"
                  style={{
                    alignSelf: "center",
                    position: "absolute",
                    right: 1,
                    color: "#3b82f6",
                  }}
                  />
              </HStack>
              <Text fontSize={20} bold color="gray" mt={10}>
                Price:{" "}
                {event.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Text>
            </TouchableOpacity>
            <Divider />
            <HStack justifyContent="space-between">
              <Text bold fontSize={16} color="gray">
                Sold: {event.totalTicketsPurchased}
              </Text>
              <Text bold fontSize={16} color="green">
                Entered: {event.totalTicketsEntered}
              </Text>
            </HStack>

            {/* {user?.role === UserRole.Attendee && (
              <VStack>
              <Button
              variant="outlined"
              disabled={isLoading}
              onPress={() => buyTicket(event.id)}
              >
              Buy Ticket
              </Button>
              </VStack>
              )} */}

            <Text fontSize={13} color="gray">
              {format(new Date(event.date), "dd/MM/yyyy HH:mm", { locale: vi })}
            </Text>
          </VStack>
        )}
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