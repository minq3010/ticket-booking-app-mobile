import React, { useEffect, useState } from "react";
import { Platform, View, TouchableOpacity } from "react-native";
import WebLayout from "../../layouts/WebLayout";
import { VStack } from "@/components/VStack";
import { HStack } from "@/components/HStack";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Input } from "@/components/Input";
import { eventService } from "@/services/events";
import { Event } from "@/types/event";
import { UserRole } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns/format";
import { router } from "expo-router";

export default function WebEventsPage() {
  if (Platform.OS !== "web") return null;

  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = async (query?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching events with query:", query);
      console.log("User:", user);

      // Check if user is authenticated
      if (!user) {
        throw new Error("User not authenticated");
      }

      let response;
      if (query && query.trim()) {
        response = await eventService.searchByName(query.trim());
      } else {
        response = await eventService.getAll();
      }

      console.log("Event response:", response);

      if (response && response.data) {
        const eventList = Array.isArray(response.data) ? response.data : [];
        console.log("Event list:", eventList);
        setEvents(eventList);
      } else {
        console.error("Invalid response structure:", response);
        throw new Error(response?.message || "Invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách sự kiện"
      );
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEvents(searchQuery);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      user?.role === UserRole.Manager || new Date(event.date) >= new Date()
  );

  function onGoToEventPage(id: number) {
    router.push({
      pathname: "/(authed)/(tabs)/(events)/event/[id]",
      params: { id: id.toString() },
    });
  }

  return (
    <WebLayout title="Sự kiện">
      <View
        style={{
          flex: 1,
          overflow: "auto" as any,
          maxHeight: "calc(100vh - 160px)" as any,
          paddingRight: 8,
        }}
      >
        <VStack gap={24} style={{ paddingBottom: 20 }}>
          {/* Header */}
          <VStack gap={20}>
            <VStack gap={8}>
              <Text fontSize={28} bold color="#1c1e21">
                Danh sách sự kiện
              </Text>
              <Text fontSize={14} color="#606770">
                Khám phá các sự kiện thú vị đang diễn ra
              </Text>
            </VStack>

            <HStack
              justifyContent="flex-end"
              alignItems="center"
              style={{ gap: 12 }}
            >
              {/* Search Section */}
              <HStack gap={12} alignItems="center" style={{ minWidth: 400 }}>
                <Input
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    maxWidth: 300,
                    height: 42,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#000000",
                    backgroundColor: "#ffffff",
                  }}
                />
                <Button
                  onPress={handleSearch}
                  style={{
                    backgroundColor: "#1877f2",
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 8,
                    minWidth: 80,
                  }}
                >
                  <HStack gap={6} alignItems="center">
                    <TabBarIcon name="search" size={16} color="white" />
                    <Text color="white" fontSize={14} bold>
                      Tìm
                    </Text>
                  </HStack>
                </Button>
                {searchQuery && (
                  <Button
                    onPress={() => {
                      setSearchQuery("");
                      fetchEvents();
                    }}
                    style={{
                      backgroundColor: "#6c757d",
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                    }}
                  >
                    <HStack gap={6} alignItems="center">
                      <TabBarIcon name="close" size={16} color="white" />
                      <Text color="white" fontSize={14}>
                        Xóa
                      </Text>
                    </HStack>
                  </Button>
                )}
              </HStack>
            </HStack>
          </VStack>

          {/* Events Grid */}
          <VStack gap={16}>
            {isLoading ? (
              <VStack gap={12} alignItems="center" style={{ padding: 40 }}>
                <Text fontSize={16} color="#606770">
                  Đang tải danh sách sự kiện...
                </Text>
              </VStack>
            ) : error ? (
              <VStack gap={12} alignItems="center" style={{ padding: 40 }}>
                <Text fontSize={16} color="#ef4444">
                  {error}
                </Text>
                <Button onPress={() => fetchEvents()}>
                  <Text color="white">Thử lại</Text>
                </Button>
              </VStack>
            ) : filteredEvents.length === 0 ? (
              <VStack gap={12} alignItems="center" style={{ padding: 40 }}>
                <Text fontSize={16} color="#606770">
                  Không tìm thấy sự kiện nào.
                </Text>
                {searchQuery && (
                  <Button
                    onPress={() => {
                      setSearchQuery("");
                      fetchEvents();
                    }}
                  >
                    <Text color="white">Xóa bộ lọc</Text>
                  </Button>
                )}
              </VStack>
            ) : (
              filteredEvents.map((event) => {
                const isPastEvent = new Date(event.date) < new Date();
                return (
                  <HStack
                    key={event.id}
                    gap={16}
                    style={{
                      padding: 20,
                      backgroundColor: isPastEvent ? "#f0f2f5" : "white",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#e4e6ea",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)" as any,
                    }}
                  >
                    <VStack gap={8} style={{ flex: 1 }}>
                      <Text fontSize={20} bold color="#1c1e21">
                        {event.name}
                      </Text>
                      <HStack gap={16}>
                        <HStack gap={6} alignItems="center">
                          <TabBarIcon
                            name="calendar"
                            size={14}
                            color="#606770"
                          />
                          <Text fontSize={12} color="#606770">
                            {format(new Date(event.date), "dd/MM/yyyy")}
                          </Text>
                        </HStack>
                        <HStack gap={6} alignItems="center">
                          <TabBarIcon name="time" size={14} color="#606770" />
                          <Text fontSize={12} color="#606770">
                            {format(new Date(event.date), "HH:mm")}
                          </Text>
                        </HStack>
                        <HStack gap={6} alignItems="center">
                          <TabBarIcon
                            name="location"
                            size={14}
                            color="#606770"
                          />
                          <Text fontSize={12} color="#606770">
                            {event.location}
                          </Text>
                        </HStack>
                      </HStack>
                      <Text fontSize={14} color="#424242" numberOfLines={2}>
                        {event.description || "No description available"}
                      </Text>
                      <HStack
                        gap={12}
                        alignItems="center"
                        style={{ marginTop: 8 }}
                      >
                        <Text fontSize={16} bold color="#1877f2">
                          {event.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </Text>
                        <Text
                          fontSize={12}
                          color="#42b72a"
                          style={{
                            backgroundColor: "#e8f8f5",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          {isPastEvent ? "Đã kết thúc" : "Còn vé"}
                        </Text>
                      </HStack>
                      <HStack gap={12} alignItems="center">
                        <Text fontSize={12} color="#64748b">
                          Đã bán: {event.totalTicketsPurchased || 0}
                        </Text>
                        <Text fontSize={12} color="#22c55e">
                          Đã vào: {event.totalTicketsEntered || 0}
                        </Text>
                      </HStack>
                    </VStack>

                    <VStack gap={8} alignItems="flex-end">
                      <Button onPress={() => onGoToEventPage(event.id)}>
                        <Text color="white" fontSize={17}>
                          Xem chi tiết
                        </Text>
                      </Button>
                    </VStack>
                  </HStack>
                );
              })
            )}
          </VStack>
        </VStack>
      </View>
    </WebLayout>
  );
}
