import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1E33" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0D1B2A",
            borderTopColor: "#1E3A5F",
            borderTopWidth: 1,
            height: 95,
            paddingTop: 8,
            paddingBottom: 25,
          },
          tabBarActiveTintColor: "#F59E0B",
          tabBarInactiveTintColor: "#8A94A6",
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flag" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="savings"
          options={{
            title: "Savings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="receipts"
          options={{
            title: "Bonuri",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="receipt" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
