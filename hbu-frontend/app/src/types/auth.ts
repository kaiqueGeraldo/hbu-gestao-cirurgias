export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface LoginResponseDTO {
  accessToken: string;
}

export interface UserPayload {
  sub: string;
  role: string;
  exp: number;
}