import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { VStack } from '@/components/VStack';
import { HStack } from '@/components/HStack';
import { Text } from '@/components/Text';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import { useRouter, usePathname } from 'expo-router';

interface MenuItem {
  showFor: UserRole[];
  route: string;
  displayName: string;
  icon: string;
}

export default function WebSidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return null;

  const menuItems: MenuItem[] = [
    {
      showFor: [UserRole.Attendee, UserRole.Manager],
      route: '/(authed)/(tabs)/(events)',
      displayName: 'Sự kiện',
      icon: 'calendar',
    },
    {
      showFor: [UserRole.Attendee],
      route: '/(authed)/(tabs)/(tickets)',
      displayName: 'Vé của tôi',
      icon: 'ticket',
    },
    {
      showFor: [UserRole.Manager],
      route: '/(authed)/(tabs)/scan-ticket',
      displayName: 'Quét vé',
      icon: 'scan',
    },
    {
      showFor: [UserRole.Manager],
      route: '/(authed)/(tabs)/statistics',
      displayName: 'Thống kê',
      icon: 'bar-chart',
    },
    {
      showFor: [UserRole.Attendee, UserRole.Manager],
      route: '/(authed)/(tabs)/(settings)',
      displayName: 'Cài đặt',
      icon: 'settings',
    },
  ];

  const visibleItems = menuItems.filter(item => 
    item.showFor.includes(user?.role as UserRole)
  );

  return (
    <View style={{
      position: 'fixed' as any,
      left: 0,
      top: 80, // Header height
      width: 280,
      height: 'calc(100vh - 80px)' as any,
      backgroundColor: 'white',
      borderRightWidth: 1,
      borderRightColor: '#e4e6ea',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)' as any,
      padding: 20,
      overflowY: 'auto' as any,
    }}>
      <VStack gap={8}>
        <Text 
          fontSize={16} 
          bold 
          color="#606770" 
          style={{ 
            marginBottom: 16,
            fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
          }}
        >
          MENU
        </Text>
        
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.route);
          
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: isActive ? '#e7f3ff' : 'transparent',
                borderWidth: isActive ? 1 : 0,
                borderColor: isActive ? '#1877f2' : 'transparent',
              }}
            >
              <HStack gap={12} alignItems="center">
                <View style={{
                  backgroundColor: isActive ? '#1877f2' : '#f0f2f5',
                  borderRadius: 8,
                  padding: 8,
                }}>
                  <TabBarIcon 
                    name={item.icon as any} 
                    size={20} 
                    color={isActive ? 'white' : '#606770'} 
                  />
                </View>
                <Text 
                  fontSize={15} 
                  color={isActive ? '#1877f2' : '#1c1e21'}
                  style={{
                    fontWeight: isActive ? 'bold' : 'normal',
                    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
                  }}
                >
                  {item.displayName}
                </Text>
              </HStack>
            </TouchableOpacity>
          );
        })}
      </VStack>

      {/* Footer info */}
      <View style={{
        position: 'absolute' as any,
        bottom: 20,
        left: 20,
        right: 20,
      }}>
        <VStack gap={8} style={{
          padding: 16,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
        }}>
          <Text fontSize={12} color="#606770" style={{ textAlign: 'center' }}>
            Ticket Booking App
          </Text>
          <Text fontSize={10} color="#8b949e" style={{ textAlign: 'center' }}>
            Version 1.0.0
          </Text>
        </VStack>
      </View>
    </View>
  );
}
