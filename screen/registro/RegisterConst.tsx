import React from 'react'
import { Text, View } from '../../theme'

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RegisterStackParamList } from "../ScreenRegister";

type Props = NativeStackScreenProps<RegisterStackParamList, "Constantes">;

export default function RegisterConst() {
  return (
    <View variant="center">
      <Text>hola desde las constantes</Text>
    </View>
  )
}
