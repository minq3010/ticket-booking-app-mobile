import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Image, Alert, Linking, Platform } from "react-native";
import { VStack } from "@/components/VStack";
import { HStack } from "@/components/HStack";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { eventService } from "@/services/events";
import { Api } from "@/services/api";
import { Event } from "@/types/event";
import { ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function EventDetailWeb() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Tính số vé còn lại
  const left = Math.max(
    0,
    (event?.maxTickets || 0) - (event?.totalTicketsPurchased || 0)
  );

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const res = await eventService.getOne(Number(id));
      setEvent(res.data);
      setError("");
    } catch (err: any) {
      setError("Không tìm thấy sự kiện hoặc có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function buyTicket() {
    if (!event) {
      console.log("❌ No event data");
      return;
    }

    console.log("🎫 Starting buyTicket for event:", event.id);

    try {
      console.log("📤 Sending payment request...");
      const res = (await Api.post("/payment/momo", {
        eventId: event.id,
      })) as any;

      console.log("📥 Payment response:", res);

      if (res.status === "success" && res.url && res.orderID) {
        console.log("✅ Payment response valid, proceeding...");
        
        // For web, use window.confirm instead of Alert.alert
        if (Platform.OS === "web") {
          const shouldContinue = window.confirm(
            "🎫 Chuyển đến MoMo\n\nBạn sẽ được chuyển đến MoMo để thanh toán. Sau khi hoàn tất, vui lòng quay về app.\n\nClick OK để tiếp tục."
          );
          
          if (!shouldContinue) {
            setIsLoading(false);
            return;
          }

          // Open payment in new tab
          let paymentWindow: Window | null = null;
          try {
            const payUrl = res.url.payUrl || res.url;
            console.log("🌐 Opening payment URL:", payUrl);
            paymentWindow = window.open(payUrl, "_blank");
            
            if (!paymentWindow) {
              window.alert("❌ Lỗi: Popup bị chặn. Vui lòng cho phép popup và thử lại.");
              setIsLoading(false);
              return;
            }

            // Start polling payment status
            const orderID = res.orderID as string;
            const pollInterval = 3000;
            const timeoutMs = 5 * 60 * 1000; // 5 minutes
            const start = Date.now();

            const timer = setInterval(async () => {
              try {
                const statusRes = (await Api.get(`/payment/status/${orderID}`)) as any;
                
                if (statusRes && statusRes.status === "success") {
                  clearInterval(timer);
                  setIsLoading(false);
                  
                  // Close payment window if still open
                  try {
                    if (paymentWindow && !paymentWindow.closed) {
                      paymentWindow.close();
                    }
                  } catch (e) {
                    console.log("Could not close payment window:", e);
                  }
                  
                  window.alert("🎉 Thanh toán thành công! Vé đã được tạo thành công. Đang cập nhật thông tin sự kiện...");
                  
                  // Refresh event data to show updated ticket count
                  try {
                    const fresh = await eventService.getOne(Number(id));
                    setEvent(fresh.data);
                  } catch (refreshError) {
                    console.error("Failed to refresh event:", refreshError);
                  }
                  
                } else if (Date.now() - start > timeoutMs) {
                  clearInterval(timer);
                  setIsLoading(false);
                  const shouldRetry = window.confirm(
                    "⌛ Hết thời gian chờ\n\nKhông nhận được xác nhận thanh toán trong thời gian quy định. Vui lòng kiểm tra email hoặc liên hệ hỗ trợ nếu đã thanh toán thành công.\n\nClick OK để kiểm tra lại, Cancel để đóng."
                  );
                  if (shouldRetry) {
                    fetchEvent();
                  }
                }
              } catch (pollErr) {
                console.error("Polling error:", pollErr);
                if (Date.now() - start > timeoutMs) {
                  clearInterval(timer);
                  setIsLoading(false);
                }
              }
            }, pollInterval);

          } catch (linkError) {
            console.error("❌ Link error:", linkError);
            window.alert("❌ Lỗi: Không thể mở trang thanh toán. Vui lòng thử lại.");
            setIsLoading(false);
            return;
          }
        } else {
          // Native platform - use Alert.alert
          Alert.alert(
            "🎫 Chuyển đến MoMo",
            "Bạn sẽ được chuyển đến MoMo để thanh toán. Sau khi hoàn tất, vui lòng quay về app.",
            [
              { 
                text: "Hủy", 
                style: "cancel",
                onPress: () => setIsLoading(false)
              },
              {
                text: "Tiếp tục",
                onPress: async () => {
                  try {
                    const payUrl = res.url.payUrl || res.url;
                    const canOpen = await Linking.canOpenURL(payUrl);
                    if (canOpen) await Linking.openURL(payUrl);
                    else throw new Error("Không thể mở link thanh toán");
                  } catch (linkError) {
                    console.error("❌ Link error:", linkError);
                    Alert.alert("❌ Lỗi", "Không thể mở trang thanh toán. Vui lòng thử lại.");
                  }
                  setIsLoading(false);
                }
              },
            ]
          );
        }
      } else {
        window.alert("❌ Lỗi: Server không thể tạo đơn thanh toán");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("💥 Payment error:", error);

      let errorMessage = "Có lỗi xảy ra khi tạo đơn thanh toán";

      if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn";
      } else if (error.response?.status === 404) {
        errorMessage = "Sự kiện không tồn tại";
      } else if (error.response?.status >= 500) {
        errorMessage = "Lỗi server. Vui lòng thử lại sau";
      } else if (error.message?.includes("Network")) {
        errorMessage = "Không có kết nối mạng";
      }

      if (Platform.OS === "web") {
        window.alert("❌ Lỗi: " + errorMessage);
      } else {
        Alert.alert("❌ Lỗi", errorMessage);
      }
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <VStack alignItems="center" style={{ padding: 40 }}>
        <Text fontSize={20} color="#2563eb" bold>
          Đang tải thông tin sự kiện...
        </Text>
      </VStack>
    );
  }

  if (error || !event) {
    return (
      <VStack alignItems="center" style={{ padding: 40 }}>
        <Text fontSize={20} color="#ef4444" bold>
          {error || "Không tìm thấy sự kiện."}
        </Text>
      </VStack>
    );
  }

  // Main Layout
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      {/* Header */}
      <VStack
        style={{
          backgroundColor: "#1877f2",
          paddingVertical: 28,
          paddingHorizontal: 32,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap={16}>
            <FontAwesome name="ticket" size={28} color="#fff" />
            <VStack>
              <Text color="#fff" fontSize={20} bold>
                Ticket Booking
              </Text>
              <Text color="#c7e0fa" fontSize={12}>
                Chi tiết sự kiện
              </Text>
            </VStack>
          </HStack>
          <HStack gap={16}>
            <Button style={{ backgroundColor: "transparent", padding: 0 }}>
              <FontAwesome name="share-alt" size={20} color="#fff" />
            </Button>
            <Button
              onPress={() => setIsFavorite((f) => !f)}
              style={{ backgroundColor: "transparent", padding: 0 }}
            >
              <FontAwesome
                name={isFavorite ? "heart" : "heart-o"}
                size={20}
                color={isFavorite ? "#ef4444" : "#fff"}
              />
            </Button>
          </HStack>
        </HStack>
      </VStack>

      {/* Hero Section */}
      <VStack
        style={{
          height: 420,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#667eea",
          position: "relative",
          marginBottom: 0,
        }}
      >
        {/* Cover Image */}
        <Image
          source={{
            uri: [
              "https://thietkewebchuyen.com/wp-content/uploads/thiet-ke-banner-website-anh-bia-Facebook-am-nhac-2.jpg",
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
              "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
              "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
              "https://images.unsplash.com/photo-1465101178521-c1a4c8a0f3b7",
              "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
              "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
              "https://images.unsplash.com/photo-1465101178521-c1a4c8a0f3b7",
            ][Math.floor(Math.random() * 10)],
          }}
          style={{
            width: 1200,
            height: 400,
            borderRadius: 18,
            overflow: "hidden",
          }}
          resizeMode="cover"
        />
        {/* Decorative icons */}
        <FontAwesome
          name="music"
          size={140}
          color="#fff"
          style={{ position: "absolute", opacity: 0.18, left: "40%", top: 40 }}
        />
        <FontAwesome
          name="music"
          size={60}
          color="#fff"
          style={{ position: "absolute", opacity: 0.12, left: "25%", top: 80 }}
        />
        <FontAwesome
          name="music"
          size={100}
          color="#fff"
          style={{
        position: "absolute",
        opacity: 0.12,
        right: "18%",
        bottom: 60,
          }}
        />
        <FontAwesome
          name="microphone"
          size={36}
          color="#fff"
          style={{ position: "absolute", opacity: 0.1, right: "33%", top: 120 }}
        />
      </VStack>

      {/* Main Content */}
      <VStack
        style={{
          maxWidth: 1200,
          alignSelf: "center",
          paddingHorizontal: 48,
          paddingVertical: 40,
        }}
        gap={24}
      >
        <HStack gap={32} style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {/* Left Column */}
          <VStack style={{ flex: 2, minWidth: 320 }} gap={24}>
            {/* Quick Info Cards */}
            <HStack gap={16} style={{ flexWrap: "wrap" }}>
              <VStack
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 18,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                }}
              >
                <FontAwesome
                  name="calendar"
                  size={32}
                  color="#2563eb"
                  style={{ marginBottom: 8 }}
                />
                <Text bold fontSize={16} color="#333">
                  Ngày diễn ra
                </Text>
                <Text color="#666">
                  {event.date
                    ? new Date(event.date).toLocaleDateString("vi-VN")
                    : ""}
                </Text>
                <Text color="#888" fontSize={13}>
                  {event.date
                    ? new Date(event.date).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </VStack>
              <VStack
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 18,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                }}
              >
                <FontAwesome
                  name="map-marker"
                  size={32}
                  color="#ef4444"
                  style={{ marginBottom: 8 }}
                />
                <Text bold fontSize={16} color="#333">
                  Địa điểm
                </Text>
                <Text color="#666">{event.location || ""}</Text>
              </VStack>
            </HStack>

            {/* Event Description */}
            <VStack
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 24,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
              }}
              gap={8}
            >
              <Text
                fontSize={24}
                bold
                color="#2563eb"
                style={{ marginBottom: 8 }}
              >
                Về sự kiện
              </Text>
              <Text fontSize={16} color="#444" style={{ lineHeight: 24 }}>
                {event.description || ""}
              </Text>
            </VStack>

            {/* Gallery: chỉ hiển thị hình ảnh chính nếu có */}
            {event.imageUrl && (
              <VStack
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 24,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                }}
                gap={8}
              >
                <Text
                  fontSize={24}
                  bold
                  color="#2563eb"
                  style={{ marginBottom: 8 }}
                >
                  Hình ảnh sự kiện
                </Text>
                <Image
                  source={{ uri: event.imageUrl }}
                  style={{
                    width: 700,
                    height: 340,
                    borderRadius: 16,
                    alignSelf: "center",
                  }}
                  resizeMode="cover"
                />
              </VStack>
            )}
          </VStack>

          {/* Right Column - Booking */}
          <VStack style={{ flex: 1, minWidth: 320 }} gap={24}>
            <VStack
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 32,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
              }}
              gap={12}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#eaf2fb",
                  paddingTop: 12,
                }}
              >
                <Text fontSize={18} bold color="#2563eb">
                  Giá vé:
                </Text>
                <Text fontSize={22} bold color="#2563eb">
                  {event.price
                    ? event.price.toLocaleString("vi-VN") + "đ"
                    : "0đ"}
                </Text>
              </HStack>
              <HStack justifyContent="space-between" alignItems="center" style={{ marginTop: 8 }}>
                <Text fontSize={16} color="#2563eb" bold>
                  Số vé còn lại:
                </Text>
                <Text fontSize={18} color={left > 0 ? "#2563eb" : "#ef4444"} bold>
                  {left}
                </Text>
              </HStack>
              <Button
                onPress={buyTicket}
                disabled={isLoading || left <= 0}
                style={{
                  backgroundColor: left > 0 ? "#1877f2" : "#9ca3af",
                  borderRadius: 12,
                  paddingVertical: 18,
                  marginTop: 8,
                  opacity: isLoading || left <= 0 ? 0.7 : 1,
                }}
              >
                <HStack alignItems="center" justifyContent="center" gap={8}>
                  <FontAwesome name="ticket" size={20} color="#fff" />
                  <Text fontSize={16} bold color="#fff">
                    {left > 0 ? (isLoading ? "Đang xử lý..." : "Đặt vé ngay") : "Hết vé"}
                  </Text>
                </HStack>
              </Button>
              <Text
                color="#888"
                fontSize={13}
                style={{ textAlign: "center", marginTop: 8 }}
              >
                <FontAwesome name="shield" size={14} color="#2563eb" /> Thanh
                toán an toàn & bảo mật
              </Text>
            </VStack>

            {/* Event Info */}
            <VStack
              style={{
                backgroundColor: "#eaf2fb",
                borderRadius: 18,
                padding: 24,
              }}
              gap={8}
            >
              <Text
                fontSize={16}
                bold
                color="#2563eb"
                style={{ marginBottom: 8 }}
              >
                Thông tin quan trọng
              </Text>
              <HStack gap={8} alignItems="flex-start">
                <FontAwesome name="info-circle" size={16} color="#2563eb" />
                <Text color="#666">Vé đã mua không thể hoàn trả</Text>
              </HStack>
              <HStack gap={8} alignItems="flex-start">
                <FontAwesome name="clock-o" size={16} color="#2563eb" />
                <Text color="#666">Vui lòng có mặt trước 30 phút</Text>
              </HStack>
              <HStack gap={8} alignItems="flex-start">
                <FontAwesome name="id-card" size={16} color="#2563eb" />
                <Text color="#666">Mang theo CMND/CCCD khi tham dự</Text>
              </HStack>
              <HStack gap={8} alignItems="flex-start">
                <FontAwesome name="ban" size={16} color="#2563eb" />
                <Text color="#666">Không được mang thức ăn từ bên ngoài</Text>
              </HStack>
            </VStack>
          </VStack>
        </HStack>
      </VStack>
      {/* Footer */}
      <VStack
        style={{
          backgroundColor: "#0b1220",
          paddingVertical: 28,
          paddingHorizontal: 24,
          marginTop: 32,
        }}
      >
        <VStack
          style={{ maxWidth: 1200, alignSelf: "center", paddingHorizontal: 24 }}
        >
          <HStack
            justifyContent="space-between"
            alignItems="flex-start"
            style={{ flexWrap: "wrap" }}
            gap={24}
          >
            <VStack style={{ flex: 1, minWidth: 220 }} gap={8}>
              <Text fontSize={20} bold color="#fff">
                Ticket Booking
              </Text>
              <Text color="#9aa4b2">
                Nền tảng đặt vé sự kiện nhanh chóng và an toàn.
              </Text>
            </VStack>
            <HStack
              style={{ flex: 1, minWidth: 200, justifyContent: "space-around" }}
            >
              <VStack gap={6}>
                <Text bold color="#fff">
                  Liên kết
                </Text>
                <Text color="#9aa4b2">Trang chủ</Text>
                <Text color="#9aa4b2">Sự kiện</Text>
                <Text color="#9aa4b2">Liên hệ</Text>
              </VStack>
              <VStack gap={6}>
                <Text bold color="#fff">
                  Hỗ trợ
                </Text>
                <Text color="#9aa4b2">FAQ</Text>
                <Text color="#9aa4b2">Điều khoản</Text>
                <Text color="#9aa4b2">Chính sách bảo mật</Text>
              </VStack>
            </HStack>
            <VStack style={{ minWidth: 180 }} gap={8} alignItems="flex-end">
              <Text bold color="#fff">
                Kết nối với chúng tôi
              </Text>
              <HStack gap={12}>
                <FontAwesome name="facebook" size={20} color="#fff" />
                <FontAwesome name="instagram" size={20} color="#fff" />
                <FontAwesome name="twitter" size={20} color="#fff" />
              </HStack>
            </VStack>
          </HStack>

          <Text
            color="#6b7280"
            fontSize={13}
            style={{ marginTop: 20, textAlign: "center" }}
          >
            © {new Date().getFullYear()} Ticket Booking. All rights reserved.
          </Text>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
