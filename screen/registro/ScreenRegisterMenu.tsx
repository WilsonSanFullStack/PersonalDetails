import { ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  View,
  Text,
  Pressable,
  useAppTheme,
  getPressableTextColor,
} from "../../theme";
import type { RegisterStackParamList } from "../ScreenRegister";

type Props = NativeStackScreenProps<RegisterStackParamList, "Menu">;

const ITEMS: { key: keyof RegisterStackParamList; label: string }[] = [
  { key: "Pagina", label: "Registrar página" },
  { key: "Moneda", label: "Registrar moneda" },
  // ... los 8
];

export default function ScreenRegisterMenu({ navigation }: Props) {

  const { colors } = useAppTheme();

  return (
    <ScrollView 
    contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text variant="title">¿Qué quieres registrar?</Text>
      <Text variant="bodyMuted" style={{ marginBottom: 8 }}>
        Selecciona un formulario para comenzar.
      </Text>

      {ITEMS.map((item) => (
        <Pressable
          key={item.key}
          variant="card"
          onPress={() => navigation.navigate(item.key as any)}
        >
          <View variant="row" style={{ justifyContent: "space-between" }}>
            <Text variant="heading">{item.label}</Text>
            <Text style={{ color: colors.accent, fontSize: 18 }}>›</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}