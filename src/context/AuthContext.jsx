import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("alpha_user");
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  const login = async (documento, password) => {
    const form = new URLSearchParams();
    form.append("username", documento);
    form.append("password", password);
    const { data } = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const u = {
      id_usuario: data.id_usuario,
      nombres: data.nombres,
      rol: data.rol,
    };
    localStorage.setItem("alpha_token", data.access_token);
    localStorage.setItem("alpha_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("alpha_token");
    localStorage.removeItem("alpha_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
