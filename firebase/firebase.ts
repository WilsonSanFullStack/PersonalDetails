import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_apiKey,
  authDomain: process.env.EXPO_PUBLIC_API_authDomain,
  projectId: process.env.EXPO_PUBLIC_API_projectId,
  storageBucket: process.env.EXPO_PUBLIC_API_storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_API_messagingSenderId,
  appId: process.env.EXPO_PUBLIC_API_appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const AUTH_BYPASS = process.env.EXPO_PUBLIC_AUTH_BYPASS === "true";

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/already-initialized"
    ) {
      return getAuth(app);
    }
    throw error;
  }
})();

let googleSigninConfigured = false;

export async function signInWithGoogle() {
  if (AUTH_BYPASS) {
    throw new Error("Google Sign-In está desactivado durante el bypass de desarrollo.");
  }

  const { GoogleSignin } = await import(
    "@react-native-google-signin/google-signin"
  );
  if (!googleSigninConfigured) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
    googleSigninConfigured = true;
  }

  await GoogleSignin.hasPlayServices();

  const response = await GoogleSignin.signIn();
  if (response.type === "cancelled") {
    return null;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("No se obtuvo idToken de Google.");
  }

  const googleCredential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, googleCredential);
  return userCredential.user;
}