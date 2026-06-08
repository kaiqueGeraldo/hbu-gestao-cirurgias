import { apiRequest } from "@/app/src/services/api";
import { UsuarioRequestDTO } from "@/app/src/types/usuario";

export async function getUsuarios() {
  return apiRequest("/usuarios", { method: "GET" });
}

export async function createUsuario(data: UsuarioRequestDTO) {
  return apiRequest("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUsuario(id: string, data: UsuarioRequestDTO) {
  return apiRequest(`/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function toggleUsuarioStatus(id: string) {
  return apiRequest(`/usuarios/${id}/status`, { method: "PATCH" }); 
}