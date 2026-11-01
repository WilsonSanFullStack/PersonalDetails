import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// 1. Configurar Google (una vez, al inicio)
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

// 2. Config de Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_apiKey,
  authDomain: process.env.EXPO_PUBLIC_API_authDomain,
  projectId: process.env.EXPO_PUBLIC_API_projectId,
  storageBucket: process.env.EXPO_PUBLIC_API_storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_API_messagingSenderId,
  appId: process.env.EXPO_PUBLIC_API_appId,
};

// 3. Inicializar Firebase
export const db = initializeApp(firebaseConfig);

export const auth = initializeAuth(db, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// 4. Función principal de login con Google
export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    // En versiones nuevas el idToken está en userInfo.data?.idToken
    // En versiones antiguas estaba en userInfo.idToken. Cubrimos ambas:
    const idToken =
      (userInfo as any)?.data?.idToken ?? (userInfo as any)?.idToken;

    if (!idToken) {
      throw new Error("No se obtuvo idToken de Google.");
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);

    return userCredential.user;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
}