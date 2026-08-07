/**
 * Source unique pour l'affichage des sinistres côté administration.
 *
 * Doit rester aligné sur les enums Prisma `ClaimStatus`, `ClaimType` et
 * `ClaimAttachmentKind`. C'est la duplication de ces chaînes dans plusieurs
 * composants qui avait laissé passer un statut « INVESTIGATING » inexistant.
 */

export const CLAIM_STATUS = {
  PENDING: {
    label: "En Attente",
    action: "Mettre en attente",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  PROCESSING: {
    label: "En Cours",
    action: "Traiter (En cours)",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  RESOLVED: {
    label: "Résolu",
    action: "Marquer Résolu",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejeté",
    action: "Rejeter",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
} as const;

export type ClaimStatusKey = keyof typeof CLAIM_STATUS;

export const UNKNOWN_STATUS_CLASS = "bg-gray-500/10 text-gray-400 border-gray-500/20";

export const CLAIM_TYPE_LABELS: Record<string, string> = {
  COLLISION: "Collision / accident",
  VOL: "Vol",
  INCENDIE: "Incendie",
  BRIS_DE_GLACE: "Bris de glace",
  DEGAT_DES_EAUX: "Dégât des eaux",
  CATASTROPHE_NATURELLE: "Catastrophe naturelle",
  AUTRE: "Autre",
};

export function claimStatusOf(status: string) {
  return CLAIM_STATUS[status as ClaimStatusKey];
}

/**
 * Le backend renvoie une URL Cloudinary signée et expirante, régénérée à chaque
 * lecture — on l'utilise telle quelle.
 *
 * Les pièces d'avant la bascule vers Cloudinary portent encore un chemin relatif
 * `/uploads/…` : celles-là passent par le proxy, qui relaie le flux binaire avec
 * la clé d'API côté serveur.
 */
export function attachmentUrl(url: string) {
  return url.startsWith("/uploads") ? `/api/proxy${url}` : url;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
