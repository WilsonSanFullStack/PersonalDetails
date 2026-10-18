import { StyleSheet } from "react-native";
import { Text, View } from "../../theme";

export default function RegistrarPagina() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Pagina</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});
