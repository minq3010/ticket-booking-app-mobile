import { HStack } from "@/components/HStack";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { ticketService } from "@/services/tickets";
import { Ticket } from "@/types/ticket";
import {} from "@react-navigation/native";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";

export default function TicketScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

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
    navigation.setOptions({ headerTitle: "Tickets" });
  }, [navigation]);

  return (
    <VStack flex={1} p={20} pb={0} gap={20}>
      <HStack alignItems="center" justifyContent="space-between">
        <Text fontSize={18} bold>
          {tickets.length} Tickets
        </Text>
      </HStack>

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
              h={120}
              key={ticket.id}
              style={{ opacity: ticket.entered ? 0.5 : 1 }}
            >
              <HStack>
                <VStack
                  h={120}
                  w={"69%"}
                  p={20}
                  justifyContent="space-between"
                  style={{
                    backgroundColor: "white",
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
                    >
                      {ticket.event.name}
                    </Text>
                  </HStack>
                  <Text fontSize={12}>
                    {new Date(ticket.event.date).toLocaleString()}
                  </Text>
                  <Text fontSize={15} style={{ flexWrap: "wrap" }}>
                    {ticket.event.location}
                  </Text>
                  <Text fontSize={15} bold>
                    Price:{" "}
                    {ticket.event.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                </VStack>

                <VStack
                  h={110}
                  w={"1%"}
                  style={{
                    alignSelf: "center",
                    borderColor: "lightgray",
                    borderWidth: 2,
                    borderStyle: "dashed",
                  }}
                />

                <VStack
                  h={120}
                  w={"29%"}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    backgroundColor: ticket.entered ? "gray" : "white",
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                  }}
                >
                  <Text fontSize={20} bold>
                    {ticket.entered ? "Used" : "Available"}
                  </Text>
                  {ticket.entered && (
                    <Text
                      style={{ fontSize: 10, paddingLeft: 18, paddingTop: 5 }}
                      mt={12}
                    >
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </VStack>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <VStack h={20} />}
      />
    </VStack>
  );
}
