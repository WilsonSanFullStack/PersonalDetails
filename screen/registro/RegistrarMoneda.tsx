import React from 'react'
import {
  Text,
  View,
  Pressable,
  useAppTheme,
  getPressableTextColor,
} from "../../theme";

export default function RegistrarMoneda() {
   const { colors } = useAppTheme();

  return (
    <View variant="default" style={{ flex: 1, padding: 16 }}>
      <Text variant="title">Registrar Moneda</Text>
      <Text variant="bodyMuted" style={{ marginTop: 4 }}>
        Esta es la descripción de la pantalla.
      </Text>

      <View variant="card" style={{ marginTop: 16 }}>
        <Text variant="heading">Datos personales</Text>

        <Text variant="label">Correo electrónico</Text>
        <View variant="bordered" style={{ padding: 12 }}>
          <Text variant="input">usuario@correo.com</Text>
        </View>

        <Text variant="error">El correo no es válido</Text>
      </View>

      <Pressable variant="primary" style={{ marginTop: 16 }} onPress={() => {}}>
        <Text style={{ color: getPressableTextColor("primary", colors) }}>
          Guardar
        </Text>
      </Pressable>

      <Pressable variant="ghost" style={{ marginTop: 8 }} onPress={() => {}}>
        <Text style={{ color: getPressableTextColor("ghost", colors) }}>
          Cancelar
        </Text>
      </Pressable>
      <Pressable variant="danger" style={{ marginTop: 8 }} onPress={() => {}}>
        <Text style={{ color: getPressableTextColor("danger", colors) }}>
          Eliminar
        </Text>
      </Pressable>
      <Pressable variant="secondary" style={{ marginTop: 8 }} onPress={() => {}}>
        <Text style={{ color: getPressableTextColor("secondary", colors) }}>
          Eliminar
        </Text>
      </Pressable>
    </View>
  );
}
