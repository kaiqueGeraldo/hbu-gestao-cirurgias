import { apiRequest } from "@/app/src/services/api";

export async function getProfissionais() {
  return apiRequest("/profissionais", { method: "GET" });
}

export async function createProfissional(data: any) {
  return apiRequest("/profissionais", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProfissional(id: string, data: any) {
  return apiRequest(`/profissionais/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function inativarProfissional(id: string) {
  return apiRequest(`/profissionais/${id}`, { method: "DELETE" });
}