import { AlocacaoMembroRequestDTO, SubstituicaoMembroRequestDTO } from "../types/cirurgiaEquipe";
import { apiRequest } from "./api";

export async function getEquipeCirurgia(cirurgiaId: string | number) {
  return apiRequest(`/cirurgias/${cirurgiaId}/equipe`, { method: "GET" });
}

export async function alocarMembro(cirurgiaId: string | number, data: AlocacaoMembroRequestDTO) {
  return apiRequest(`/cirurgias/${cirurgiaId}/equipe`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function substituirMembro(alocacaoId: string, data: SubstituicaoMembroRequestDTO) {
  return apiRequest(`/equipe-cirurgica/${alocacaoId}/substituir`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}