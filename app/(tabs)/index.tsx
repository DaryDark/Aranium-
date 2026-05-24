import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function Dashboard() {
  const steps = 5234;
  const aran = Math.floor(steps / 1000);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>ARAN disponibil</Text>
        <Text style={styles.heroValue}>{aran.toFixed(2)} ARAN</Text>
        <Text style={styles.heroSub}>Status: Activ • Sync live</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>Pași azi</Text>
          <Text style={styles.value}>{steps}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Wallet</Text>
          <Text style={styles.value}>Conectat</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Bonuri lună</Text>
          <Text style={styles.value}>0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Economii</Text>
          <Text style={styles.value}>0.00 EUR</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ARAN total</Text>
          <Text style={styles.value}>{aran}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Ultima sync</Text>
          <Text style={styles.value}>Acum</Text>
        </View>
      </View>

      <View style={styles.monitor}>
        <Text style={styles.monitorTitle}>Activitate live</Text>
        <Text style={styles.log}>+ {aran} ARAN din pași</Text>
        <Text style={styles.log}>Wallet conectat</Text>
        <Text style={styles.log}>Sistem activ</Text>
      </View>

      <View style={styles.goal}>
        <Text style={styles.goalTitle}>Obiectiv activ</Text>
        <Text style={styles.goalText}>Nesetat</Text>
        <Text style={styles.goalSub}>Țintă: 0 EUR</Text>
        <Text style={styles.goalSub}>Progres: 0%</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1f44",
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  hero: {
    backgroundColor: "#122a5c",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  heroLabel: {
    color: "#9fb3d9",
    marginBottom: 6,
  },
  heroValue: {
    color: "#f5b942",
    fontSize: 32,
    fontWeight: "700",
  },
  heroSub: {
    color: "#9fb3d9",
    marginTop: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#122a5c",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  label: {
    color: "#9fb3d9",
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  monitor: {
    backgroundColor: "#122a5c",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  monitorTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
  },
  log: {
    color: "#9fb3d9",
    fontSize: 13,
    marginBottom: 4,
  },
  goal: {
    backgroundColor: "#122a5c",
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    marginBottom: 40,
  },
  goalTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  goalText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 4,
  },
  goalSub: {
    color: "#9fb3d9",
    fontSize: 13,
  },
});
