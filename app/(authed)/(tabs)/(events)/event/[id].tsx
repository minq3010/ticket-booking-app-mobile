import { Button } from "@/components/Button";
import DateTimePicker from "@/components/DateTimePicker";
import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { HStack } from "@/components/HStack";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/events";
import { Api } from "@/services/api";
import { Event } from "@/types/event";
import { UserRole } from "@/types/user";
import {} from "@react-navigation/native";
import {
  useLocalSearchParams,
  useNavigation,
  router,
  useFocusEffect,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import * as Linking from "expo-linking";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns/format";
import { vi } from "date-fns/locale";

export default function EventDetailsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isManager = user?.role === UserRole.Manager;
  const isAttendee = user?.role === UserRole.Attendee;

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your photo library!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  async function buyTicket() {
    if (!eventData) return;

    try {
      setIsLoading(true);

      const res = (await Api.post("/payment/momo", {
        eventId: eventData.id,
      })) as any;

      if (res.status === "success" && res.url) {
        if (res.url.errorCode === 0 && res.url.payUrl) {
          Alert.alert(
            "🎫 Chuyển đến MoMo",
            "Bạn sẽ được chuyển đến MoMo để thanh toán. Sau khi hoàn tất, vui lòng quay về app.",
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Tiếp tục",
                onPress: async () => {
                  try {
                    const canOpen = await Linking.canOpenURL(res.url.payUrl);
                    if (canOpen) {
                      await Linking.openURL(res.url.payUrl);
                    } else {
                      throw new Error("Không thể mở link thanh toán");
                    }
                  } catch (linkError) {
                    console.error("❌ Link error:", linkError);
                    Alert.alert(
                      "❌ Lỗi",
                      "Không thể mở ứng dụng MoMo. Vui lòng thử lại."
                    );
                  }
                },
              },
            ]
          );
        } else {
          const errorMsg = res.url.message || `Lỗi MoMo: ${res.url.errorCode}`;
          Alert.alert("❌ Lỗi thanh toán", errorMsg);
        }
      } else {
        Alert.alert("❌ Lỗi", "Server không thể tạo đơn thanh toán");
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

      Alert.alert("❌ Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  const ticketsLeft =
    eventData && typeof eventData.maxTickets === "number"
      ? Math.max(0, eventData.maxTickets - eventData.totalTicketsPurchased)
      : 0;

  function updateField(field: keyof Event, value: string | Date) {
    setEventData((prev) => {
      if (!prev) return prev;

      if (field === "price" || field === "maxTickets") {
        const numericValue = parseInt(value as string) || 0;
        return { ...prev, [field]: numericValue };
      }

      return { ...prev, [field]: value };
    });
  }

  const onDelete = useCallback(() => {
    if (!eventData) return;

    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await eventService.deleteOne(Number(id));
            router.back();
          } catch (error: any) {
            const errorMessage =
              error?.response?.data?.message || "Failed to delete event";
            Alert.alert("Error", errorMessage);
          }
        },
        style: "destructive",
      },
    ]);
  }, [eventData, id]);

  async function onSubmitChanges() {
    if (!eventData) return;

    if (!eventData.name?.trim()) {
      Alert.alert("Error", "Event name is required");
      return;
    }

    if (!eventData.location?.trim()) {
      Alert.alert("Error", "Event location is required");
      return;
    }

    if (eventData.price < 0) {
      Alert.alert("Error", "Price must be greater than or equal to 0");
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("Updating event with data:", {
        name: eventData.name,
        location: eventData.location,
        price: eventData.price,
        date: eventData.date,
        hasNewImage: !!selectedImage,
      });

      if (selectedImage) {
        const formData = new FormData();

        formData.append("name", eventData.name);
        formData.append("location", eventData.location);
        formData.append("description", eventData.description || "");
        formData.append("price", eventData.price.toString());
        formData.append("date", new Date(eventData.date).toISOString());

        const imageUri = selectedImage;
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any);

        console.log("Sending FormData with image...");

        await eventService.updateOneWithImage(Number(id), formData);

        Alert.alert("Success", "Events have been updated with new image");
      } else {
        console.log("📤 Sending JSON data without image...");

        await eventService.updateOne(
          Number(id),
          eventData.name,
          eventData.location,
          eventData.price,
          eventData.maxTickets || 0,
          new Date(eventData.date).toISOString(),
          eventData.description
        );

        console.log("Successfully updated event without image");
        Alert.alert("Success", "Event information has been updated!");
      }

      await fetchEvent();

      setSelectedImage(null);

      router.back();
    } catch (error) {
      console.error("Update error:", error);

      let errorMessage = "Failed to update event";

      if (error && typeof error === "object") {
        if ("response" in error && error.response) {
          const response = error.response as any;
          errorMessage =
            response.data?.message || `Server error: ${response.status}`;
          console.error("Server response:", response.data);
        } else if ("message" in error) {
          errorMessage = (error as any).message;
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const fetchEvent = async () => {
    try {
      const response = await eventService.getOne(Number(id));
      setEventData(response.data);
    } catch (error) {
      router.back();
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchEvent();
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Event Details",
      headerTitleStyle: { color: "#3b82f6" },
      headerLeft: () => (
      <TabBarIcon
        size={24}
        color={"#3b82f6"}
        name="arrow-back"
        onPress={() => router.back()}
      />
      ),
      headerRight: isManager ? () => headerRight(onDelete) : undefined,
    });
  }, [navigation, onDelete, isAttendee, isManager, eventData?.name]);

  return (
    <>
      {/* ✅ View cho Attendee */}
      {isAttendee && eventData && (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#000"]}
              tintColor="#000"
            />
          }
        >
          {/* Event Image */}
          {eventData.imageUrl ? (
            <Image
              source={{ uri: eventData.imageUrl }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <VStack
              style={styles.imagePlaceholder}
              alignItems="center"
              justifyContent="center"
            >
              <TabBarIcon size={60} name="image" color="#888" />
              <Text color="#888" fontSize={14} mt={10}>
                Không có hình ảnh
              </Text>
            </VStack>
          )}

          {/* Event Info Card */}
          <VStack style={styles.eventInfoCard}>
            <VStack gap={16} mt={5}>
              <HStack alignItems="center" gap={12} style={styles.infoRow}>
                <VStack style={styles.iconContainer}>
                  <TabBarIcon size={20} name="location" color="#3b82f6" />
                </VStack>
                <VStack flex={1}>
                  <Text fontSize={12} color="#666" style={styles.infoLabel}>
                    Location
                  </Text>
                  <Text fontSize={16} color="#000" style={styles.infoValue}>
                    {eventData.location}
                  </Text>
                </VStack>
              </HStack>

              <HStack alignItems="center" gap={12} style={styles.infoRow}>
                <VStack style={styles.iconContainer}>
                  <TabBarIcon size={20} name="calendar" color="#3b82f6" />
                </VStack>
                <VStack flex={1}>
                  <Text fontSize={12} color="#666" style={styles.infoLabel}>
                    Time
                  </Text>
                  <Text fontSize={16} color="#000" style={styles.infoValue}>
                    {format(
                      new Date(eventData.date),
                      "dd/MM/yyyy 'at' HH:mm",
                      { locale: vi }
                    )}
                  </Text>
                </VStack>
              </HStack>

              <HStack alignItems="center" gap={12} style={styles.infoRow}>
                <VStack style={styles.iconContainer}>
                  <TabBarIcon size={20} name="pricetag" color="#3b82f6" />
                </VStack>
                <VStack flex={1}>
                  <Text fontSize={12} color="#666" style={styles.infoLabel}>
                    Price
                  </Text>
                  <Text
                    fontSize={18}
                    bold
                    color="#000"
                    style={styles.priceText}
                  >
                    {eventData.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Description */}
            {eventData.description && (
              <VStack mt={24} style={styles.descriptionSection}>
                <Text fontSize={16} bold color="#000" mb={12}>
                  Description
                </Text>
                <Text fontSize={14} color="#333" style={styles.descriptionText}>
                  {eventData.description}
                </Text>
              </VStack>
            )}

            {/* Stats */}
            <HStack style={styles.statsContainer} mt={24}>
              <VStack alignItems="center" flex={1} style={styles.statItem}>
                <Text fontSize={24} bold color="#000">
                  {eventData.totalTicketsPurchased}
                </Text>
                <Text fontSize={12} color="#666" mt={4}>
                  Tickets sold
                </Text>
                <Text fontSize={14} color="#2E7D32" mt={2}>
                  {eventData.maxTickets - eventData.totalTicketsPurchased} tickets
                  remaining
                </Text>
              </VStack>
              <VStack style={styles.statDivider} />
              <VStack alignItems="center" flex={1} style={styles.statItem}>
                <Text fontSize={24} bold color="#2E7D32">
                  {eventData.totalTicketsEntered}
                </Text>
                <Text fontSize={12} color="#666" mt={4}>
                  Tickets checked-in
                </Text>
              </VStack>
            </HStack>

            {/* Buy Ticket Button */}
            <Button
              isLoading={isLoading}
              disabled={isLoading || ticketsLeft === 0}
              onPress={buyTicket}
              style={{
                ...styles.buyButton,
                ...(ticketsLeft === 0 && { backgroundColor: "#ccc" }),
              }}
            >
              <Text fontSize={16} bold color="#fff">
                {ticketsLeft === 0
                  ? "Sold out"
                  : isLoading
                  ? "Processing..."
                  : "🎫 Buy Ticket Now"}
              </Text>
            </Button>
          </VStack>
        </ScrollView>
      )}

      {/* ✅ Edit Form cho Manager */}
      {isManager && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <VStack m={20} flex={1} gap={30}>
            {/* ✅ Image Upload Section */}
            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">
                Event Image
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.imageUploadContainer}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.selectedImage}
                  />
                ) : eventData?.imageUrl ? (
                  <Image
                    source={{ uri: eventData.imageUrl }}
                    style={styles.selectedImage}
                  />
                ) : (
                  <VStack alignItems="center" gap={10}>
                    <TabBarIcon size={40} name="camera" color="gray" />
                    <Text color="gray">Tap to select image</Text>
                  </VStack>
                )}
              </TouchableOpacity>
              {(selectedImage || eventData?.imageUrl) && (
                <TouchableOpacity onPress={() => setSelectedImage(null)}>
                  <Text
                    color="red"
                    style={{ textAlign: "center", marginTop: 10 }}
                  >
                    {selectedImage ? "Remove New Image" : "Change Image"}
                  </Text>
                </TouchableOpacity>
              )}
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">
                Name
              </Text>
              <Input
                value={eventData?.name}
                onChangeText={(value) => updateField("name", value)}
                placeholder="Name"
                placeholderTextColor="darkgray"
                h={48}
                p={14}
              />
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">
                Location
              </Text>
              <Input
                value={eventData?.location}
                onChangeText={(value) => updateField("location", value)}
                placeholder="Location"
                placeholderTextColor="darkgray"
                h={48}
                p={14}
              />
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">
                Description
              </Text>
              <Input
                value={eventData?.description}
                onChangeText={(value) => updateField("description", value)}
                placeholder="Description"
                placeholderTextColor="darkgray"
                multiline
                numberOfLines={4}
                h={100}
                p={14}
              />
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">
                Price
              </Text>
              <Input
                value={eventData?.price?.toString()}
                onChangeText={(value) => updateField("price", value)}
                placeholder="Price"
                placeholderTextColor="darkgray"
                keyboardType="numeric"
                h={48}
                p={14}
              />
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">
                Quantity
              </Text>
              <Input
                value={eventData?.maxTickets?.toString()}
                onChangeText={(value) => updateField("maxTickets", value)}
                placeholder="Max Tickets"
                placeholderTextColor="darkgray"
                keyboardType="numeric"
                h={48}
                p={14}
              />
            </VStack>

            <VStack gap={5}>
              <Text ml={10} fontSize={14} color="gray">
                Date
              </Text>
              <DateTimePicker
                onChange={(date) => updateField("date", date || new Date())}
                currentDate={new Date(eventData?.date || new Date())}
              />
            </VStack>

            <Button
              mt={"auto"}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onPress={onSubmitChanges}
            >
              Save Changes
            </Button>
          </VStack>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf2fb", // soft blue background
  },
  eventImage: {
    width: "100%",
    height: 280,
  },
  imagePlaceholder: {
    width: "100%",
    height: 280,
    backgroundColor: "#eaf2fb",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  eventInfoCard: {
    backgroundColor: "#fff",
    padding: 24,
    marginTop: -30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  eventTitle: {
    textAlign: "center",
    lineHeight: 32,
  },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eaf2fb",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontWeight: "600",
    marginTop: 2,
  },
  priceText: {
    fontWeight: "700",
    marginTop: 2,
  },
  descriptionSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  descriptionText: {
    lineHeight: 22,
    textAlign: "justify",
  },
  statsContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  statItem: {
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#dbeafe",
    marginHorizontal: 20,
  },
  buyButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 30,
    marginBottom: 40,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  imageUploadContainer: {
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#dbeafe",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaf2fb",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
});

const headerRight = (onPress: VoidFunction) => {
  return <TabBarIcon color={"#3b82f6"} size={30} name="trash" onPress={onPress} />;
};
