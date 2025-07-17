import { useAuth } from '@/context/AuthContext';
import { VStack } from '@/components/VStack';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { Divider } from '@/components/Divider';
import { HStack } from '@/components/HStack';
import { ScrollView } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <VStack flex={1} m={20} gap={20}>
        
        <Text fontSize={22} bold>👤 Your Profile</Text>

        <Divider />

        <VStack gap={10}>
          <ProfileField label="Email" value={user?.email || 'N/A'} />
          <ProfileField label="Role" value={user?.role || 'N/A'} />
        </VStack>

        <Divider />

        <Button onPress={logout} variant="outlined">
          Logout
        </Button>
      </VStack>
    </ScrollView>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontSize={16} color="gray">{label}</Text>
      <Text fontSize={16} bold>{value}</Text>
    </HStack>
  );
}