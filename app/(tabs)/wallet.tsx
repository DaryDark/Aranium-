import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WalletScreen() {
  const [receiptAmount, setReceiptAmount] = useState(0);
  const [receiptPoints, setReceiptPoints] = useState(0);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const amount = await AsyncStorage.getItem("walletReceiptAmount");
      const points = await AsyncStorage.getItem("walletReceiptPoints");

      setReceiptAmount(amount ? Number(amount) : 0);
      setReceiptPoints(points ? Number(points) : 0);
    } catch {
      setReceiptAmount(0);
      setReceiptPoints(0);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#07111F", padding: 20, paddingTop: 70 }}>
      <Text style={{ color: "#F5F7FA", fontSize: 30, fontWeight: "800", marginBottom: 20 }}>
        Wallet
      </Text>

      <View style={{ backgroundColor: "#0D1B2A", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <Text style={{ color: "#98A7B8", marginBottom: 8 }}>Total din bonuri</Text>
        <Text style={{ color: "#F5F7FA", fontSize: 28, fontWeight: "800" }}>
          {receiptAmount.toFixed(2)} EUR
        </Text>
      </View>

      <View style={{ backgroundColor: "#0D1B2A", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <Text style={{ color: "#98A7B8", marginBottom: 8 }}>Puncte</Text>
        <Text style={{ color: "#FF8A1F", fontSize: 28, fontWeight: "800" }}>
          {receiptPoints}
        </Text>
      </View>

      <Pressable
        onPress={loadWallet}
        style={{
          backgroundColor: "#1E3A5F",
          padding: 16,
          borderRadius: 16,
        }}
      >
        <Text style={{ textAlign: "center", fontWeight: "800", color: "#F5F7FA", fontSize: 16 }}>
          Refresh Wallet
        </Text>
      </Pressable>
    </View>
  );
}
