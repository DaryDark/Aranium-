import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    loadSteps();

    const subscription = Pedometer.watchStepCount(result => {
      setSteps(result.steps);
      saveSteps(result.steps);
    });

    return () => subscription.remove();
  }, []);

  const loadSteps = async () => {
    const saved = await AsyncStorage.getItem("steps");
    if (saved) setSteps(parseInt(saved));
  };

  const saveSteps = async (value: number) => {
    await AsyncStorage.setItem("steps", value.toString());
  };

  const resetSteps = async () => {
    setSteps(0);
    await AsyncStorage.removeItem("steps");
  };

  const eur = Number((steps / 1000).toFixed(2));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B1E33", padding: 20 }}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      <Text style={{ color: "#8A94A6" }}>ARANIUM</Text>
      <Text style={{ color: "#FFFFFF", fontSize: 34, fontWeight: "800", marginBottom: 20 }}>
        Dashboard
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={card}>
          <Text style={label}>Pași</Text>
          <Text style={value}>{steps}</Text>
        </View>

        <View style={card}>
          <Text style={label}>Puncte</Text>
          <Text style={{ ...value, color: "#F59E0B" }}>{steps}</Text>
        </View>
      </View>

      <View style={bigCard}>
        <Text style={label}>Câștig din pași</Text>
        <Text style={{ ...value, color: "#F59E0B" }}>
          +{eur} EUR
        </Text>
        <Text style={{ color: "#8A94A6" }}>1000 pași = 1 EUR</Text>
      </View>

      <TouchableOpacity onPress={resetSteps} style={resetBtn}>
        <Text style={{ color: "#FFFFFF" }}>Reset pași</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const card = {
  flex: 1,
  backgroundColor: "#0D1B2A",
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: "#1E3A5F",
};

const bigCard = {
  backgroundColor: "#0D1B2A",
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: "#1E3A5F",
  marginTop: 15,
};

const label = {
  color: "#8A94A6",
};

const value = {
  color: "#FFFFFF",
  fontSize: 24,
  fontWeight: "800",
};

const resetBtn = {
  marginTop: 20,
  backgroundColor: "#F59E0B",
  padding: 15,
  borderRadius: 12,
  alignItems: "center",
};
