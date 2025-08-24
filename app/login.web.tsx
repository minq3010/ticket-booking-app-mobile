import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LoginLayout } from '@/web';
import { VStack } from '@/components/VStack';
import { HStack } from '@/components/HStack';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';

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
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <VStack
            gap={25}
            style={{
                backgroundColor,
                borderRadius: 16,
                padding: 28,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.16,
                shadowRadius: 14,
                elevation: 10,
                width: 560,
                maxWidth: '100%',
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
                <View style={{ position: 'relative', width: '100%' }}>
                    <Input
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="darkgray"
                        autoCapitalize="none"
                        autoCorrect={false}
                        h={48}
                        p={14}
                        pr={44}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword((s) => !s)}
                        style={{ 
                            position: 'absolute', 
                            right: 14, 
                            top: 14, 
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 20,
                            height: 20
                        }}
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <TabBarIcon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </VStack>

            <Button isLoading={isLoadingAuth} onPress={onAuthenticate}>
                {authMode}
            </Button>
        </VStack>
    );
});

export default function LoginWeb() {
  const { authenticate, isLoadingAuth } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onAuthenticate() {
    const error = await authenticate(authMode, email, password);
    if (error) setErrorMsg(error);
    else setErrorMsg(null);
  }

  function onToggleAuthMode() {
    setAuthMode((m) => (m === 'login' ? 'register' : 'login'));
  }

  return (
    <LoginLayout title="Đăng nhập">
      <HStack gap={60} style={{ width: '100%', maxWidth: 1200, alignItems: 'flex-start' }}>
        {/* Left side - Marketing content */}
        <VStack gap={30} style={{ flex: 1, minWidth: 400 }}>
          <VStack gap={15}>
            <HStack gap={10} alignItems="center">
              <Text fontSize={36} bold color="#1877f2">
                Ticket Booking
              </Text>
              <TabBarIcon name="ticket" size={50} color="#1877f2" />
            </HStack>
            <Text fontSize={18} color="#606770">
              Nền tảng đặt vé sự kiện hàng đầu Việt Nam
            </Text>
          </VStack>

          {/* Features */}
          <VStack gap={20}>
            <Text fontSize={22} bold color="#1c1e21">
              Tại sao chọn chúng tôi?
            </Text>
            
            <VStack gap={16}>
              <HStack gap={15} alignItems="center">
                <View style={{ 
                  backgroundColor: '#e7f5ff', 
                  padding: 12, 
                  borderRadius: 12,
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <TabBarIcon name="shield-checkmark" size={24} color="#1877f2" />
                </View>
                <VStack gap={4} style={{ flex: 1 }}>
                  <Text fontSize={16} bold color="#1c1e21">Bảo mật tuyệt đối</Text>
                  <Text fontSize={14} color="#606770">Thanh toán an toàn với mã hóa SSL</Text>
                </VStack>
              </HStack>

              <HStack gap={15} alignItems="center">
                <View style={{ 
                  backgroundColor: '#e8f8f5', 
                  padding: 12, 
                  borderRadius: 12,
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <TabBarIcon name="flash" size={24} color="#42b72a" />
                </View>
                <VStack gap={4} style={{ flex: 1 }}>
                  <Text fontSize={16} bold color="#1c1e21">Xác nhận tức thì</Text>
                  <Text fontSize={14} color="#606770">Nhận vé ngay sau khi thanh toán thành công</Text>
                </VStack>
              </HStack>

              <HStack gap={15} alignItems="center">
                <View style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: 12, 
                  borderRadius: 12,
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <TabBarIcon name="card" size={24} color="#f59e0b" />
                </View>
                <VStack gap={4} style={{ flex: 1 }}>
                  <Text fontSize={16} bold color="#1c1e21">Thanh toán đa dạng</Text>
                  <Text fontSize={14} color="#606770">MoMo, VNPay, Banking, Thẻ tín dụng</Text>
                </VStack>
              </HStack>

              <HStack gap={15} alignItems="center">
                <View style={{ 
                  backgroundColor: '#fce7f3', 
                  padding: 12, 
                  borderRadius: 12,
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <TabBarIcon name="headset" size={24} color="#e91e63" />
                </View>
                <VStack gap={4} style={{ flex: 1 }}>
                  <Text fontSize={16} bold color="#1c1e21">Hỗ trợ 24/7</Text>
                  <Text fontSize={14} color="#606770">Đội ngũ CSKH sẵn sàng hỗ trợ bạn</Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

          {/* Statistics */}
          <VStack gap={15}>
            <Text fontSize={20} bold color="#1c1e21">
              Số liệu ấn tượng
            </Text>
            <HStack gap={40} justifyContent="space-around">
              <VStack gap={4} alignItems="center">
                <Text fontSize={32} bold color="#1877f2">10K+</Text>
                <Text fontSize={14} color="#606770">Sự kiện</Text>
              </VStack>
              <VStack gap={4} alignItems="center">
                <Text fontSize={32} bold color="#42b72a">500K+</Text>
                <Text fontSize={14} color="#606770">Vé đã bán</Text>
              </VStack>
              <VStack gap={4} alignItems="center">
                <Text fontSize={32} bold color="#e91e63">100K+</Text>
                <Text fontSize={14} color="#606770">Người dùng</Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Event types */}
          <VStack gap={15}>
            <Text fontSize={20} bold color="#1c1e21">
              Loại sự kiện phổ biến
            </Text>
            <HStack gap={12} style={{ flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: '#e7f5ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text fontSize={13} color="#1877f2" bold>🎵 Âm nhạc</Text>
              </View>
              <View style={{ backgroundColor: '#e8f8f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text fontSize={13} color="#42b72a" bold>🏆 Thể thao</Text>
              </View>
              <View style={{ backgroundColor: '#fff3cd', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text fontSize={13} color="#f59e0b" bold>🎭 Nghệ thuật</Text>
              </View>
              <View style={{ backgroundColor: '#fce7f3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text fontSize={13} color="#e91e63" bold>🍽️ Ẩm thực</Text>
              </View>
              <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text fontSize={13} color="#8b5cf6" bold>💼 Hội thảo</Text>
              </View>
            </HStack>
          </VStack>
        </VStack>

        {/* Right side - Login form */}
        <VStack
          justifyContent="center"
          alignItems="center"
          gap={40}
          style={{ width: 560, minWidth: 480 }}
        >
          <VStack style={{ alignSelf: 'center', alignItems: 'center', width: '100%' }}>
            <HStack gap={16} alignItems="center">
              <TabBarIcon name={authMode === 'login' ? 'log-in' : 'person-add'} size={36} color="#1877f2" />
              <Text fontSize={36} bold color="#0f172a">
                {authMode === 'login' ? 'Login' : 'Register'}
              </Text>
            </HStack>
            <View style={{ height: 8, width: 120, backgroundColor: '#1877f2', borderRadius: 4, marginTop: 16 }} />
            <Text fontSize={22} color="#64748b" style={{ marginTop: 14, textAlign: 'center' }}>
              {authMode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to start managing events.'}
            </Text>
          </VStack>

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
              width: '100%',
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
      </HStack>
    </LoginLayout>
  );
}
