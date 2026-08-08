"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft,
  ShieldAlert,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Camera,
  Mic,
  Paperclip,
  AlertTriangle,
  Car,
  Download,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import {
  CLAIM_STATUS,
  CLAIM_TYPE_LABELS,
  UNKNOWN_STATUS_CLASS,
  attachmentUrl,
  claimStatusOf,
  formatFileSize,
} from "@/lib/claims";

export default function ClaimDetailsPage() {
  const params = useParams();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!id) return;

    const fetchClaim = async () => {
      try {
        const data = await api.getClaim(id);
        setClaim(data);
        setNote(data.adminNote ?? "");
      } catch (err) {
        console.error(err);
        setError("Impossible de charger ce sinistre.");
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]);

  const save = async (status: string, adminNote?: string) => {
    if (!id) return;
    setUpdating(true);
    setError("");
    setNoteSaved(false);
    try {
      const updated = await api.updateClaimStatus(id, status, adminNote);
      setClaim(updated);
      setNote(updated.adminNote ?? "");
      if (adminNote !== undefined) setNoteSaved(true);
    } catch (err) {
      console.error(err);
      setError("L'enregistrement a échoué. Le sinistre n'a pas été modifié.");
    } finally {
      setUpdating(false);
    }
  };

  // Le statut ne change pas quand on enregistre une note : on renvoie l'actuel.
  const handleUpdateStatus = (status: string) => save(status);
  const handleSaveNote = () => save(claim.status, note);

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    setError("");
    try {
      const { url } = await api.generateClaimReport(id);
      // Ouvert dans un onglet : le gestionnaire enchaîne souvent sur l'envoi
      // du dossier et ne veut pas quitter la fiche.
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      setError("La génération du dossier a échoué.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500 animate-pulse">Chargement du sinistre...</div>
    );
  }

  if (!claim) {
    return (
      <div className="p-8">
        <BackLink />
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error || "Sinistre introuvable."}
        </div>
      </div>
    );
  }

  const status = claimStatusOf(claim.status);
  const attachments: any[] = claim.attachments ?? [];
  const photos = attachments.filter((file) => file.kind === "PHOTO");
  const audios = attachments.filter((file) => file.kind === "AUDIO");
  const documents = attachments.filter((file) => file.kind === "DOCUMENT");

  const hasThirdParty = Boolean(
    claim.thirdPartyName || claim.thirdPartyPlate || claim.thirdPartyInsurer || claim.thirdPartyPolicy,
  );

  return (
    <div className="p-8 max-w-5xl">
      <BackLink />

      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            {CLAIM_TYPE_LABELS[claim.claimType] ?? "Sinistre"}
          </h1>
          <p className="text-gray-400 text-sm">
            Déclaré le {format(new Date(claim.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            {" · "}
            <span className="font-mono text-white">{claim.reference}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            title="Génère le dossier complet, photos incluses, à transmettre à la compagnie"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
          >
            <Download size={14} />
            {exporting ? "Génération…" : "Dossier PDF"}
          </button>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              status?.className ?? UNKNOWN_STATUS_CLASS
            }`}
          >
            {status?.label ?? claim.status}
          </span>
          <select
            value={claim.status}
            disabled={updating}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="bg-black/50 border border-white/10 text-xs text-white p-2 rounded focus:outline-none focus:border-white/30 disabled:opacity-50"
          >
            {Object.entries(CLAIM_STATUS).map(([value, { action }]) => (
              <option key={value} value={value}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Circonstances" icon={<FileText size={16} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Field
                icon={<Calendar size={14} />}
                label="Date du sinistre"
                value={format(new Date(claim.incidentDate), "dd MMMM yyyy", { locale: fr })}
              />
              <Field icon={<Clock size={14} />} label="Heure" value={claim.incidentTime} />
              <Field icon={<MapPin size={14} />} label="Commune" value={claim.locationCity} />
              <Field icon={<MapPin size={14} />} label="Lieu précis" value={claim.locationDetails} />
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                Récit du client
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                {claim.description}
              </p>
            </div>
          </Card>

          <Card title="Éléments déclarés" icon={<AlertTriangle size={16} />}>
            <div className="space-y-2">
              <Flag active={claim.hasInjuries} label="Blessés" danger />
              <Flag active={claim.hasAmicableReport} label="Constat amiable établi" />
              <Flag active={claim.hasPoliceReport} label="PV de police / plainte déposée" />
              {claim.hasPoliceReport && claim.policeReportRef && (
                <div className="pl-6 pt-1">
                  <Field label="Référence du PV" value={claim.policeReportRef} />
                </div>
              )}
            </div>
          </Card>

          {hasThirdParty && (
            <Card title="Tiers impliqué" icon={<Car size={16} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom" value={claim.thirdPartyName} />
                <Field label="Immatriculation" value={claim.thirdPartyPlate} mono />
                <Field label="Compagnie" value={claim.thirdPartyInsurer} />
                <Field label="N° de police" value={claim.thirdPartyPolicy} mono />
              </div>
            </Card>
          )}

          {/* ── Pièces jointes ──────────────────────────────────────── */}
          <Card
            title={`Pièces jointes (${attachments.length})`}
            icon={<Paperclip size={16} />}
          >
            {attachments.length === 0 ? (
              <p className="text-sm text-gray-500">
                Le client n'a joint ni photo ni note vocale.
              </p>
            ) : (
              <div className="space-y-6">
                {audios.length > 0 && (
                  <section>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                      <Mic size={12} /> Notes vocales
                    </div>
                    <div className="space-y-3">
                      {audios.map((file) => (
                        <div key={file.id} className="bg-black/40 border border-white/10 rounded-lg p-3">
                          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                          <audio controls preload="none" src={attachmentUrl(file.url)} className="w-full" />
                          <div className="text-[10px] text-gray-600 mt-2">
                            {file.filename} · {formatFileSize(file.size)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {photos.length > 0 && (
                  <section>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                      <Camera size={12} /> Photos
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((file) => (
                        <a
                          key={file.id}
                          href={attachmentUrl(file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvrir en taille réelle"
                          className="block aspect-square border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={attachmentUrl(file.url)}
                            alt={file.filename}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {documents.length > 0 && (
                  <section>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                      <FileText size={12} /> Documents
                    </div>
                    <div className="space-y-2">
                      {documents.map((file) => (
                        <a
                          key={file.id}
                          href={attachmentUrl(file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 hover:text-white hover:border-white/30 transition-colors"
                        >
                          <Download size={14} />
                          <span className="flex-1 truncate">{file.filename}</span>
                          <span className="text-[10px] text-gray-600">{formatFileSize(file.size)}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ── Colonne latérale ────────────────────────────────────────── */}
        <div className="space-y-6">
          <Card title="Message au client" icon={<MessageSquare size={16} />}>
            <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
              Visible par le client dans son espace membre : pièce manquante,
              motif de rejet, avancement du dossier.
            </p>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteSaved(false);
              }}
              rows={5}
              placeholder="Ex. Merci de nous transmettre le constat amiable signé des deux parties."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 resize-none"
            />
            <button
              onClick={handleSaveNote}
              disabled={updating || note === (claim.adminNote ?? "")}
              className="w-full mt-3 bg-white text-black py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {updating ? "Enregistrement…" : "Enregistrer le message"}
            </button>
            {noteSaved && (
              <p className="text-[10px] text-emerald-500 mt-2 text-center">
                Message enregistré — le client le voit dans son espace.
              </p>
            )}
          </Card>

          <Card title="Client" icon={<User size={16} />}>
            <div className="space-y-4">
              <Field label="Nom" value={claim.client?.fullName || "Non renseigné"} />
              <Field icon={<Phone size={14} />} label="Téléphone" value={claim.client?.phone} mono />
              <Field icon={<Mail size={14} />} label="Email" value={claim.client?.email} />
            </div>
          </Card>

          <Card title="Contrat" icon={<FileText size={16} />}>
            {claim.quoteRequest ? (
              <div className="space-y-4">
                <Field
                  label="Type"
                  value={claim.quoteRequest.insuranceType?.replace("-", " ").toUpperCase()}
                />
                <Field label="N° de police" value={claim.quoteRequest.policyNumber} mono />
                <Link
                  href={`/quotes/${claim.quoteRequest.id}`}
                  className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Voir le dossier <ChevronLeft size={12} className="rotate-180" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Le client n'a pas rattaché ce sinistre à un contrat.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/sinistres"
      className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-6"
    >
      <ChevronLeft size={14} /> Retour aux sinistres
    </Link>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
        {icon}
        {title}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className={`text-sm ${value ? "text-white" : "text-gray-600 italic"} ${mono && value ? "font-mono" : ""}`}>
        {value || "Non renseigné"}
      </div>
    </div>
  );
}

function Flag({
  active,
  label,
  danger,
}: {
  active: boolean;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`w-2 h-2 rounded-full ${
          active ? (danger ? "bg-red-500" : "bg-emerald-500") : "bg-gray-700"
        }`}
      />
      <span className={active ? (danger ? "text-red-400 font-semibold" : "text-white") : "text-gray-600"}>
        {label} : {active ? "oui" : "non"}
      </span>
    </div>
  );
}
