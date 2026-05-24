import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WalletData = {
  aranFromReceipts: number;
  aranFromSteps: number;
  aranFromSavings: number;
  aranClaimed: number;
};

const WALLET_KEY = "aran_wallet_full";

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function stepsToAran(steps: number) {
  const aran = Math.floor(steps / 1000);
  return Math.min(aran, 10);
}

export default function ExploreScreen() {
  const [manualSteps, setManualSteps] = useState("");
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayAran, setTodayAran] = useState(0);

  function simulateSteps() {
    const steps = toNum(String(manualSteps).replace(",", "."));
    if (steps <= 0) {
      Alert.alert("Eroare", "Introdu un număr de pași mai mare decât 0");
      return;
    }

    const aran = stepsToAran(steps);
    setTodaySteps(steps);
    setTodayAran(aran);

    Alert.alert("Simulare făcută", `Pași: ${steps}\nARAN: ${aran}`);
  }

  function quickAdd1000() {
    const steps = todaySteps + 1000;
    const aran = stepsToAran(steps);
    setTodaySteps(steps);
    setTodayAran(aran);
  }

  function quickAdd5000() {
    const steps = todaySteps + 5000;
    const aran = stepsToAran(steps);
    setTodaySteps(steps);
    setTodayAran(aran);
  }

  function resetSimulation() {
    setManualSteps("");
    setTodaySteps(0);
    setTodayAran(0);
  }

  async function saveToWallet() {
    try {
      const savedWallet = await AsyncStorage.getItem(WALLET_KEY);

      const wallet: WalletData = savedWallet
        ? JSON.parse(savedWallet)
        : {
            aranFromReceipts: 0,
            aranFromSteps: 0,
            aranFromSavings: 0,
            aranClaimed: 0,
          };

      const nextWallet: WalletData = {
        ...wallet,
        aranFromSteps: todayAran,
      };

      await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(nextWallet));
      Alert.alert("Succes", `Ai salvat ${todayAran} ARAN din pași în wallet`);
    } catch (e) {
      console.log("saveToWallet error:", e);
      Alert.alert("Eroare", "Nu am putut salva în wallet");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pași</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Simulare pași</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: 3200"
          placeholderTextColor="#8fa3bf"
          keyboardType="numeric"
          value={manualSteps}
          onChangeText={setManualSteps}
        />

        <TouchableOpacity style={styles.blueBtn} onPress={simulateSteps}>
          <Text style={styles.btnText}>GENEREAZĂ DIN INPUT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.greenBtn} onPress={quickAdd1000}>
          <Text style={styles.btnText}>+1000 PAȘI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.orangeBtn} onPress={quickAdd5000}>
          <Text style={styles.btnText}>+5000 PAȘI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.walletBtn} onPress={saveToWallet}>
          <Text style={styles.btnText}>SALVEAZĂ ÎN WALLET</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={resetSimulation}>
          <Text style={styles.btnText}>RESET</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>Pași azi</Text>
          <Text style={styles.smallValue}>{todaySteps}</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>ARAN azi</Text>
          <Text style={styles.smallValue}>{todayAran}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.rule}>1000 pași = 1 ARAN</Text>
        <Text style={styles.rule}>Limită zilnică = 10 ARAN</Text>
        <Text style={styles.rule}>Simularea este bună pentru test și UI</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071427",
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  label: {
    color: "#8fa3bf",
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#132847",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  blueBtn: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  greenBtn: {
    backgroundColor: "#16a085",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  orangeBtn: {
    backgroundColor: "#f39c12",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  walletBtn: {
    backgroundColor: "#8e44ad",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  resetBtn: {
    backgroundColor: "#c0392b",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallCard: {
    width: "48.5%",
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  smallLabel: {
    color: "#8fa3bf",
    fontSize: 13,
    marginBottom: 6,
  },
  smallValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  rule: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },
});
