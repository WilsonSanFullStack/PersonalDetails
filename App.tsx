import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//pantallas
import ScreenSession from "./screen/ScreenSession";
import ScreenHome from "./screen/ScreenHome";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MyTab() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Home"
        component={ScreenHome}
        
      />
      <Tab.Screen name="session" component={ScreenSession} />
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
  return (
    <NavigationContainer>
      {/* <MyStack /> */}
      <MyTab />
      {/* <StatusBar style="auto" /> */}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
