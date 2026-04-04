import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GoalsScreen() {
  const [earned, setEarned] = useState(0);

  const baseSaved = 2340;
  const target = 15000;
  const daysLeft = 180;

  useEffect(() => {
    loadEarnedMoney();
  }, []);

  async function loadEarnedMoney() {
    try {
      const saved = await AsyncStorage.getItem("earnedMoney");
      if (saved) {
        setEarned(Number(saved));
      } else {
        setEarned(0);
      }
    } catch (e) {
      setEarned(0);
    }
  }

  const current = useMemo(() => {
    return Number((baseSaved + earned).toFixed(2));
  }, [earned]);

  const remaining = useMemo(() => {
    return Number(Math.max(target - current, 0).toFixed(2));
  }, [current]);

  const progress = useMemo(() => {
    return Math.min((current / target) * 100, 100);
  }, [current]);

  const perDay = useMemo(() => {
    return Number((remaining / daysLeft).toFixed(2));
  }, [remaining]);

  const perMonth = useMemo(() => {
    return Number((perDay * 30).toFixed(2));
  }, [perDay]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#07111F" }}>
      <View style={{ padding: 20, paddingTop: 70, paddingBottom: 120 }}>
        <Text
          style={{
            color: "#F5F7FA",
            fontSize: 32,
            fontWeight: "800",
            marginBottom: 20,
          }}
        >
          Goals
        </Text>

        <View
          style={{
            backgroundColor: "#0D1B2A",
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#1E3A5F",
          }}
        >
          <Text style={{ color: "#98A7B8", marginBottom: 12 }}>
            Obiectiv activ
          </Text>

          <Text
            style={{
              color: "#F5F7FA",
              fontSize: 28,
              fontWeight: "800",
              marginBottom: 14,
            }}
          >
            Mașină {target.toLocaleString("ro-RO")} EUR
          </Text>

          <Text
            style={{
              color: "#FF8A1F",
              fontSize: 20,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Adunat {current.toFixed(2)} EUR
          </Text>

          <Text
            style={{
              color: "#98A7B8",
              fontSize: 18,
              marginBottom: 14,
            }}
          >
            Mai ai {remaining.toFixed(2)} EUR
          </Text>

          <View
            style={{
              height: 14,
              backgroundColor: "#1E3A5F",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#FF8A1F",
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#0D1B2A",
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#1E3A5F",
          }}
        >
          <Text style={{ color: "#98A7B8", marginBottom: 12 }}>
            Plan
          </Text>

          <Text
            style={{
              color: "#F5F7FA",
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 12,
            }}
          >
            Pe zi: {perDay.toFixed(2)} EUR
          </Text>

          <Text
            style={{
              color: "#F5F7FA",
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            Pe lună: {perMonth.toFixed(2)} EUR
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#0D1B2A",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#1E3A5F",
          }}
        >
          <Text style={{ color: "#98A7B8", marginBottom: 10 }}>
            Din pași
          </Text>

          <Text
            style={{
              color: "#FF8A1F",
              fontSize: 24,
              fontWeight: "800",
            }}
          >
            +{earned.toFixed(2)} EUR
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
