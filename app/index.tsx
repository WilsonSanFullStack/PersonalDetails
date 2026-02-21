import ThemePressable from "@/components/ui/ThemePressable";
import ThemeSafeAreaView from "@/components/ui/ThemeSafeAreaView";
import ThemeText from "@/components/ui/ThemeText";
import ThemeView from "@/components/ui/ThemeView";
import { router } from "expo-router";

import React from "react";

const index = () => {
  return (
    <ThemeSafeAreaView className="bg-background">
      <ThemeText variant="paragraph" className="text-justify">
        Esta aplicacion esta en fase de desarrollo la aplicacion esta orientada
        a aquellas personas que trabajan como modelo webcam y desean tener sus
        cuentas a la mano y saber cuanto tienen hasta el momento.
      </ThemeText>

      <ThemeText variant="paragraph" className="text-justify">
        Esta aplicacion solo le dara unos resultados aproximados a sus ganancias
        y no son totalmente precisos ya que la responsabilidad radica en que
        usted como usuario inserte bien los valores reales es por esto que
        app-agenda no se hace responsable de las diferencias de valores entre
        esta app y las de su estudio
      </ThemeText>

      <ThemeView
        variant="default"
        className="bg-background justify-center items-center flex-row">
        <ThemePressable
          variant="primary"
          className="m-2 w-48"
          onPress={() => router.push("/(auth)/loggin")}>
          <ThemeText variant="pressable">Iniciar Sesion</ThemeText>
        </ThemePressable>

        <ThemePressable
          variant="primary"
          className="m-2 w-48"
          onPress={() => router.push("/(auth)/register")}>
          <ThemeText variant="pressable">Registrarse</ThemeText>
        </ThemePressable>
      </ThemeView>
    </ThemeSafeAreaView>
  );
};

export default index;
