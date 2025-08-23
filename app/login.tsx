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
  View,
  Dimensions,
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
          placeholder="Email"
          placeholderTextColor="darkgray"
          autoCapitalize="none"
          autoCorrect={false}
          h={48}
          p={14}
        />
      </VStack>

      <VStack gap={5}>
        <Text ml={10} fontSize={14} color="gray">
          Password
        </Text>
        <Input
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="darkgray"
          autoCapitalize="none"
          autoCorrect={false}
          h={48}
          p={14}
        />
      </VStack>

      <Button isLoading={isLoadingAuth} onPress={onAuthenticate}>
        {authMode}
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

  // Detect if running on web
  const isWeb = Platform.OS === "web";
  const { width: screenWidth } = Dimensions.get("window");
  const isLargeScreen = screenWidth > 768;

  // Web Layout Component
  const WebLayout = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f0f2f5",
        ...(isWeb && { minHeight: "100vh" as any }),
      }}
    >
      {/* Header for web */}
      <View
        style={{
          backgroundColor: "#1877f2",
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#e4e6ea",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <HStack
          gap={15}
          justifyContent="space-between"
          alignItems="center"
          style={{
            maxWidth: 1200,
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
          }}
        >
          <HStack gap={12} alignItems="center">
            <TabBarIcon name="ticket" size={32} color="white" />
            <VStack gap={2}>
              <Text fontSize={24} bold color="white">
                Ticket Booking App
              </Text>
              <Text fontSize={12} color="#b3d4fc">
                Nền tảng đặt vé sự kiện #1 Việt Nam
              </Text>
            </VStack>
          </HStack>

          <HStack gap={20} alignItems="center">
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text color="white" fontSize={14}>
                Tải App
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
              }}
            >
              <Text color="#1877f2" fontSize={14} bold>
                Hỗ
              </Text>
            </TouchableOpacity>
          </HStack>
        </HStack>
      </View>

      {/* Main content */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {isLargeScreen ? (
          <HStack
            gap={80}
            alignItems="center"
            style={{ maxWidth: 1400, width: "100%" }}
          >
            {/* Left side - Marketing content */}
            <VStack flex={1} gap={45} style={{ maxWidth: 600 }}>
              {/* Main heading */}
              <VStack gap={16}>
                <Text
                  style={{
                    fontSize: isWeb ? 64 : 48, // Dùng style object cho web
                    fontWeight: 'bold',
                    color: '#1877f2',
                    lineHeight: isWeb ? 72 : 56,
                    ...(isWeb && {
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }),
                  }}
                >
                  🎫 Ticket Booking
                </Text>
                <Text 
                  style={{
                    fontSize: isWeb ? 20 : 16,
                    color: '#8b949e',
                    lineHeight: isWeb ? 28 : 24,
                    ...(isWeb && {
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }),
                  }}
                >
                  Nền tảng đặt vé sự kiện hàng đầu Việt Nam
                </Text>
              </VStack>

              {/* Main description */}
              <Text
                style={{
                  fontSize: isWeb ? 24 : 18,
                  color: '#424242',
                  lineHeight: isWeb ? 36 : 28,
                  fontWeight: '500',
                  ...(isWeb && {
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }),
                }}
              >
                Đặt vé sự kiện dễ dàng và nhanh chóng. Kết nối với hàng ngàn sự
                kiện hấp dẫn trên toàn quốc.
              </Text>

              {/* Features list */}
              <VStack gap={24}>
                <HStack gap={16} alignItems="center">
                  <View
                    style={{
                      backgroundColor: "#e7f5ff",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <TabBarIcon
                      name="shield-checkmark"
                      size={32}
                      color="#1877f2"
                    />
                  </View>
                  <VStack gap={4}>
                    <Text 
                      style={{
                        fontSize: isWeb ? 18 : 16,
                        fontWeight: 'bold',
                        color: '#1c1e21',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Bảo mật tuyệt đối
                    </Text>
                    <Text 
                      style={{
                        fontSize: isWeb ? 14 : 12,
                        color: '#606770',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Thông tin cá nhân được mã hóa và bảo vệ
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={16} alignItems="center">
                  <View
                    style={{
                      backgroundColor: "#e8f8f5",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <TabBarIcon name="flash" size={32} color="#42b72a" />
                  </View>
                  <VStack gap={4}>
                    <Text 
                      style={{
                        fontSize: isWeb ? 18 : 16,
                        fontWeight: 'bold',
                        color: '#1c1e21',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Xác nhận tức thì
                    </Text>
                    <Text 
                      style={{
                        fontSize: isWeb ? 14 : 12,
                        color: '#606770',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Nhận vé điện tử ngay sau khi thanh toán
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={16} alignItems="center">
                  <View
                    style={{
                      backgroundColor: "#fff3cd",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <TabBarIcon name="card" size={32} color="#ffc107" />
                  </View>
                  <VStack gap={4}>
                    <Text 
                      style={{
                        fontSize: isWeb ? 18 : 16,
                        fontWeight: 'bold',
                        color: '#1c1e21',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Đa dạng thanh toán
                    </Text>
                    <Text 
                      style={{
                        fontSize: isWeb ? 14 : 12,
                        color: '#606770',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Hỗ trợ MoMo, VNPay, thẻ ngân hàng
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={16} alignItems="center">
                  <View
                    style={{
                      backgroundColor: "#fce4ec",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <TabBarIcon name="people" size={32} color="#e91e63" />
                  </View>
                  <VStack gap={4}>
                    <Text 
                      style={{
                        fontSize: isWeb ? 18 : 16,
                        fontWeight: 'bold',
                        color: '#1c1e21',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Cộng đồng lớn
                    </Text>
                    <Text 
                      style={{
                        fontSize: isWeb ? 14 : 12,
                        color: '#606770',
                        ...(isWeb && {
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }),
                      }}
                    >
                      Hơn 100,000 người dùng tin tưởng
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              {/* Stats */}
              <HStack gap={50} style={{ marginTop: 20 }}>
                <VStack gap={8} alignItems="center">
                  <Text 
                    style={{
                      fontSize: isWeb ? 32 : 24,
                      fontWeight: 'bold',
                      color: '#1877f2',
                      ...(isWeb && {
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }),
                    }}
                  >
                    10K+
                  </Text>
                  <Text 
                    style={{
                      fontSize: isWeb ? 14 : 12,
                      color: '#606770',
                      ...(isWeb && {
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }),
                    }}
                  >
                    Sự kiện
                  </Text>
                </VStack>
                <VStack gap={8} alignItems="center">
                  <Text 
                    style={{
                      fontSize: isWeb ? 32 : 24,
                      fontWeight: 'bold',
                      color: '#42b72a',
                      ...(isWeb && {
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }),
                    }}
                  >
                    500K+
                  </Text>
                  <Text 
                    style={{
                      fontSize: isWeb ? 14 : 12,
                      color: '#606770',
                      ...(isWeb && {
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }),
                    }}
                  >
                    Vé đã bán
                  </Text>
                </VStack>
                <VStack gap={8} alignItems="center">
                  <Text 
                    style={{
                      fontSize: isWeb ? 32 : 24,
                      fontWeight: 'bold',
                      color: '#e91e63',
                      ...(isWeb && {
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }),
                    }}
                  >
                    100K+
                  </Text>
                  <Text 
                    style={{
                      fontSize: isWeb ? 14 : 12,
                      color: '#606770',
                      ...(isWeb && {
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }),
                    }}
                  >
                    Người dùng
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Right side - Login form */}
            <View style={{ width: 450 }}>{children}</View>
          </HStack>
        ) : (
          <View style={{ width: "100%", maxWidth: 450 }}>{children}</View>
        )}
      </View>

      {/* Footer for web */}
      <View
        style={{
          backgroundColor: "#f8f9fa",
          borderTopWidth: 1,
          borderTopColor: "#e4e6ea",
          padding: 24,
        }}
      >
        <VStack
          gap={20}
          style={{
            maxWidth: 1200,
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
          }}
        >
          <HStack
            gap={40}
            justifyContent="space-between"
            style={{ flexWrap: "wrap" as any }}
          >
            <VStack gap={12}>
              <Text fontSize={16} bold color="#1c1e21">
                Sản phẩm
              </Text>
              <Text fontSize={14} color="#606770">
                Đặt vé sự kiện
              </Text>
              <Text fontSize={14} color="#606770">
                Quản lý sự kiện
              </Text>
              <Text fontSize={14} color="#606770">
                Phân tích dữ liệu
              </Text>
            </VStack>

            <VStack gap={12}>
              <Text fontSize={16} bold color="#1c1e21">
                Hỗ trợ
              </Text>
              <Text fontSize={14} color="#606770">
                Trung tâm hỗ trợ
              </Text>
              <Text fontSize={14} color="#606770">
                Liên hệ
              </Text>
              <Text fontSize={14} color="#606770">
                Câu hỏi thường gặp
              </Text>
            </VStack>

            <VStack gap={12}>
              <Text fontSize={16} bold color="#1c1e21">
                Công ty
              </Text>
              <Text fontSize={14} color="#606770">
                Về chúng tôi
              </Text>
              <Text fontSize={14} color="#606770">
                Tuyển dụng
              </Text>
              <Text fontSize={14} color="#606770">
                Tin tức
              </Text>
            </VStack>

            <VStack gap={12}>
              <Text fontSize={16} bold color="#1c1e21">
                Kết nối
              </Text>
              <HStack gap={10}>
                <TabBarIcon name="logo-facebook" size={20} color="#1877f2" />
                <TabBarIcon name="logo-instagram" size={20} color="#e91e63" />
                <TabBarIcon name="logo-youtube" size={20} color="#ff0000" />
              </HStack>
            </VStack>
          </HStack>

          <View
            style={{ height: 1, backgroundColor: "#e4e6ea", width: "100%" }}
          />

          <HStack
            justifyContent="space-between"
            alignItems="center"
            style={{ flexWrap: "wrap" as any }}
          >
            <Text fontSize={12} color="#606770">
              © 2025 Ticket Booking App. All rights reserved.
            </Text>
            <HStack gap={20}>
              <Text fontSize={12} color="#606770">
                Điều khoản sử dụng
              </Text>
              <Text fontSize={12} color="#606770">
                Chính sách bảo mật
              </Text>
              <Text fontSize={12} color="#606770">
                Cookie
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </View>
    </View>
  );

  const loginContent = (
    <VStack gap={40} alignItems="center" style={{ width: "100%" }}>
      {!isWeb && (
        <HStack gap={10}>
          <Text fontSize={36} bold mb={25} color="#1877f2">
            Ticket Booking
          </Text>
          <TabBarIcon name="ticket" size={50} color="#1877f2" />
        </HStack>
      )}

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
          width: "100%",
          maxWidth: 300,
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
          {authMode === "login" ? "Create an account" : "Login to account"}
        </Text>
      </TouchableOpacity>
    </VStack>
  );

  if (isWeb) {
    return <WebLayout>{loginContent}</WebLayout>;
  }

  // Mobile layout (original)
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
          {loginContent}
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
