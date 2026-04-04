import { useEffect } from "react";
import { View, Text } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";

export default function PhantomRedirect() {
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      console.log("Phantom response:", url);

      setTimeout(() => {
        router.replace("/(tabs)/wallet");
      }, 1200);
    }
  }, [url]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#020617",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 18 }}>
        Se procesează conexiunea...
      </Text>
    </View>
  );
}
