import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "./theme";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//pantallas
import ScreenSession from "./screen/ScreenSession";
import ScreenHome from "./screen/ScreenHome";

const Stack = createNativeStackNavigator();
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
      <Tab.Screen name="session" component={ScreenSession} />
      <Tab.Screen
        name="Home"
        component={ScreenHome}
        
      />
    </Tab.Navigator>
  );
}
// function MyStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: true }}>
//       <Stack.Screen
//         name="Home"
//         component={ScreenHome}
//         options={{ navigationBarHidden: false,  }}
//       />
//       <Stack.Screen name="session" component={ScreenSession} />
//     </Stack.Navigator>
//   );
// }

export default function App() {
  const { mode, navigationTheme } = useAppTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      {/* <MyStack /> */}
      <MyTab />
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
    </NavigationContainer>
  );
}
