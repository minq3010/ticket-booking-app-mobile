import React from 'react';
import { Platform } from 'react-native';
import { VStack } from '@/components/VStack';
import { HStack } from '@/components/HStack';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

interface WebCardProps {
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  style?: any;
}

export function WebCard({ title, children, headerActions, style }: WebCardProps) {
  if (Platform.OS !== 'web') return <>{children}</>;

  return (
    <div style={{
      padding: 24,
      backgroundColor: 'white',
      borderRadius: 12,
      border: '1px solid #e4e6ea',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      ...style,
    }}>
      <VStack gap={20}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize={18} bold color="#1c1e21">
            {title}
          </Text>
          {headerActions}
        </HStack>
        {children}
      </VStack>
    </div>
  );
}

interface WebStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  icon: string;
  iconColor: string;
  iconBg: string;
}

export function WebStatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  iconColor, 
  iconBg 
}: WebStatsCardProps) {
  if (Platform.OS !== 'web') return null;

  return (
    <div style={{
      padding: 24,
      backgroundColor: 'white',
      borderRadius: 12,
      border: '1px solid #e4e6ea',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <VStack gap={12}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} color="#606770">{title}</Text>
          <div style={{
            backgroundColor: iconBg,
            borderRadius: 8,
            padding: 8,
          }}>
            <TabBarIcon name={icon as any} size={20} color={iconColor} />
          </div>
        </HStack>
        <Text fontSize={32} bold color="#1c1e21">
          {value}
        </Text>
        {change && (
          <HStack gap={6} alignItems="center">
            <TabBarIcon 
              name={changeType === 'up' ? 'arrow-up' : 'arrow-down'} 
              size={12} 
              color={changeType === 'up' ? '#42b72a' : '#dc3545'} 
            />
            <Text 
              fontSize={12} 
              color={changeType === 'up' ? '#42b72a' : '#dc3545'}
            >
              {change}
            </Text>
            <Text fontSize={12} color="#606770">so với tháng trước</Text>
          </HStack>
        )}
      </VStack>
    </div>
  );
}

interface WebEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function WebEmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction 
}: WebEmptyStateProps) {
  if (Platform.OS !== 'web') return null;

  return (
    <VStack gap={24} alignItems="center" style={{ 
      padding: 60
    }}>
      <div style={{
        width: 80,
        height: 80,
        backgroundColor: '#f0f2f5',
        borderRadius: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <TabBarIcon name={icon as any} size={40} color="#606770" />
      </div>
      
      <VStack gap={8} alignItems="center">
        <Text fontSize={20} bold color="#1c1e21">
          {title}
        </Text>
        <Text fontSize={14} color="#606770" style={{ maxWidth: 400 }}>
          {description}
        </Text>
      </VStack>

      {actionText && onAction && (
        <Button onPress={onAction}>
          <Text color="white" fontSize={14}>{actionText}</Text>
        </Button>
      )}
    </VStack>
  );
}
