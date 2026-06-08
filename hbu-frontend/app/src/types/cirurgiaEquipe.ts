export type PapelEquipe = 
  | "CIRURGIAO_PRINCIPAL" 
  | "CIRURGIAO_AUXILIAR" 
  | "ANESTESISTA" 
  | "INSTRUMENTADOR" 
  | "ENFERMEIRO_CIRCULANTE";

export interface MembroEquipeResponseDTO {
  idAlocacao: string;
  profissionalId: string;
  nomeProfissional: string;
  crmCoren: string;
  papel: PapelEquipe;
  isAtivo: boolean;
  alocadoEm: string;
}

export interface AlocacaoMembroRequestDTO {
  profissionalId: string;
  papel: PapelEquipe;
}

export interface SubstituicaoMembroRequestDTO {
  membroAtualId: string;
  novoProfissionalId: string;
  motivoRemocao: string;
}