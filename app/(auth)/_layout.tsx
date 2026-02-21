import ThemeSafeAreaView from "@/components/ui/ThemeSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import { Slot, useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function AuthLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/(app)/workspace/ws1");
    }
  }, [user]);

  return (
    <ThemeSafeAreaView>
      <Slot />
    </ThemeSafeAreaView>
  );
}
