const URL_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

type ApiRequestOptions = RequestInit & { isBlob?: boolean };

export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// Utilitário para pegar o cookie no Client-Side
function getClientToken(): string | null {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    if (match) return match[2];
  }
  return null;
}

export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
  const { isBlob, headers, ...fetchOptions } = options;
  const token = getClientToken();

  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers: finalHeaders,
    cache: "no-store",
  };

  try {
    const response = await fetch(`${URL_BASE}${endpoint}`, finalOptions);
    let data;

    if (isBlob) {
      data = await response.blob();
    } else {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Erro ${response.status}: ${response.statusText}`;

      if (response.status >= 500) {
        console.error("[CRITICAL_API_ERROR]", { status: response.status, endpoint, data });
      }

      // 401 - TOKEN EXPIRADO OU INVÁLIDO
      if (response.status === 401) {
        if (!endpoint.includes("/auth/login")) {
          if (typeof window !== "undefined") window.dispatchEvent(new Event("sessionExpired"));
        }
        throw new ApiError("Sessão expirada. Faça login novamente.", 401);
      }

      // 403 - ACESSO NEGADO
      if (response.status === 403) {
        throw new ApiError("Você não tem permissão para realizar esta ação no sistema.", 403);
      }

      // 400, 404, 409 (Erros de validação e regra de negócio) vão direto para o Toast
      throw new ApiError(errorMessage, response.status);
    }

    return { status: response.status, data };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError("Erro ao conectar ao servidor do hospital. Verifique sua conexão.", 500);
  }
}