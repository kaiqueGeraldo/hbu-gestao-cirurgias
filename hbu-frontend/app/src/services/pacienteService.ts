import { PacienteRequestDTO, PacienteUpdateDTO } from "@/app/src/types/paciente";
import { apiRequest } from "./api";

export async function getPacientes() {
  return apiRequest("/pacientes", { method: "GET" });
}

export async function createPaciente(data: PacienteRequestDTO) {
  return apiRequest("/pacientes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePaciente(id: number, data: PacienteUpdateDTO) {
  return apiRequest(`/pacientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePaciente(id: number) {
  return apiRequest(`/pacientes/${id}`, { method: "DELETE" });
}