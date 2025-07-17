import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { VStack } from '@/components/VStack';
import { ticketService } from '@/services/tickets';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Vibration } from 'react-native';

export default function ScanTicketScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanningEnabled, setScanningEnabled] = useState(true);

  const onBarcodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
    if (!scanningEnabled) return;

    setScanningEnabled(false); // 🔒 Ngắt tạm thời
    Vibration.vibrate();

    try {
      const [ticket, owner] = data.split(",");
      const ticketId = parseInt(ticket.split(":")[1]);
      const ownerId = parseInt(owner.split(":")[1]);

      await ticketService.validateOne(ticketId, ownerId);

      Alert.alert('✅ Success', 'Ticket validated successfully.', [
        {
          text: 'Scan another',
          onPress: () => setScanningEnabled(true), // ✅ Cho phép quét tiếp
        },
      ]);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to validate ticket.', [
        {
          text: 'Try Again',
          onPress: () => setScanningEnabled(true), // ✅ Cho phép quét lại
        },
      ]);
    }
  }, [scanningEnabled]);

  if (!permission) {
    return (
      <VStack flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" />
      </VStack>
    );
  }

  if (!permission.granted) {
    return (
      <VStack gap={20} flex={1} justifyContent="center" alignItems="center">
        <Text>Camera access is required to scan tickets.</Text>
        <Button onPress={requestPermission}>Allow Camera Access</Button>
      </VStack>
    );
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      onBarcodeScanned={scanningEnabled ? onBarcodeScanned : undefined} // 👈 Chỉ kích hoạt khi cho phép
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
    />
  );
}