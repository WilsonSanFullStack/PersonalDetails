import { users } from "@/data/users";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Buscar usuario en el mock
    const found = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!found) throw new Error("Credenciales inválidas");
    setUser({ id: found.id, email: found.email });
  };

  const register = async (email: string, password: string) => {
    // Simulación de registro (solo agrega si no existe)
    const exists = users.some((u) => u.email === email);
    if (exists) throw new Error("El usuario ya existe");
    const newUser = {
      id: `user${users.length + 1}`,
      email,
      password,
      name: email,
    };
    users.push(newUser);
    setUser({ id: newUser.id, email: newUser.email });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
