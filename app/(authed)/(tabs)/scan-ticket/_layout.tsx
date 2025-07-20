import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { ticketService } from "@/services/tickets";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Alert, Vibration } from "react-native";
import { useRouter } from "expo-router";
import debounce from "lodash.debounce";
export default function ScanTicketScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  
  const handleScan = async ({ data }: BarcodeScanningResult) => {
    Vibration.vibrate();
    
    try {
      const [ticket, owner] = data.split(",");
      const ticketId = parseInt(ticket.split(":")[1]);
      const ownerId = parseInt(owner.split(":")[1]);
      
      await ticketService.validateOne(ticketId, ownerId);
      
      Alert.alert("✅ Success", "Ticket validated successfully.");
    } catch (error) {
      Alert.alert("❌ Error", "Failed to validate ticket.");
    }
  };
  
  const debouncedOnBarcodeScanned = useMemo(
    () =>
      debounce((result: BarcodeScanningResult) => {
        handleScan(result);
      }, 200),
      []
    );
    
    if (!permission) {
      return (
        <VStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} />
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
      zoom={0.25}
      facing="back"
      onBarcodeScanned={debouncedOnBarcodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
    />
  );
}
