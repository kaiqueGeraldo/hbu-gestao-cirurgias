"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { loginApi } from "@/app/src/services/authService";
import { LoginRequestDTO, UserPayload } from "@/app/src/types/auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  user: UserPayload | null;
  isLoading: boolean;
  login: (credentials: LoginRequestDTO) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilitário para decodificar JWT sem bibliotecas externas pesadas
function decodeJwt(token: string): UserPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser(payload);
      } else {
        logout();
      }
    }
  }, []);

  const routeByUserRole = (role: string) => {
    switch (role) {
      case "ROLE_RECEPCAO":
        router.push("/recepcao/dashboard");
        break;
      case "ROLE_MEDICO":
        router.push("/medico/agenda");
        break;
      case "ROLE_GESTOR_CC":
        router.push("/gestor/mapa");
        break;
      case "ROLE_ADMIN":
        router.push("/admin/usuarios");
        break;
      default:
        router.push("/");
    }
  };

  const login = async (credentials: LoginRequestDTO) => {
    setIsLoading(true);
    try {
      const response = await loginApi(credentials);
      const token = response.data.accessToken;

      // Salva o JWT no cookie. max-age=86400 (24h). SameSite=Strict para segurança
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;

      const payload = decodeJwt(token);
      if (payload) {
        setUser(payload);
        console.log("ROLE USER:", payload.role);
        routeByUserRole(payload.role);
      }
    } catch (error) {
      // Repassa o erro para a tela (AuthScreen) exibir o alerta
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    // Apaga o cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setUser(null);
    router.push("/auth");
  }, [router]);

  // Escuta o evento global do `api.ts` caso o token expire durante o uso (Erro 401)
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      addToast("Sua sessão expirou. Por favor, faça login novamente.", "error");
    };

    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => window.removeEventListener("sessionExpired", handleSessionExpired);
  }, [logout]);

  const contextValue = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading, login, logout]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  return context;
};