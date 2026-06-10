import { apiRequest } from "@/app/src/services/api";
import { AgendamentoCirurgiaDTO, CancelamentoDTO } from "@/app/src/types/cirurgia";

export async function agendarCirurgia(data: AgendamentoCirurgiaDTO) {
  return apiRequest("/cirurgias/agendar", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCirurgias() {
  return apiRequest("/cirurgias", { method: "GET" });
}

export async function getCirurgiaById(id: string) {
  return apiRequest(`/cirurgias/${id}`, { method: "GET" });
}

export const getMinhasCirurgias = async () => {
    return await apiRequest('/cirurgias/minhas', { method: 'GET'});
};

export async function atualizarStatusCirurgia(id: string, novoStatus: string, usuarioResponsavel: string) {
  return apiRequest(`/cirurgias/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ novoStatus, usuarioResponsavel }),
  });
}

export async function finalizarCirurgia(id: string, inicioReal: string, fimReal: string) {
  return apiRequest(`/cirurgias/${id}/finalizar`, {
    method: "POST",
    body: JSON.stringify({ inicioReal, fimReal }),
  });
}

export async function reagendarCirurgia(id: string | number, payload: { salaId: string; inicioPrevisto: string; fimPrevisto: string }) {
  return apiRequest(`/cirurgias/${id}/reagendar`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export const cancelarCirurgia = async (id: string, dados: CancelamentoDTO) => {
  const response = await apiRequest(`/cirurgias/${id}/cancelar`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
  return response.data;
};