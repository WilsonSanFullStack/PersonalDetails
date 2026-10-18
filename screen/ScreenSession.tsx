import { StyleSheet } from "react-native";
import { Text, View } from "../theme";

const ScreenSession = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ScreenSession</Text>
    </View>
  );
};

export default ScreenSession;

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
