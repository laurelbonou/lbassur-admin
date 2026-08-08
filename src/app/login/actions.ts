"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
} from "@/lib/session";

/**
 * Comparaison à temps constant du mot de passe. Sans elle, la durée de réponse
 * varie selon le nombre de caractères corrects et laisse deviner le secret.
 */
function matches(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Aucune valeur de repli. L'ancien code retombait sur « admin123 » : si la
  // variable n'était pas posée sur l'hébergeur, c'était le mot de passe du
  // back-office.
  if (!adminPassword) {
    return { success: false, error: "Authentification non configurée sur le serveur." };
  }

  if (!password || !matches(password, adminPassword)) {
    return { success: false, error: "Mot de passe incorrect" };
  }

  const token = await createSessionToken();
  if (!token) {
    return {
      success: false,
      error: "Authentification non configurée sur le serveur.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Empêche le cookie d'accompagner une requête déclenchée depuis un autre
    // site, donc les actions exécutées à l'insu de l'administrateur.
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
