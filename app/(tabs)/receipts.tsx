import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Receipt = {
  id: string;
  store: string;
  amount: number;
  date: string;
  imageUri?: string;
};

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [pickedImage, setPickedImage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [storeInput, setStoreInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const totalAmount = useMemo(
    () => receipts.reduce((sum, r) => sum + r.amount, 0),
    [receipts]
  );

  const totalPoints = useMemo(() => Math.round(totalAmount), [totalAmount]);

  async function updateWallet(nextReceipts: Receipt[]) {
    const amount = nextReceipts.reduce((sum, r) => sum + r.amount, 0);
    const points = Math.round(amount);

    await AsyncStorage.setItem("walletReceiptAmount", String(amount));
    await AsyncStorage.setItem("walletReceiptPoints", String(points));
  }

  async function chooseReceiptImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permisiune", "Trebuie să permiți accesul la poze.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    setPickedImage(result.assets[0].uri);
    setStoreInput("");
    setAmountInput("");
    setDateInput("");
    setModalVisible(true);
  }

  async function saveReceipt() {
    const amount = Number(amountInput.replace(",", "."));

    if (!storeInput.trim() || !amount || amount <= 0 || !dateInput.trim()) {
      Alert.alert("Receipt", "Completează toate câmpurile.");
      return;
    }

    const newReceipt: Receipt = {
      id: Date.now().toString(),
      store: storeInput.trim(),
      amount: Number(amount.toFixed(2)),
      date: dateInput.trim(),
      imageUri: pickedImage,
    };

    const next = [newReceipt, ...receipts];
    setReceipts(next);
    await updateWallet(next);

    setPickedImage("");
    setStoreInput("");
    setAmountInput("");
    setDateInput("");
    setModalVisible(false);
  }

  async function deleteReceipt(id: string) {
    const next = receipts.filter((r) => r.id !== id);
    setReceipts(next);
    await updateWallet(next);
  }

  async function clearAll() {
    Alert.alert("Bonuri", "Ștergi toate bonurile?", [
      { text: "Nu", style: "cancel" },
      {
        text: "Da",
        style: "destructive",
        onPress: async () => {
          setReceipts([]);
          await updateWallet([]);
        },
      },
    ]);
  }

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#07111F" }}>
        <View style={{ padding: 20, paddingTop: 70, paddingBottom: 120 }}>
          <Text style={{ color: "#98A7B8", fontSize: 14 }}>ARANIUM</Text>

          <Text
            style={{
              color: "#F5F7FA",
              fontSize: 32,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Bonuri
          </Text>

          <View
            style={{
              backgroundColor: "#0D1B2A",
              borderRadius: 20,
              padding: 20,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: "#1E3A5F",
            }}
          >
            <Text style={{ color: "#98A7B8", marginBottom: 8 }}>
              Total bonuri
            </Text>
            <Text
              style={{
                color: "#F5F7FA",
                fontSize: 24,
                fontWeight: "800",
                marginBottom: 12,
              }}
            >
              {totalAmount.toFixed(2)} EUR
            </Text>

            <Text style={{ color: "#98A7B8", marginBottom: 8 }}>
              Total puncte din bonuri
            </Text>
            <Text
              style={{
                color: "#FF8A1F",
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {totalPoints} puncte
            </Text>
          </View>

          <Pressable
            onPress={chooseReceiptImage}
            style={{
              marginBottom: 12,
              backgroundColor: "#FF8A1F",
              padding: 16,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "800",
                fontSize: 18,
                color: "#07111F",
              }}
            >
              Alege poză bon
            </Text>
          </Pressable>

          <Pressable
            onPress={clearAll}
            style={{
              marginBottom: 14,
              backgroundColor: "#1E3A5F",
              padding: 14,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "700",
                fontSize: 16,
                color: "#F5F7FA",
              }}
            >
              Clear All
            </Text>
          </Pressable>

          {receipts.map((r) => (
            <View
              key={r.id}
              style={{
                backgroundColor: "#0D1B2A",
                borderRadius: 20,
                padding: 20,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: "#1E3A5F",
              }}
            >
              {r.imageUri ? (
                <Image
                  source={{ uri: r.imageUri }}
                  style={{
                    width: "100%",
                    height: 220,
                    borderRadius: 14,
                    marginBottom: 12,
                  }}
                  resizeMode="cover"
                />
              ) : null}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: "#F5F7FA",
                    fontSize: 22,
                    fontWeight: "800",
                    flex: 1,
                  }}
                >
                  {r.store}
                </Text>

                <Pressable
                  onPress={() => deleteReceipt(r.id)}
                  style={{
                    backgroundColor: "#1E3A5F",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FF8A1F",
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    X
                  </Text>
                </Pressable>
              </View>

              <Text
                style={{
                  color: "#F5F7FA",
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 6,
                }}
              >
                {r.amount.toFixed(2)} EUR
              </Text>

              <Text style={{ color: "#98A7B8" }}>
                Data: {r.date}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "#000000aa",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#0D1B2A",
              padding: 20,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: "#F5F7FA",
                fontSize: 22,
                fontWeight: "800",
                marginBottom: 12,
              }}
            >
              Receipt
            </Text>

            {pickedImage ? (
              <Image
                source={{ uri: pickedImage }}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />
            ) : null}

            <TextInput
              placeholder="Magazin"
              placeholderTextColor="#aaa"
              value={storeInput}
              onChangeText={setStoreInput}
              style={{
                color: "#fff",
                backgroundColor: "#07111F",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
              }}
            />

            <TextInput
              placeholder="Sumă"
              placeholderTextColor="#aaa"
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="numeric"
              style={{
                color: "#fff",
                backgroundColor: "#07111F",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
              }}
            />

            <TextInput
              placeholder="Data"
              placeholderTextColor="#aaa"
              value={dateInput}
              onChangeText={setDateInput}
              style={{
                color: "#fff",
                backgroundColor: "#07111F",
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
              }}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#1E3A5F",
                  padding: 14,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={saveReceipt}
                style={{
                  flex: 1,
                  backgroundColor: "#FF8A1F",
                  padding: 14,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "800",
                    color: "#07111F",
                  }}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
