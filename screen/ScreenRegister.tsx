// import { StyleSheet } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { StatusBar } from "expo-status-bar";

// import {
//   Text,
//   View,
//   Pressable,
//   useAppTheme,
//   getPressableTextColor,
// } from "../theme";
// //pantallas
// import RegistrarPagina from "./registro/RegistrarPagina";
// import RegistrarMoneda from "./registro/RegistrarMoneda";
// import ScreenRegisterMenu from "./registro/ScreenRegisterMenu";
// import RegisterConst from "./registro/RegisterConst";

// export type RegisterStackParamList = {
//   Menu: undefined;
//   Pagina: undefined;
//   Moneda: undefined;
//   Constantes: undefined;
//   // ... resto
// };

// const Stack = createNativeStackNavigator<RegisterStackParamList>();

// function MyStack() {
//   return (
//     <Stack.Navigator
//       initialRouteName="Menu"
//       screenOptions={{ headerShown: true }}
//     >
//       <Stack.Screen
//         name="Menu"
//         component={ScreenRegisterMenu}
//         options={{ title: "Registros", headerBackVisible: false }}
//       />
//       <Stack.Screen
//         name="Pagina"
//         component={RegistrarPagina}
//         options={{ title: "Registrar página" }}
//       />
//       <Stack.Screen
//         name="Moneda"
//         component={RegistrarMoneda}
//         options={{ title: "Registrar moneda" }}
//       />
//       <Stack.Screen
//         name="Constantes"
//         component={RegisterConst}
//         options={{ title: "Registrar constantes" }}
//       />
      
//     </Stack.Navigator>
//   );
// }

// export default function ScreenRegister() {
//   return <MyStack />;
// }
