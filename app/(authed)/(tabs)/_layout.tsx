import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  const { user } = useAuth();

  const tabs = [
    {
      showFor: [UserRole.Attendee, UserRole.Manager],
      name: '(events)',
      displayName: 'Sự kiện',
      icon: 'calendar',
      options: {
        headerShown: false
      }
    },
    {
      showFor: [UserRole.Attendee],
      name: '(tickets)',
      displayName: 'Vé của tôi',
      icon: 'ticket',
      options: {
        headerShown: false
      }
    },
    {
      showFor: [UserRole.Manager],
      name: 'scan-ticket',
      displayName: 'Quét Vé',
      icon: 'scan',
      options: {
        headerShown: true 
      }
    },
    {
      showFor: [UserRole.Manager],
      name: 'statistics',
      displayName: 'Thống kê',
      icon: 'bar-chart',
      options: {
        headerShown: true,
      }
    },
    {
      showFor: [UserRole.Attendee, UserRole.Manager],
      name: '(settings)',
      displayName: 'Cài đặt',
      icon: 'settings',
      options: {
        headerShown: false,
      }
    },
  ];

  return (
    <Tabs
      screenOptions={{
      tabBarStyle: Platform.OS === 'web' ? { display: 'none' } : undefined,
      }}
    >
      {Platform.OS === 'web' && (
      <Tabs.Screen
        name="web"
        options={{
        headerShown: false,
        tabBarStyle: { display: 'none' }
        }}
      />
      )}
      {tabs.map(tab => (
      <Tabs.Screen
        key={tab.name}
        name={tab.name}
        options={{
        ...tab.options,
        headerTitle: tab.displayName,
        href: tab.showFor.includes(user?.role!) ? tab.name : null,
        tabBarLabel: ({ focused }) => (
          <Text style={{ color: focused ? "#3b82f6" : "gray", fontSize: 12 }}>
          {tab.displayName}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          <TabBarIcon
          name={tab.icon as ComponentProps<typeof Ionicons>['name']}
          color={focused ? '#3b82f6' : "gray"}
          />
        ),
        tabBarStyle: Platform.OS === 'web' ? { display: 'none' } : undefined,
        }}
      />
      ))}
    </Tabs>
  );
}