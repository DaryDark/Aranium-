import { View, Text } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function PhantomCallback() {
  const router = useRouter();

  useEffect(() => {
    // după login te duce înapoi în app
    setTimeout(() => {
      router.replace("/(tabs)/wallet");
    }, 1000);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0b1730" }}>
      <Text style={{ color: "#fff", fontSize: 18 }}>
        Conectare Phantom...
      </Text>
    </View>
  );
}
