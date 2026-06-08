import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootGatewayPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Se não tem token, joga direto para o login
  if (!token) {
    redirect("/auth");
  }

  let routeToRedirect = "/auth";

  // Decodifica o token no lado do servidor para roteamento tático
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      // Usa Buffer para decodificar Base64 no servidor Node.js
      const payloadString = Buffer.from(parts[1], 'base64').toString('utf-8');
      const payload = JSON.parse(payloadString);
      const role = payload.role;

      // Define a rota com base no RBAC
      if (role === "ROLE_RECEPCAO") routeToRedirect = "/recepcao/dashboard";
      else if (role === "ROLE_MEDICO") routeToRedirect = "/medico/agenda";
      else if (role === "ROLE_GESTOR_CC") routeToRedirect = "/gestor/mapa";
      else if (role === "ROLE_ADMIN") routeToRedirect = "/admin/usuarios";
    }
  } catch (error) {
    console.error("Erro ao decodificar token no Gateway:", error);
  }

  redirect(routeToRedirect);
}