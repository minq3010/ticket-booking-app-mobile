import React, { useState } from "react";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { HStack } from "@/components/HStack";
import { Input } from "@/components/Input";
import { Text } from "@/components/Text";
import { VStack } from "@/components/VStack";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useAuth } from "@/context/AuthContext";
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { globals } from "@/styles/_global";

type LoginFormProps = {
  authMode: "login" | "register";
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoadingAuth: boolean;
  onAuthenticate: () => void;
  errorMsg?: string | null;
  backgroundColor?: string;
};

const LoginForm = React.memo(function LoginForm({
  authMode,
  email,
  setEmail,
  password,
  setPassword,
  isLoadingAuth,
  onAuthenticate,
  backgroundColor = "#ffffff",
  errorMsg,
}: LoginFormProps) {
  return (
    <VStack
      w={"110%"}
      gap={25}
      style={{
        backgroundColor,
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {errorMsg ? (
        <Text
          style={{
            color: "red",
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {errorMsg}
        </Text>
      ) : null}
      <VStack gap={5}>
        <Text ml={10} fontSize={14} color="gray">
          Email
        </Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Nhập email"
          placeholderTextColor="darkgray"
          autoCapitalize="none"
          autoCorrect={false}
          h={48}
          p={14}
        />
      </VStack>

      <VStack gap={5}>
        <Text ml={10} fontSize={14} color="gray">
          Mật khẩu
        </Text>
        <Input
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu"
          placeholderTextColor="darkgray"
          autoCapitalize="none"
          autoCorrect={false}
          h={48}
          p={14}
        />
      </VStack>

      <Button isLoading={isLoadingAuth} onPress={onAuthenticate}>
        {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
      </Button>
    </VStack>
  );
});

export default function Login() {
  const { authenticate, isLoadingAuth } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onAuthenticate() {
    const error = await authenticate(authMode, email, password);
    if (error) setErrorMsg(error);
    else setErrorMsg(null);
  }

  function onToggleAuthMode() {
    setAuthMode(authMode === "login" ? "register" : "login");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[globals.container, { backgroundColor: "#f0f2f5" }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={globals.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <VStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          p={40}
          gap={40}
        >
          <HStack gap={10}>
            <Text fontSize={36} bold mb={25} color="#1877f2">
             Ticket Booking 
            </Text>
            <TabBarIcon name="ticket" size={50} color="#1877f2" />
          </HStack>

          <LoginForm
            backgroundColor="#ffffff"
            authMode={authMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoadingAuth={isLoadingAuth}
            onAuthenticate={onAuthenticate}
            errorMsg={errorMsg}
          />

          <Divider w={"90%"} />
          <TouchableOpacity
            onPress={onToggleAuthMode}
            style={{
              alignItems: "center",
              backgroundColor: "#42b72a",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                margin: 12,
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {authMode === "login" ? "Tạo tài khoản mới" : "Đăng nhập tài khoản"}
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}