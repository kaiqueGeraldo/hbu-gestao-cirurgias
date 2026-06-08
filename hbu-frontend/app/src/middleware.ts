import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/auth"];

function decodeTokenRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadString = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadString);
    
    // Verifica expiração
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const token = request.cookies.get("token")?.value;

  const role = token ? decodeTokenRole(token) : null;
  const hasValidToken = !!role;

  // 1. Redireciona para login se não estiver autenticado e tentar acessar rota privada
  if (!hasValidToken && !isPublicRoute) {
    const response = NextResponse.redirect(new URL("/auth", request.url));
    response.cookies.delete("token");
    return response;
  }

  // 2. Bloqueia acesso à página de Auth se já estiver logado (redireciona p/ dashboard principal do perfil)
  if (hasValidToken && isPublicRoute) {
    if (role === "ROLE_RECEPCAO") return NextResponse.redirect(new URL("/recepcao/dashboard", request.url));
    if (role === "ROLE_MEDICO") return NextResponse.redirect(new URL("/medico/agenda", request.url));
    if (role === "ROLE_GESTOR_CC") return NextResponse.redirect(new URL("/gestor/mapa", request.url));
    if (role === "ROLE_ADMIN") return NextResponse.redirect(new URL("/admin/usuarios", request.url));
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. RBAC (Role-Based Access Control) das rotas privadas
  if (hasValidToken && !isPublicRoute) {
    if (pathname.startsWith("/recepcao") && role !== "ROLE_RECEPCAO" && role !== "ROLE_ADMIN") {
      return NextResponse.redirect(new URL("/403", request.url)); // Acesso Negado
    }
    if (pathname.startsWith("/medico") && role !== "ROLE_MEDICO") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
    if (pathname.startsWith("/gestor") && role !== "ROLE_GESTOR_CC" && role !== "ROLE_ADMIN") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ROLE_ADMIN") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};