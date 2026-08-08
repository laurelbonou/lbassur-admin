import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/session";

/**
 * Depuis Next 16, le middleware s'appelle Proxy (même fonctionnement).
 *
 * Contrôle **optimiste** uniquement, conformément à la documentation : il
 * s'exécute sur chaque requête, y compris les préchargements, et ne doit donc
 * pas interroger la base. L'autorisation qui fait foi est vérifiée côté serveur
 * dans le layout, via `requireAdminSession()`.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth");
  const isStaticFile = request.nextUrl.pathname.match(/\.(.*)$/);

  if (isStaticFile || isApiAuth) {
    return NextResponse.next();
  }

  // La signature est vérifiée, pas seulement la présence du cookie : un cookie
  // posé à la main depuis le navigateur ne passe plus.
  const authenticated = await isValidSessionToken(token);

  if (!authenticated && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Une session expirée ou falsifiée laisse un cookie inutile : on le retire
    // pour éviter une boucle de redirection.
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (authenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
