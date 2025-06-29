import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { HStack } from '@/components/HStack';
import { Text } from '@/components/Text';
import { VStack } from '@/components/VStack';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/events';
import { ticketService } from '@/services/tickets';
import { Event } from '@/types/event';
import { UserRole } from '@/types/user';
import { useFocusEffect, router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, TouchableOpacity } from 'react-native';

export default function EventsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  function onGoToEventPage(id: number) {
    if (user?.role === UserRole.Manager) {
      router.push({ pathname: "/(authed)/(tabs)/(events)/event/[id]", params: { id: id.toString() } });
    }
  }

  async function buyTicket(id: number) {
    try {
      await ticketService.createOne(id);
      Alert.alert("Success", "Ticket purchased successfully");
      fetchEvents();
    } catch (error) {
      Alert.alert("Error", "Failed to buy ticket");
    }
  }

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getAll();
      setEvents(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchEvents(); }, []));

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Events",
      headerRight: user?.role === UserRole.Manager ? headerRight : null,
    });
  }, [navigation, user]);

  return (
    <VStack flex={1} p={20} pb={0} gap={20}>

      <HStack alignItems='center' justifyContent='space-between'>
        <Text fontSize={18} bold>{events.length} Events</Text>
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
              backgroundColor: 'white',
              borderRadius: 20,
            }} key={event.id}>

            <TouchableOpacity onPress={() => onGoToEventPage(event.id)}>
              <HStack alignItems='center' justifyContent="space-between">
                <HStack alignItems='center' style={{ flexWrap: 'wrap' }}>
                  <Text numberOfLines={2} adjustsFontSizeToFit fontSize={20} bold>{event.name}</Text>
                  <Text fontSize={26} bold> <TabBarIcon size={20} name="location"/> </Text>
                  <Text fontSize={20} bold>{event.location}</Text>
                </HStack>
                {user?.role === UserRole.Manager && <TabBarIcon size={24} name="chevron-forward" 
                style={{ 
                  alignSelf: 'center',
                  position: 'absolute',
                  right: 1,
                  top: 0,
                 }}/>}
              </HStack>
            </TouchableOpacity>

            <Divider />

            <HStack justifyContent='space-between'>
              <Text bold fontSize={16} color='gray'>Sold: {event.totalTicketsPurchased}</Text>
              <Text bold fontSize={16} color='green'>Entered: {event.totalTicketsEntered}</Text>
            </HStack>

            {user?.role === UserRole.Attendee && (
              <VStack>
                <Button
                  variant='outlined'
                  disabled={isLoading}
                  onPress={() => buyTicket(event.id)}
                >
                  Buy Ticket
                </Button>
              </VStack>
            )}

            <Text fontSize={13} color='gray'>{event.date}</Text>
          </VStack>

        )}
      />

    </VStack>
  );
}

const headerRight = () => {
  return (
    <TabBarIcon size={32} name="add-circle-outline" onPress={() => router.push('/(authed)/(tabs)/(events)/new')} />
  );
};