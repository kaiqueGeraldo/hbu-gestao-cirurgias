import { apiRequest } from "./api";

export async function getTodosProcedimentos() {
  return apiRequest("/procedimentos/all", { method: "GET" });
}

export async function getProcedimentosDaCirurgia(cirurgiaId: string) {
  return apiRequest(`/cirurgias/${cirurgiaId}/procedimentos`, { method: "GET" });
}

export async function sincronizarProcedimentos(cirurgiaId: string, procedimentos: { procedimentoId: string, isPrincipal: boolean }[]) {
  return apiRequest(`/cirurgias/${cirurgiaId}/procedimentos`, {
    method: "PUT",
    body: JSON.stringify({ procedimentos }),
  });
}

export async function createProcedimento(data: any) {
  return apiRequest("/procedimentos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProcedimento(id: string, data: any) {
  return apiRequest(`/procedimentos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function inativarProcedimento(id: string) {
  return apiRequest(`/procedimentos/${id}`, { method: "DELETE" });
}