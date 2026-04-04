import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, Pressable, Modal, TextInput } from "react-native";

export default function SavingsScreen() {
  const [savedAmount, setSavedAmount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [savedAmount]);

  async function loadData() {
    try {
      const value = await AsyncStorage.getItem("savedAmount");
      if (value !== null) {
        setSavedAmount(Number(value));
      } else {
        setSavedAmount(2340);
      }
    } catch (e) {
      setSavedAmount(2340);
    }
  }

  async function saveData() {
    try {
      await AsyncStorage.setItem("savedAmount", savedAmount.toString());
    } catch (e) {}
  }

  function handleAddMoney() {
    const cleanValue = inputValue.replace(",", ".");
    const amount = Number(cleanValue);

    if (!amount || amount <= 0) {
      setInputValue("");
      setModalVisible(false);
      return;
    }

    setSavedAmount((prev) => Number((prev + amount).toFixed(2)));
    setInputValue("");
    setModalVisible(false);
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#07111F", padding: 20, paddingTop: 70 }}>
        <Text style={{ color: "#F5F7FA", fontSize: 30, fontWeight: "800", marginBottom: 20 }}>
          Savings
        </Text>

        <View style={{ backgroundColor: "#0D1B2A", borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <Text style={{ color: "#98A7B8" }}>Economii totale</Text>
          <Text style={{ color: "#F5F7FA", fontSize: 28, marginTop: 8 }}>
            {savedAmount.toFixed(2)} EUR
          </Text>
        </View>

        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: "#FF8A1F",
            padding: 16,
            borderRadius: 16,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "800", color: "#07111F", fontSize: 18 }}>
            Add Money
          </Text>
        </Pressable>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#0D1B2A",
              borderRadius: 20,
              padding: 20,
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
              Add Money
            </Text>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholder="Ex: 100"
              placeholderTextColor="#6E7C8C"
              style={{
                backgroundColor: "#07111F",
                color: "#F5F7FA",
                borderWidth: 1,
                borderColor: "#1E3A5F",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                marginBottom: 16,
                fontSize: 18,
              }}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setInputValue("");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#1E3A5F",
                  padding: 14,
                  borderRadius: 14,
                }}
              >
                <Text style={{ textAlign: "center", color: "#F5F7FA", fontWeight: "700" }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleAddMoney}
                style={{
                  flex: 1,
                  backgroundColor: "#FF8A1F",
                  padding: 14,
                  borderRadius: 14,
                }}
              >
                <Text style={{ textAlign: "center", color: "#07111F", fontWeight: "800" }}>
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
