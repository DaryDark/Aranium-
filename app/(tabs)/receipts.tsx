import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SavedReceipt = {
  id: string;
  store: string;
  amount: number;
  date: string;
  image: string | null;
  source: "manual";
  createdAt: string;
};

const RECEIPTS_KEY = "saved_receipts";
const WALLET_KEY = "aran_wallet";

export default function ReceiptsScreen() {
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getToday());
  const [image, setImage] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  function getToday() {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function getNowIso() {
    return new Date().toISOString();
  }

  function formatTime(iso?: string) {
    if (!iso) return "--:--";
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadReceipts() {
    const saved = await AsyncStorage.getItem(RECEIPTS_KEY);
    if (saved) setReceipts(JSON.parse(saved));
  }

  async function saveAll(next: SavedReceipt[]) {
    setReceipts(next);
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(next));

    const total = next.reduce((s, i) => s + i.amount, 0);
    const wallet = {
      aranPoints: Number((total / 10).toFixed(2)),
      totalSpent: total,
      receiptCount: next.length,
    };
    await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  }

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) setImage(res.assets[0].uri);
  }

  async function takePhoto() {
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) setImage(res.assets[0].uri);
  }

  function resetForm() {
    setStore("");
    setAmount("");
    setDate(getToday());
    setImage(null);
    setEditingId(null);
  }

  async function saveReceipt() {
    const a = Number(amount.replace(",", "."));

    if (!store.trim() || !a || a <= 0 || !date.trim()) {
      Alert.alert("Eroare", "Completează corect magazin, sumă și dată");
      return;
    }

    if (editingId) {
      const updated = receipts.map((r) =>
        r.id === editingId
          ? {
              ...r,
              store: store.trim(),
              amount: a,
              date: date.trim(),
              image,
            }
          : r
      );

      await saveAll(updated);
      resetForm();
      Alert.alert("Succes", "Bon modificat");
      return;
    }

    const newR: SavedReceipt = {
      id: Date.now().toString(),
      store: store.trim(),
      amount: a,
      date: date.trim(),
      image,
      source: "manual",
      createdAt: getNowIso(),
    };

    await saveAll([newR, ...receipts]);
    resetForm();
    Alert.alert("Succes", "Bon salvat");
  }

  function edit(r: SavedReceipt) {
    setStore(r.store);
    setAmount(String(r.amount));
    setDate(r.date);
    setImage(r.image);
    setEditingId(r.id);
  }

  async function del(id: string) {
    await saveAll(receipts.filter((r) => r.id !== id));
    if (editingId === id) resetForm();
  }

  async function resetAll() {
    Alert.alert("Confirmare", "Ștergi toate bonurile?", [
      { text: "Nu", style: "cancel" },
      {
        text: "Da",
        style: "destructive",
        onPress: async () => {
          await saveAll([]);
          resetForm();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.c}>
      <Text style={styles.t}>Bonuri</Text>

      <TextInput
        style={styles.i}
        placeholder="Magazin"
        placeholderTextColor="#8fa3bf"
        value={store}
        onChangeText={setStore}
      />

      <TextInput
        style={styles.i}
        placeholder="Sumă"
        placeholderTextColor="#8fa3bf"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.i}
        placeholder="Dată"
        placeholderTextColor="#8fa3bf"
        value={date}
        onChangeText={setDate}
      />

      <TouchableOpacity style={styles.b} onPress={takePhoto}>
        <Text style={styles.bt}>CAMERĂ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.b} onPress={pickImage}>
        <Text style={styles.bt}>GALERIE</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.img} />}

      <TouchableOpacity style={styles.save} onPress={saveReceipt}>
        <Text style={styles.bt}>{editingId ? "UPDATE" : "SALVEAZĂ"}</Text>
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity style={styles.cancel} onPress={resetForm}>
          <Text style={styles.bt}>ANULEAZĂ</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.reset} onPress={resetAll}>
        <Text style={styles.bt}>RESET</Text>
      </TouchableOpacity>

      {receipts.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.top}>
            {r.image ? (
              <Image source={{ uri: r.image }} style={styles.thumb} />
            ) : (
              <View style={styles.noImg}>
                <Text style={styles.noImgT}>Fără poză</Text>
              </View>
            )}

            <View style={styles.info}>
              <Text style={styles.store}>{r.store}</Text>
              <Text style={styles.amountValue}>{r.amount.toFixed(2)} EUR</Text>
              <Text style={styles.meta}>{r.date}</Text>
              <Text style={styles.meta}>Ora: {formatTime(r.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => edit(r)} style={styles.edit}>
              <Text style={styles.bt}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => del(r.id)} style={styles.del}>
              <Text style={styles.bt}>DEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: {
    flex: 1,
    backgroundColor: "#071427",
    padding: 16,
  },
  t: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "800",
  },
  i: {
    backgroundColor: "#0d1f3c",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  b: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  save: {
    backgroundColor: "#16a085",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  cancel: {
    backgroundColor: "#7f8c8d",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  reset: {
    backgroundColor: "#c0392b",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  bt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  img: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#0d1f3c",
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  top: {
    flexDirection: "row",
  },
  thumb: {
    width: 78,
    height: 78,
    borderRadius: 8,
    marginRight: 10,
  },
  noImg: {
    width: 78,
    height: 78,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#132847",
    alignItems: "center",
    justifyContent: "center",
  },
  noImgT: {
    color: "#8fa3bf",
    fontSize: 12,
  },
  info: {
    flex: 1,
  },
  store: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  amountValue: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 3,
  },
  meta: {
    color: "#8fa3bf",
    fontSize: 12,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    marginTop: 8,
  },
  edit: {
    flex: 1,
    backgroundColor: "#f5a623",
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
    alignItems: "center",
  },
  del: {
    flex: 1,
    backgroundColor: "#c0392b",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
});
