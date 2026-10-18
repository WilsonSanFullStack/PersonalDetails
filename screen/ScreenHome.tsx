import { StyleSheet } from "react-native";
import { Text, View } from "../theme";

export default function ScreenHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>hi ScreenHome</Text>
      <Text style={styles.container}>{process.env.EXPO_PUBLIC_API_messagingSenderId}</Text>
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
