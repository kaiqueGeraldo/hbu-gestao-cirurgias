export interface PacienteResponseDTO {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  ativo: boolean;
}

export interface PacienteRequestDTO {
  nome: string;
  cpf: string;
  dataNascimento: string;
}

export interface PacienteUpdateDTO {
  nome?: string;
}