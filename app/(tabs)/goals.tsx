import React, { useEffect, useMemo, useState } from "react";
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

type ReceiptItem = {
  id: string;
  store: string;
  amount: number;
  date: string;
  image: string | null;
  source: "manual";
  createdAt?: string;
};

type MonthlyPlan = {
  income: number;
  fixedCosts: number;
  goalName: string;
  goalTarget: number;
};

type MonthSnapshot = {
  monthKey: string;
  income: number;
  fixedCosts: number;
  spentTotal: number;
  remaining: number;
  possibleSavings: number;
  aranEarned: number;
  receiptCount: number;
  goalName: string;
  goalTarget: number;
  savedAt: string;
};

const RECEIPTS_KEY = "saved_receipts";
const PLAN_TEMPLATE_KEY = "monthly_plan_template";
const MONTH_HISTORY_KEY = "monthly_history";
const ACTIVE_MONTH_KEY = "active_month_key";

function toNum(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getMonthLabel(monthKey: string) {
  const [y, m] = String(monthKey || getMonthKey()).split("-");
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
  const monthIndex = Math.max(1, Math.min(12, Number(m || 1))) - 1;
  return `${names[monthIndex]} ${y || new Date().getFullYear()}`;
}

function monthFromReceipt(dateStr: string) {
  const m = String(dateStr || "").match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2]}`;
}

function defaultPlan(): MonthlyPlan {
  return {
    income: 0,
    fixedCosts: 0,
    goalName: "",
    goalTarget: 0,
  };
}

function normalizePlan(raw: any): MonthlyPlan {
  return {
    income: toNum(raw?.income),
    fixedCosts: toNum(raw?.fixedCosts),
    goalName: String(raw?.goalName || ""),
    goalTarget: toNum(raw?.goalTarget),
  };
}

function normalizeReceipt(raw: any): ReceiptItem {
  return {
    id: String(raw?.id || Date.now()),
    store: String(raw?.store || ""),
    amount: toNum(raw?.amount),
    date: String(raw?.date || ""),
    image: raw?.image ? String(raw.image) : null,
    source: "manual",
    createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
  };
}

function normalizeSnapshot(raw: any): MonthSnapshot {
  return {
    monthKey: String(raw?.monthKey || getMonthKey()),
    income: toNum(raw?.income),
    fixedCosts: toNum(raw?.fixedCosts),
    spentTotal: toNum(raw?.spentTotal),
    remaining: toNum(raw?.remaining),
    possibleSavings: toNum(raw?.possibleSavings),
    aranEarned: toNum(raw?.aranEarned),
    receiptCount: toNum(raw?.receiptCount),
    goalName: String(raw?.goalName || ""),
    goalTarget: toNum(raw?.goalTarget),
    savedAt: String(raw?.savedAt || new Date().toISOString()),
  };
}

export default function MonthlyPlanScreen() {
  const [plan, setPlan] = useState<MonthlyPlan>(defaultPlan());
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [history, setHistory] = useState<MonthSnapshot[]>([]);
  const [activeMonth, setActiveMonth] = useState(getMonthKey());

  useEffect(() => {
    initData();
  }, []);

  async function initData() {
    try {
      const currentMonth = getMonthKey();

      const savedPlan = await AsyncStorage.getItem(PLAN_TEMPLATE_KEY);
      const savedReceipts = await AsyncStorage.getItem(RECEIPTS_KEY);
      const savedHistory = await AsyncStorage.getItem(MONTH_HISTORY_KEY);
      const savedActiveMonth = await AsyncStorage.getItem(ACTIVE_MONTH_KEY);

      const parsedPlan = savedPlan ? normalizePlan(JSON.parse(savedPlan)) : defaultPlan();
      const parsedReceipts = savedReceipts
        ? JSON.parse(savedReceipts).map((r: any) => normalizeReceipt(r))
        : [];
      const parsedHistory = savedHistory
        ? JSON.parse(savedHistory).map((h: any) => normalizeSnapshot(h))
        : [];
      const oldActiveMonth = savedActiveMonth || currentMonth;

      setPlan(parsedPlan);
      setReceipts(parsedReceipts);
      setHistory(parsedHistory);

      if (oldActiveMonth !== currentMonth) {
        const oldSnapshot = buildSnapshot(oldActiveMonth, parsedPlan, parsedReceipts);
        const nextHistory = upsertHistory(parsedHistory, oldSnapshot);

        await AsyncStorage.setItem(MONTH_HISTORY_KEY, JSON.stringify(nextHistory));
        await AsyncStorage.setItem(ACTIVE_MONTH_KEY, currentMonth);

        setHistory(nextHistory);
        setActiveMonth(currentMonth);
      } else {
        await AsyncStorage.setItem(ACTIVE_MONTH_KEY, currentMonth);
        setActiveMonth(currentMonth);
      }
    } catch (e) {
      console.log("initData error:", e);
      setPlan(defaultPlan());
      setReceipts([]);
      setHistory([]);
      setActiveMonth(getMonthKey());
    }
  }

  function buildSnapshot(
    monthKey: string,
    currentPlan: MonthlyPlan,
    allReceipts: ReceiptItem[]
  ): MonthSnapshot {
    const monthReceipts = allReceipts.filter((r) => monthFromReceipt(r.date) === monthKey);

    const spentTotal = Number(
      monthReceipts.reduce((sum, r) => sum + toNum(r.amount), 0).toFixed(2)
    );

    const remaining = Number(
      (toNum(currentPlan.income) - toNum(currentPlan.fixedCosts) - spentTotal).toFixed(2)
    );

    const possibleSavings = remaining > 0 ? remaining : 0;
    const aranEarned = Number((spentTotal / 10).toFixed(2));

    return {
      monthKey,
      income: toNum(currentPlan.income),
      fixedCosts: toNum(currentPlan.fixedCosts),
      spentTotal,
      remaining,
      possibleSavings,
      aranEarned,
      receiptCount: monthReceipts.length,
      goalName: String(currentPlan.goalName || ""),
      goalTarget: toNum(currentPlan.goalTarget),
      savedAt: new Date().toISOString(),
    };
  }

  function upsertHistory(items: MonthSnapshot[], snapshot: MonthSnapshot) {
    const filtered = items.filter((x) => x.monthKey !== snapshot.monthKey);
    return [snapshot, ...filtered].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }

  async function savePlan() {
    try {
      const safePlan = normalizePlan(plan);
      await AsyncStorage.setItem(PLAN_TEMPLATE_KEY, JSON.stringify(safePlan));
      setPlan(safePlan);
      Alert.alert("Succes", "Planul lunar a fost salvat");
    } catch (e) {
      console.log("savePlan error:", e);
      Alert.alert("Eroare", "Nu am putut salva planul");
    }
  }

  async function archiveCurrentMonth() {
    Alert.alert("Confirmare", "Salvez luna curentă în istoric?", [
      { text: "Nu", style: "cancel" },
      {
        text: "Da",
        style: "destructive",
        onPress: async () => {
          const snapshot = buildSnapshot(activeMonth, plan, receipts);
          const nextHistory = upsertHistory(history, snapshot);
          await AsyncStorage.setItem(MONTH_HISTORY_KEY, JSON.stringify(nextHistory));
          setHistory(nextHistory);
          Alert.alert("Gata", "Luna curentă a fost arhivată");
        },
      },
    ]);
  }

  async function clearHistory() {
    Alert.alert("Confirmare", "Ștergi tot istoricul lunar?", [
      { text: "Nu", style: "cancel" },
      {
        text: "Da",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.setItem(MONTH_HISTORY_KEY, JSON.stringify([]));
          setHistory([]);
        },
      },
    ]);
  }

  const currentMonthReceipts = useMemo(() => {
    return receipts.filter((r) => monthFromReceipt(r.date) === activeMonth);
  }, [receipts, activeMonth]);

  const spentTotal = useMemo(() => {
    return Number(
      currentMonthReceipts.reduce((sum, r) => sum + toNum(r.amount), 0).toFixed(2)
    );
  }, [currentMonthReceipts]);

  const income = toNum(plan.income);
  const fixedCosts = toNum(plan.fixedCosts);
  const remaining = Number((income - fixedCosts - spentTotal).toFixed(2));
  const possibleSavings = remaining > 0 ? remaining : 0;
  const aranEarned = Number((spentTotal / 10).toFixed(2));
  const goalTarget = toNum(plan.goalTarget);
  const goalProgress =
    goalTarget > 0 ? Number((Math.min(possibleSavings, goalTarget) / goalTarget * 100).toFixed(2)) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Plan lunar</Text>
      <Text style={styles.monthTitle}>{getMonthLabel(activeMonth)}</Text>

      <View style={styles.bigCard}>
        <Text style={styles.bigLabel}>Salariu lunar</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={String(plan.income || "")}
          onChangeText={(v) =>
            setPlan((prev) => ({ ...prev, income: toNum(v.replace(",", ".")) }))
          }
          placeholder="Ex: 2000"
          placeholderTextColor="#8fa3bf"
        />
      </View>

      <View style={styles.bigCard}>
        <Text style={styles.bigLabel}>Cheltuieli fixe lunare</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={String(plan.fixedCosts || "")}
          onChangeText={(v) =>
            setPlan((prev) => ({ ...prev, fixedCosts: toNum(v.replace(",", ".")) }))
          }
          placeholder="Ex: 700"
          placeholderTextColor="#8fa3bf"
        />
        <Text style={styles.helper}>Ex: chirie, facturi, rate, abonamente</Text>
      </View>

      <View style={styles.bigCard}>
        <Text style={styles.bigLabel}>Obiectiv personalizat</Text>
        <TextInput
          style={styles.input}
          value={plan.goalName}
          onChangeText={(v) => setPlan((prev) => ({ ...prev, goalName: v }))}
          placeholder="Ex: Mașină, concediu, fond rezervă"
          placeholderTextColor="#8fa3bf"
        />

        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={String(plan.goalTarget || "")}
          onChangeText={(v) =>
            setPlan((prev) => ({ ...prev, goalTarget: toNum(v.replace(",", ".")) }))
          }
          placeholder="Ex: 500"
          placeholderTextColor="#8fa3bf"
        />
      </View>

      <View style={styles.rowButtons}>
        <TouchableOpacity style={styles.saveBtn} onPress={savePlan}>
          <Text style={styles.btnText}>SALVEAZĂ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={archiveCurrentMonth}>
          <Text style={styles.btnText}>ARHIVEAZĂ LUNA</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Rezumat</Text>
      <View style={styles.grid}>
        <View style={styles.miniStatCard}>
          <Text style={styles.statLabel}>Buget</Text>
          <Text style={styles.statValue}>{income.toFixed(2)} EUR</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={styles.statLabel}>Fixe</Text>
          <Text style={styles.statValue}>{fixedCosts.toFixed(2)} EUR</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={styles.statLabel}>Bonuri</Text>
          <Text style={styles.statValue}>{spentTotal.toFixed(2)} EUR</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={styles.statLabel}>Rămas</Text>
          <Text style={styles.statValue}>{remaining.toFixed(2)} EUR</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={styles.statLabel}>Economii</Text>
          <Text style={styles.statValue}>{possibleSavings.toFixed(2)} EUR</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={styles.statLabel}>ARAN</Text>
          <Text style={styles.statValue}>{aranEarned.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.bigCard}>
        <Text style={styles.sectionTitle}>Obiectiv curent</Text>
        <Text style={styles.goalName}>{plan.goalName || "Nesetat"}</Text>
        <Text style={styles.goalLine}>Țintă: {goalTarget.toFixed(2)} EUR</Text>
        <Text style={styles.goalLine}>Poți pune deoparte: {possibleSavings.toFixed(2)} EUR</Text>
        <Text style={styles.goalLine}>Progres: {goalProgress.toFixed(2)}%</Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(goalProgress, 100)}%` }]} />
        </View>
      </View>

      <View style={styles.bigCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Istoric luni</Text>
          <TouchableOpacity style={styles.smallDanger} onPress={clearHistory}>
            <Text style={styles.smallDangerText}>ȘTERGE ISTORIC</Text>
          </TouchableOpacity>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>Nu ai încă luni arhivate</Text>
        ) : (
          history.map((rawItem) => {
            const item = normalizeSnapshot(rawItem);

            return (
              <View key={item.monthKey} style={styles.historyCard}>
                <Text style={styles.historyTitle}>{getMonthLabel(item.monthKey)}</Text>
                <Text style={styles.historyLine}>Salariu: {item.income.toFixed(2)} EUR</Text>
                <Text style={styles.historyLine}>Fixe: {item.fixedCosts.toFixed(2)} EUR</Text>
                <Text style={styles.historyLine}>Bonuri: {item.spentTotal.toFixed(2)} EUR</Text>
                <Text style={styles.historyLine}>Rămas: {item.remaining.toFixed(2)} EUR</Text>
                <Text style={styles.historyLine}>Economii: {item.possibleSavings.toFixed(2)} EUR</Text>
                <Text style={styles.historyLine}>ARAN: {item.aranEarned.toFixed(2)}</Text>
                <Text style={styles.historyLine}>Bonuri număr: {item.receiptCount}</Text>
                <Text style={styles.historyLine}>
                  Obiectiv: {item.goalName || "Nesetat"} , {item.goalTarget.toFixed(2)} EUR
                </Text>
              </View>
            );
          })
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
    marginBottom: 4,
  },
  monthTitle: {
    color: "#8fa3bf",
    fontSize: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  bigCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bigLabel: {
    color: "#ffffff",
    fontSize: 15,
    marginBottom: 8,
  },
  helper: {
    color: "#8fa3bf",
    fontSize: 12,
    marginTop: 6,
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
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  saveBtn: {
    width: "48.5%",
    backgroundColor: "#16a085",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  resetBtn: {
    width: "48.5%",
    backgroundColor: "#c0392b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  miniStatCard: {
    width: "48.5%",
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  statLabel: {
    color: "#8fa3bf",
    fontSize: 13,
    marginBottom: 6,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  goalName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  goalLine: {
    color: "#ffffff",
    fontSize: 15,
    marginBottom: 6,
  },
  progressBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "#132847",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#16a085",
    borderRadius: 999,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallDanger: {
    backgroundColor: "#7a1f1f",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  smallDangerText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyText: {
    color: "#8fa3bf",
    fontSize: 14,
  },
  historyCard: {
    backgroundColor: "#132847",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  historyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  historyLine: {
    color: "#d7e3f0",
    fontSize: 13,
    marginBottom: 4,
  },
});
