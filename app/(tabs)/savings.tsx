import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

type MonthlyPlan = {
  income: number;
  fixedCosts: number;
  goalName: string;
  goalTarget: number;
};

type SavingsEntry = {
  id: string;
  amount: number;
  monthKey: string;
  date: string;
  note?: string;
  createdAt?: string;
};

const PLAN_TEMPLATE_KEY = "monthly_plan_template";
const SAVINGS_HISTORY_KEY = "savings_history";
const WALLET_KEY = "aran_wallet_full";

function toNum(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getTodayDate() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function getCurrentMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getMonthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-");
  const names = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];
  return `${names[Number(m) - 1]} ${y}`;
}

function normalizePlan(raw: any): MonthlyPlan {
  return {
    income: toNum(raw?.income),
    fixedCosts: toNum(raw?.fixedCosts),
    goalName: String(raw?.goalName || ""),
    goalTarget: toNum(raw?.goalTarget),
  };
}

function normalizeSaving(raw: any): SavingsEntry {
  return {
    id: String(raw?.id || Date.now()),
    amount: toNum(raw?.amount),
    monthKey: String(raw?.monthKey || getCurrentMonthKey()),
    date: String(raw?.date || getTodayDate()),
    note: raw?.note ? String(raw.note) : "",
    createdAt: raw?.createdAt ? String(raw.createdAt) : new Date().toISOString(),
  };
}

function monthsBackKey(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return getCurrentMonthKey(d);
}

export default function SavingsScreen() {
  const [plan, setPlan] = useState<MonthlyPlan>({
    income: 0,
    fixedCosts: 0,
    goalName: "",
    goalTarget: 0,
  });

  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<"1L" | "3L" | "6L" | "12L" | "TOT">("TOT");

  async function loadData() {
    try {
      const savedPlan = await AsyncStorage.getItem(PLAN_TEMPLATE_KEY);
      const savedSavings = await AsyncStorage.getItem(SAVINGS_HISTORY_KEY);

      const parsedPlan = savedPlan ? normalizePlan(JSON.parse(savedPlan)) : normalizePlan({});
      const parsedSavings = savedSavings
        ? JSON.parse(savedSavings).map((s: any) => normalizeSaving(s))
        : [];

      parsedSavings.sort((a: SavingsEntry, b: SavingsEntry) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
      );

      setPlan(parsedPlan);
      setEntries(parsedSavings);
    } catch (e) {
      console.log("savings load error:", e);
      setPlan(normalizePlan({}));
      setEntries([]);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filteredEntries = useMemo(() => {
    if (filter === "TOT") return entries;

    const monthsMap = {
      "1L": 0,
      "3L": 2,
      "6L": 5,
      "12L": 11,
    } as const;

    const minKey = monthsBackKey(monthsMap[filter]);
    return entries.filter((item) => item.monthKey >= minKey);
  }, [entries, filter]);

  const totalSavings = useMemo(() => {
    return Number(entries.reduce((sum, item) => sum + toNum(item.amount), 0).toFixed(2));
  }, [entries]);

  const filteredSavings = useMemo(() => {
    return Number(filteredEntries.reduce((sum, item) => sum + toNum(item.amount), 0).toFixed(2));
  }, [filteredEntries]);

  const goalTarget = toNum(plan.goalTarget);
  const remainingToGoal = Math.max(0, Number((goalTarget - totalSavings).toFixed(2)));
  const progress = goalTarget > 0
    ? Number((Math.min(totalSavings, goalTarget) / goalTarget * 100).toFixed(2))
    : 0;

  async function syncWalletSavingsAran(nextEntries: SavingsEntry[]) {
    try {
      const total = nextEntries.reduce((sum, item) => sum + toNum(item.amount), 0);
      const aranFromSavings = Number((total / 100 * 5).toFixed(2));

      const savedWallet = await AsyncStorage.getItem(WALLET_KEY);
      const wallet = savedWallet
        ? JSON.parse(savedWallet)
        : {
            aranFromReceipts: 0,
            aranFromSteps: 0,
            aranFromSavings: 0,
            aranClaimed: 0,
          };

      const nextWallet = {
        ...wallet,
        aranFromSavings,
      };

      await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(nextWallet));
    } catch (e) {
      console.log("wallet sync error:", e);
    }
  }

  async function addSaving() {
    const value = toNum(String(amount).replace(",", "."));

    if (value <= 0) {
      Alert.alert("Eroare", "Introdu o sumă validă");
      return;
    }

    const entry: SavingsEntry = {
      id: Date.now().toString(),
      amount: value,
      monthKey: getCurrentMonthKey(),
      date: getTodayDate(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextEntries = [entry, ...entries];

    try {
      await AsyncStorage.setItem(SAVINGS_HISTORY_KEY, JSON.stringify(nextEntries));
      await syncWalletSavingsAran(nextEntries);
      setEntries(nextEntries);
      setAmount("");
      setNote("");
      Alert.alert("Succes", "Economia a fost salvată");
    } catch (e) {
      console.log("add saving error:", e);
      Alert.alert("Eroare", "Nu am putut salva");
    }
  }

  async function deleteSaving(id: string) {
    const nextEntries = entries.filter((item) => item.id !== id);

    try {
      await AsyncStorage.setItem(SAVINGS_HISTORY_KEY, JSON.stringify(nextEntries));
      await syncWalletSavingsAran(nextEntries);
      setEntries(nextEntries);
    } catch (e) {
      console.log("delete saving error:", e);
      Alert.alert("Eroare", "Nu am putut șterge");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Savings</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Obiectiv activ</Text>
        <Text style={styles.heroValue}>{plan.goalName || "Nesetat"}</Text>
        <Text style={styles.heroSub}>Țintă: {goalTarget.toFixed(2)} EUR</Text>
        <Text style={styles.heroSub}>Strâns: {totalSavings.toFixed(2)} EUR</Text>
        <Text style={styles.heroSub}>Rămas: {remainingToGoal.toFixed(2)} EUR</Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Progres</Text>
        <Text style={styles.progressText}>{progress.toFixed(2)}%</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]}
          />
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Adaugă economie</Text>

        <TextInput
          style={styles.input}
          placeholder="Sumă"
          placeholderTextColor="#8fa3bf"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <TextInput
          style={styles.input}
          placeholder="Notă, opțional"
          placeholderTextColor="#8fa3bf"
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addSaving}>
          <Text style={styles.btnText}>ADAUGĂ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Filtru</Text>
        <View style={styles.filterRow}>
          {(["1L", "3L", "6L", "12L", "TOT"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterBtn, filter === item && styles.filterBtnActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={styles.filterText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.filteredInfo}>
          Total pe filtru: {filteredSavings.toFixed(2)} EUR
        </Text>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>Istoric economii</Text>

        {filteredEntries.length === 0 ? (
          <Text style={styles.empty}>Nu ai economii salvate</Text>
        ) : (
          filteredEntries.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyTop}>
                <View>
                  <Text style={styles.historyAmount}>{item.amount.toFixed(2)} EUR</Text>
                  <Text style={styles.historyMeta}>
                    {item.date} , {getMonthLabel(item.monthKey)}
                  </Text>
                  {item.note ? <Text style={styles.historyNote}>{item.note}</Text> : null}
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteSaving(item.id)}
                >
                  <Text style={styles.deleteText}>ȘTERGE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  heroLabel: {
    color: "#8fa3bf",
    fontSize: 14,
    marginBottom: 6,
  },
  heroValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSub: {
    color: "#d7e3f0",
    fontSize: 14,
    marginBottom: 4,
  },
  progressCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  progressText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  progressBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "#132847",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#16a085",
    borderRadius: 999,
  },
  formCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#132847",
    color: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#16a085",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  filterCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterBtn: {
    backgroundColor: "#132847",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  filterBtnActive: {
    backgroundColor: "#f5a623",
  },
  filterText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  filteredInfo: {
    color: "#d7e3f0",
    fontSize: 14,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  empty: {
    color: "#8fa3bf",
    fontSize: 14,
  },
  historyItem: {
    backgroundColor: "#132847",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyAmount: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  historyMeta: {
    color: "#8fa3bf",
    fontSize: 12,
    marginBottom: 4,
  },
  historyNote: {
    color: "#d7e3f0",
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: "#7a1f1f",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
});
