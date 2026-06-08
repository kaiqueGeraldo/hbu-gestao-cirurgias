import { LoginRequestDTO } from "@/app/src/types/auth";
import { apiRequest } from "./api";

export async function loginApi(credentials: LoginRequestDTO) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getPerfilUsuario() {
  return apiRequest("/usuarios/me", { method: "GET" });
}
