import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Animated } from "react-native";
import { useRef, useEffect } from "react";

function TabIcon({ name, color, size, focused }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {focused && (
        <View
          style={{
            position: "absolute",
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "rgba(245,166,35,0.18)",
          }}
        />
      )}

      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#f5a623",
        tabBarInactiveTintColor: "#b0b7c3",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          left: 10,
          right: 10,
          height: 72,
          borderRadius: 18,
          backgroundColor: "#0b1b2b",
          borderTopWidth: 1,
          borderTopColor: "#16345f",
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: (props) => <TabIcon {...props} name="home" />,
        }}
      />

      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: (props) => <TabIcon {...props} name="flag" />,
        }}
      />

      <Tabs.Screen
        name="savings"
        options={{
          title: "Savings",
          tabBarIcon: (props) => <TabIcon {...props} name="wallet" />,
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: (props) => <TabIcon {...props} name="card" />,
        }}
      />

      <Tabs.Screen
        name="receipts"
        options={{
          title: "Bonuri",
          tabBarIcon: (props) => <TabIcon {...props} name="receipt" />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: (props) => <TabIcon {...props} name="compass" />,
        }}
      />
    </Tabs>
  );
}
