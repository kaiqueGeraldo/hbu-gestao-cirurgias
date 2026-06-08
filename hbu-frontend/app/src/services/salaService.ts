import { apiRequest } from "@/app/src/services/api";

export async function getSalas() {
  return apiRequest("/salas", { method: "GET" });
}

export async function createSala(data: any) {
  return apiRequest("/salas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSala(id: number, data: any) {
  return apiRequest(`/salas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function inativarSala(id: number) {
  return apiRequest(`/salas/${id}`, { method: "DELETE" });
}