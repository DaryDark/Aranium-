import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { connectPhantom } from "../../phantom";

export default function WalletScreen() {
  const [tokens, setTokens] = useState(0);
  const [points, setPoints] = useState(100);
  const [money, setMoney] = useState("");
  const [walletStatus, setWalletStatus] = useState("Not connected");

  const convertMoney = () => {
    const value = Number(money);
    if (!value || value <= 0) return;

    const newTokens = value * 10;
    setTokens((prev) => prev + newTokens);
    setMoney("");
  };

  const handleConnectWallet = async () => {
    setWalletStatus("Opening Phantom...");
    await connectPhantom();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <Text style={styles.subtitle}>Convert money into Aranium tokens</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔗 Phantom Wallet</Text>

        <TouchableOpacity style={styles.connectButton} onPress={handleConnectWallet}>
          <Text style={styles.connectText}>Connect Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.status}>{walletStatus}</Text>
      </View>

      <View style={styles.bigCard}>
        <Text style={styles.label}>TOKEN BALANCE</Text>
        <Text style={styles.tokenNumber}>{tokens.toFixed(2)}</Text>
        <Text style={styles.arm}>ARM</Text>

        <View style={styles.row}>
          <View style={styles.smallBox}>
            <Text style={styles.smallLabel}>Cash balance</Text>
            <Text style={styles.smallValue}>$0.00</Text>
          </View>

          <View style={styles.smallBox}>
            <Text style={styles.smallLabel}>Points</Text>
            <Text style={styles.smallValue}>{points}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>↕ Convert money to tokens</Text>
        <Text style={styles.subtitle}>Rate: $1 = 10 ARM</Text>

        <TextInput
          style={styles.input}
          placeholder="$ 0.00"
          placeholderTextColor="#7f8da3"
          keyboardType="numeric"
          value={money}
          onChangeText={setMoney}
        />

        <TouchableOpacity style={styles.convertButton} onPress={convertMoney}>
          <Text style={styles.connectText}>Convert</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061426",
    padding: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 20,
  },
  subtitle: {
    color: "#91a0b6",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#0d2038",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1d3555",
  },
  bigCard: {
    backgroundColor: "#0b1f38",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1d3555",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: "#ff914d",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  convertButton: {
    backgroundColor: "#ff914d",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 16,
  },
  connectText: {
    color: "#07111f",
    fontSize: 18,
    fontWeight: "800",
  },
  status: {
    color: "#91a0b6",
    marginTop: 14,
    fontSize: 14,
  },
  label: {
    color: "#91a0b6",
    fontSize: 14,
    letterSpacing: 2,
  },
  tokenNumber: {
    color: "#ffffff",
    fontSize: 64,
    fontWeight: "900",
    marginTop: 14,
  },
  arm: {
    color: "#ff914d",
    fontSize: 22,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 14,
    marginTop: 24,
  },
  smallBox: {
    flex: 1,
    backgroundColor: "#102744",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1d3555",
  },
  smallLabel: {
    color: "#91a0b6",
    fontSize: 14,
  },
  smallValue: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#102744",
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1d3555",
  },
});
