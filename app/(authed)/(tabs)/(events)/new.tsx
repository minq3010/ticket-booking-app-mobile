import { Button } from "@/components/Button";
import DateTimePicker from "@/components/DateTimePicker";
import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { eventService } from "@/services/events";
import { useNavigation, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function NewEvent() {
  const navigation = useNavigation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maxTickets, setMaxTickets] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ✅ Hàm chọn ảnh
  const pickImage = async () => {
    // Xin quyền truy cập thư viện ảnh
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your photo library!"
      );
      return;
    }

    // Chọn ảnh
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // ✅ Hàm tạo FormData để upload
  const createFormData = () => {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("maxTickets", maxTickets);
    formData.append("date", date.toISOString());

    if (selectedImage) {
      const imageUri = selectedImage;
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }

    return formData;
  };

  async function onSubmit() {
    if (!name.trim()) {
      Alert.alert("Error", "Event name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      if (selectedImage) {
        const formData = createFormData();
        await eventService.createOneWithImage(formData);
      } else {
        await eventService.createOne(
          name,
          location,
          Number(price),
          Number(maxTickets),
          date.toISOString(),
          description
        );
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onChangeDate(date?: Date) {
    setDate(date || new Date());
  }

  useEffect(() => {
    navigation.setOptions({ headerTitle: "New Event" });
  }, []);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <VStack m={20} flex={1} gap={30}>
          <VStack gap={5}>
            <Text ml={10} fontSize={14} color="gray">
              Event Image
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.imageUploadContainer}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
              ) : (
                <VStack alignItems="center" gap={10}>
                  <TabBarIcon size={40} name="camera" color="gray" />
                  <Text color="gray">Tap to select image</Text>
                </VStack>
              )}
            </TouchableOpacity>
            {selectedImage && (
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Text
                  color="red"
                  style={{ textAlign: "center", marginTop: 10 }}
                >
                  Remove Image
                </Text>
              </TouchableOpacity>
            )}
          </VStack>

          <VStack gap={5}>
            <Text ml={10} fontSize={14} color="gray">
              Name
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Event name"
              placeholderTextColor="darkgray"
              h={48}
              p={14}
            />
          </VStack>

          <VStack gap={5}>
            <Text ml={10} fontSize={14} color="gray">
              Location
            </Text>
            <Input
              value={location}
              onChangeText={setLocation}
              placeholder="Event location"
              placeholderTextColor="darkgray"
              h={48}
              p={14}
            />
          </VStack>

          <VStack gap={5}>
            <Text ml={10} fontSize={14} color="gray">
              Description
            </Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Event description"
              placeholderTextColor="darkgray"
              multiline
              numberOfLines={4}
              h={100}
              p={14}
            />
          </VStack>

          <VStack gap={5}>
            <Text ml={10} fontSize={14} color="gray">
              Price
            </Text>
            <Input
              value={price}
              onChangeText={setPrice}
              placeholder="Price in VND"
              placeholderTextColor="darkgray"
              keyboardType="numeric"
              h={48}
              p={14}
            />
          </VStack>

          <VStack gap={5}>
            <Text ml={10} fontSize={14} color="gray">
              Quantity of Tickets
            </Text>
            <Input
              value={maxTickets}
              onChangeText={setMaxTickets}
              placeholder="Quantity of Tickets"
              placeholderTextColor="darkgray"
              keyboardType="numeric"
              h={48}
              p={14}
            />
          </VStack>

          <VStack gap={5}>
            <Text ml={10} fontSize={14} color="gray">
              Date
            </Text>
            <DateTimePicker onChange={onChangeDate} currentDate={date} />
          </VStack>

          <Button
            mt={"auto"}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onPress={onSubmit}
          >
            Create Event
          </Button>
        </VStack>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageUploadContainer: {
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
});
