import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { ticketService } from "@/services/tickets";
import { Ticket } from "@/types/ticket";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";

export default function TicketDetailScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [qrcode, setQrcode] = useState<string | null>(null);

  async function fetchTicket() {
    try {
      const { data } = await ticketService.getOne(Number(id));
      setTicket(data.ticket);
      setQrcode(data.qrcode);
    } catch (error) {
      router.back();
    }
  }

  const onDeleteTicket = useCallback(() => {
    if (!ticket) return;
    Alert.alert(
      "Xác nhận xóa vé",
      "Liên hệ số điện thoại này để được hoàn tiền: 0866007219",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              await ticketService.deleteOne(ticket.id);
              router.back();
            } catch (error) {
              Alert.alert("Lỗi", "Xóa vé không thành công");
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [ticket, router]);

  useFocusEffect(
    useCallback(() => {
      fetchTicket();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitleStyle: { color: "#3b82f6" },
      headerTitle: "",
    });
  }, [navigation]);

  if (!ticket) return null;

  return (
    <View style={{ flex: 1 }}>
      <VStack
        alignItems="center"
        m={20}
        p={20}
        gap={15}
        flex={1}
        style={{
          backgroundColor: "white",
          borderRadius: 20,
        }}
      >
        <Text color="#3b82f6" numberOfLines={2} adjustsFontSizeToFit fontSize={30} bold>
          {ticket.event.name}
        </Text>
        <Text color="#3b82f6" fontSize={20}>{ticket.event.location}</Text>
        <Text fontSize={15} color="gray">
          {new Date(ticket.event.date).toLocaleString("vi-VN")}
        </Text>

        <Image
          style={{ borderRadius: 20 }}
          width={300}
          height={300}
          source={{ uri: `data:image/png;base64,${qrcode}` }}
        />
      </VStack>

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#3b82f6",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={() => {
          onDeleteTicket();
          console.log("Button pressed");
        }}
      >
        <Text style={{ color: "white", fontSize: 24 }}>
          <TabBarIcon name="trash" /> 
        </Text>
      </TouchableOpacity>
    </View>
  );
}
