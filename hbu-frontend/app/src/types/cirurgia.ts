export interface AgendamentoCirurgiaDTO {
  pacienteId: string;
  salaId: string;
  prioridade: "ELETIVA" | "URGENCIA" | "EMERGENCIA";
  inicioPrevisto: string; 
  fimPrevisto: string;
}

export interface CirurgiaResponseDTO {
  id: string;
  pacienteNome?: string;
  paciente?: { nome: string; cpf: string };
  salaNomeNumero?: string;
  sala?: { nomeNumero: string; tipoSala: string };
  prioridade: "ELETIVA" | "URGENCIA" | "EMERGENCIA";
  statusAtual: "FILA_ESPERA" | "AGENDADO" | "EM_PREPARO" | "EM_ANDAMENTO" | "EM_LIMPEZA" | "FINALIZADO" | "CANCELADO";
  inicioPrevisto: string;
  fimPrevisto: string;
}
