export interface UsuarioResponseDTO {
  id: string;
  email: string;
  role: string;
  profissionalId?: string | number | null;
  nomeProfissional?: string | null;
  ativo: boolean;
}

export interface UsuarioRequestDTO {
  email: string;
  senha?: string;
  role: string;
  profissionalId?: string | number | null;
}