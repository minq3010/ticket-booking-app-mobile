import React from 'react';
import { View, Platform, TouchableOpacity } from 'react-native';
import { HStack } from '@/components/HStack';
import { VStack } from '@/components/VStack';
import { Text } from '@/components/Text';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import { router } from 'expo-router';

interface WebLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function WebLayout({ children, title }: WebLayoutProps) {
  const { user, logout } = useAuth();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const navigationItems = [
    {
      showFor: [UserRole.Attendee, UserRole.Manager],
      name: '(events)',
      displayName: 'Events',
      icon: 'calendar',
      route: '/(authed)/(tabs)/(events)',
      headerShown: false
    },
    {
      showFor: [UserRole.Attendee],
      name: '(tickets)',
      displayName: 'My Tickets',
      icon: 'ticket',
      route: '/(authed)/(tabs)/(tickets)',
      headerShown: false
    },
    {
      showFor: [UserRole.Manager],
      name: 'scan-ticket',
      displayName: 'Scan Ticket',
      icon: 'scan',
      route: '/(authed)/(tabs)/scan-ticket',
      headerShown: false
    },
    {
      showFor: [UserRole.Attendee, UserRole.Manager],
      name: '(settings)',
      displayName: 'Settings',
      icon: 'settings',
      route: '/(authed)/(tabs)/(settings)',
      headerShown: false
    },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    user?.role && item.showFor.includes(user.role as UserRole)
  );

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f8f9fa',
      minHeight: '100vh' as any,
    }}>
      {/* Top Navigation Bar */}
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' as any,
      }}>
        <HStack justifyContent="space-between" alignItems="center">
          {/* Logo/Brand */}
          <HStack gap={10} alignItems="center">
            <TabBarIcon name="ticket" size={24} color="#1877f2" />
            <Text fontSize={20} bold color="#1877f2">
              Ticket Booking
            </Text>
          </HStack>

          {/* Navigation Menu */}
          <HStack gap={16} alignItems="center" style={{ flex: 1, justifyContent: 'center' }}>
            {filteredNavItems.map(item => {
              // Detect active tab by comparing route
              const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(item.route);
              return (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => router.push(item.route as any)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: isActive ? '#e8f8f5' : 'transparent',
                    borderBottomWidth: isActive ? 3 : 0,
                    borderBottomColor: isActive ? '#1877f2' : 'transparent',
                    minWidth: 120,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HStack gap={10} alignItems="center" style={{ justifyContent: 'center' }}>
                    <TabBarIcon name={item.icon as any} size={20} color={isActive ? '#1877f2' : '#606770'} />
                    <Text fontSize={15} bold={isActive} color={isActive ? '#1877f2' : '#606770'}>
                      {item.displayName}
                    </Text>
                  </HStack>
                </TouchableOpacity>
              );
            })}
          </HStack>

          {/* User Menu */}
          <HStack gap={12} alignItems="center">
            <Text fontSize={14} color="#606770">
              {user?.email}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                  logout();
                }
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#ef4444',
                borderRadius: 6,
              }}
            >
              <Text fontSize={12} color="white">
                Logout
              </Text>
            </TouchableOpacity>
          </HStack>
        </HStack>
      </View>

      {/* Main Content */}
      <View style={{
        flex: 1,
        padding: 24,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          minHeight: 'calc(100vh - 120px)' as any,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' as any,
        }}>
          {children}
        </View>
      </View>
    </View>
  );
}
