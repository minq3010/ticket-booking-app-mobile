import React from "react";
import { View } from "react-native";
import { VStack } from "@/components/VStack";
import { HStack } from "@/components/HStack";
import { Text } from "@/components/Text";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { FontAwesome } from "@expo/vector-icons";

interface LoginLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function LoginLayout({ children, title }: LoginLayoutProps) {
  const [showContact, setShowContact] = React.useState(false);
  const floatingEmojis = [
    "🎉",
    "🎟️",
    "😄",
    "🎈",
    "⭐️",
    "🥳",
    "🥂",
    "🎤",
    "🎸",
    "🎬",
    "🎭",
    "🏆",
    "🎮",
    "🕺",
    "🎨",
    "Quốc",
    "Hoàn",
    "Luân",
    "Nghĩa",
  ];
  const fontFamily = "Roboto, Arial, sans-serif";
  const emojiCount = 40;
  const [emojiConfigs] = React.useState(() =>
    Array.from({ length: emojiCount }).map((_, i) => {
      const emoji = floatingEmojis[i % floatingEmojis.length];
      const duration = 8 + Math.random() * 6;
      const delay = Math.random() * 6;
      const left = Math.random() * 90;
      const size = 12 + Math.random() * 32;
      const colors = [
        "#1877f2",
        "#e91e63",
        "#ff9800",
        "#4caf50",
        "#9c27b0",
        "#00bcd4",
        "#ffeb3b",
        "#f44336",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      return { emoji, duration, delay, left, size, color };
    })
  );
  return (
    <View
      style={{
        minHeight: "100vh" as any,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Gradient Background */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)",
          animation: "gradientMove 12s ease-in-out infinite",
          transition: "background 1s",
        }}
      >
        <style>{`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          div[style*='gradientMove'] {
            background-size: 200% 200%;
          }
        `}</style>
      </div>
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {emojiConfigs.map((cfg, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${cfg.left}%`,
              top: "-60px",
              fontSize: `${cfg.size}px`,
              opacity: 0.85,
              animation: `floatDown ${cfg.duration}s linear ${cfg.delay}s infinite`,
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.12))",
              userSelect: "none",
              fontFamily: fontFamily,
              fontWeight: 700,
              letterSpacing: "1px",
              color: cfg.color,
            }}
          >
            {cfg.emoji}
          </span>
        ))}
        <style>{`
          @keyframes floatDown {
            0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.85; }
            10% { opacity: 1; }
            50% { transform: translateY(60vh) scale(1.1) rotate(10deg); }
            80% { opacity: 0.8; }
            100% { transform: translateY(100vh) scale(0.95) rotate(-8deg); opacity: 0; }
          }
        `}</style>
      </div>
      <View
        style={{
          backgroundColor: "white",
          paddingVertical: 20,
          paddingHorizontal: 40,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)" as any,
        }}
      >
        <HStack gap={10} alignItems="center" justifyContent="center">
          <TabBarIcon name="ticket" size={32} color="#1877f2" />
          <Text fontSize={24} bold color="#1877f2">
            Ticket Booking System
          </Text>
        </HStack>
      </View>

      <View
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
          minHeight: "calc(100vh - 80px)" as any,
        }}
      >
        {children}
      </View>

      <View
        style={{
          backgroundColor: "white",
          paddingVertical: 15,
          paddingHorizontal: 40,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        }}
      >
        <VStack gap={8} alignItems="center">
          <Text fontSize={12} color="#8b949e" style={{ textAlign: "center" }}>
            © 2025 Ticket Booking System. All rights reserved.
          </Text>
          <HStack gap={20} justifyContent="center">
            <Text
              fontSize={12}
              color="#1877f2"
              style={{ textDecorationLine: "underline" }}
            >
              Privacy Policy
            </Text>
            <Text
              fontSize={12}
              color="#1877f2"
              style={{ textDecorationLine: "underline" }}
            >
              Terms of Service
            </Text>
            <Text
              fontSize={12}
              color="#1877f2"
              style={{ textDecorationLine: "underline" }}
            >
              Help Center
            </Text>
          </HStack>
        </VStack>
      </View>

      <div
        style={{
          position: "fixed",
          right: 32,
          bottom: 32,
          zIndex: 1001,
        }}
      >
        <button
          style={{
            backgroundColor: "#1877f2",
            color: "white",
            border: "none",
            borderRadius: 50,
            padding: "16px 20px",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => setShowContact((s) => !s)}
        >
          CSKH
        </button>
        {showContact && (
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 70,
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              padding: "24px 28px",
              minWidth: 260,
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FontAwesome name="envelope" size={32} color="#1877f2" />
            <Text
              fontSize={17}
              bold
              color="#1877f2"
              style={{ marginBottom: 2 }}
            >
              Chăm sóc khách hàng
            </Text>
            <div
              style={{ width: "100%", textAlign: "center", marginBottom: 6 }}
            >
              <Text fontSize={15} color="#606770">
                Số điện thoại:
                <br />
                <span
                  style={{ fontWeight: 600, fontSize: 16, color: "#1877f2" }}
                >
                  0866007219
                </span>
              </Text>
            </div>
            <div style={{ width: "100%", textAlign: "center" }}>
              <Text fontSize={15} color="#606770">
                Email:
                <br />
                <span
                  style={{ fontWeight: 600, fontSize: 16, color: "#1877f2" }}
                >
                  manager@gmail.com
                </span>
              </Text>
            </div>
            <button
              style={{
                marginTop: 12,
                backgroundColor: "#e5e7eb",
                color: "#1877f2",
                border: "none",
                borderRadius: 8,
                padding: "6px 18px",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => setShowContact(false)}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </View>
  );
}
