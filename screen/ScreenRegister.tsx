import { StyleSheet } from "react-native";
import { Text, View } from "../theme";

export default function ScreenRegister() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen Register</Text>
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
