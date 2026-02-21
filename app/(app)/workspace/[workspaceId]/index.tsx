import { workspaces } from "@/data/workspaces";
import React from "react";
import { Text, View } from "react-native";

export default function Dashboard() {
  // Usar el primer workspace mock para demo
  const workspace = workspaces[0];
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Dashboard del Workspace
      </Text>
      <Text style={{ marginTop: 16 }}>Nombre: {workspace.name}</Text>
      <Text>Owner: {workspace.ownerId}</Text>
      <Text>Miembros: {workspace.members.join(", ")}</Text>
      <Text>Arancel USD: {workspace.aranceles.usd}</Text>
      <Text>Creado: {workspace.createdAt.toLocaleString()}</Text>
    </View>
  );
}
