import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function QuincenaResumen() {
  const { quincenaId } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Resumen de la Quincena: {quincenaId}</Text>
    </View>
  );
}
