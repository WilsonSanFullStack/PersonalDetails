import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { signInWithGoogle } from "../firebase/firebase";
import {
  Pressable,
  Text,
  View,
  getPressableTextColor,
  useAppTheme,
} from "../theme";

function getSignInErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    switch (error.code) {
      case "auth/user-disabled":
        return "Esta cuenta está deshabilitada.";
      case "auth/too-many-requests":
        return "Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.";
      case "auth/network-request-failed":
        return "No se pudo conectar. Revisa tu conexión a internet.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

const ScreenSession = () => {
  const { colors } = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignIn() {
    setErrorMessage("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorMessage(getSignInErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.heading}>
            <Text variant="title">Bienvenido</Text>
            <Text variant="bodyMuted">
              Inicia sesión con tu cuenta de Google para continuar.
            </Text>
          </View>

          <View style={styles.form}>
            {errorMessage ? (
              <View accessibilityRole="alert" variant="error">
                <Text variant="error">{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={() => void handleSignIn()}
              style={styles.button}
              variant="secondary"
            >
              {isLoading ? (
                <ActivityIndicator
                  color={getPressableTextColor("secondary", colors)}
                />
              ) : (
                <Text
                  style={{ color: getPressableTextColor("secondary", colors) }}
                >
                  Continuar con Google
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 24,
  },
  heading: {
    gap: 8,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  button: {
    minHeight: 48,
  },
});

export default ScreenSession;
