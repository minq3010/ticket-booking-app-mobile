import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { HStack } from '@/components/HStack';
import { Text } from '@/components/Text';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';

interface WebHeaderProps {
  title?: string;
}

export default function WebHeader({ title }: WebHeaderProps) {
  const { user, logout } = useAuth();

  if (Platform.OS !== 'web') return null;

  return (
    <View style={{
      backgroundColor: '#1877f2',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e4e6ea',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' as any,
      position: 'sticky' as any,
      top: 0,
      zIndex: 1000,
    }}>
      <HStack 
        justifyContent="space-between" 
        alignItems="center"
        style={{ 
          maxWidth: 1400, 
          marginLeft: 'auto' as any, 
          marginRight: 'auto' as any, 
          width: '100%' 
        }}
      >
        <HStack gap={12} alignItems="center">
          <TabBarIcon name="ticket" size={32} color="white" />
          <Text 
            fontSize={24} 
            bold 
            color="white"
            style={{
              fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
            }}
          >
            Ticket Booking
          </Text>
          {title && (
            <>
              <Text color="rgba(255,255,255,0.7)" fontSize={20}>•</Text>
              <Text color="rgba(255,255,255,0.9)" fontSize={18}>{title}</Text>
            </>
          )}
        </HStack>

        <HStack gap={16} alignItems="center">
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
            <Text color="white" fontSize={14}>
              {user?.name || 'User'}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={logout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
            <HStack gap={6} alignItems="center">
              <TabBarIcon name="log-out" size={16} color="white" />
              <Text color="white" fontSize={14}>Đăng xuất</Text>
            </HStack>
          </TouchableOpacity>
        </HStack>
      </HStack>
    </View>
  );
}
