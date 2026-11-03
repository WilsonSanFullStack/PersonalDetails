import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "./theme";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { AUTH_BYPASS, auth } from "./firebase/firebase";

//pantallas
import ScreenSession from "./screen/ScreenSession";
import ScreenHome from "./screen/ScreenHome";
import ScreenRegister from './screen/ScreenRegister';

const Tab = createBottomTabNavigator();

function MyTab() {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ScreenHome}
        
      />
      <Tab.Screen name="registro" component={ScreenRegister} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { mode, navigationTheme, colors } = useAppTheme();
  const [isAuthResolved, setIsAuthResolved] = React.useState(AUTH_BYPASS);
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  React.useEffect(() => {
    if (AUTH_BYPASS) {
      return;
    }

    return onAuthStateChanged(
      auth,
      (user) => {
        setIsSignedIn(user !== null);
        setIsAuthResolved(true);
      },
      (error) => {
        console.error("Error al verificar la sesión:", error);
        setIsSignedIn(false);
        setIsAuthResolved(true);
      },
    );
  }, []);

  return (
    <>
      {isAuthResolved ? (
        <NavigationContainer theme={navigationTheme}>
          {AUTH_BYPASS || isSignedIn ? <MyTab /> : <ScreenSession />}
        </NavigationContainer>
      ) : (
        <ActivityIndicator
          style={{ flex: 1, backgroundColor: colors.background }}
          color={colors.accent}
        />
      )}
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
    </>
  );
}
