"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Mail, FileText, Download, CheckCircle, Clock, Send, ShieldCheck, AlertTriangle, Phone } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONVERTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  PROCESSING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  INSURER_PENDING: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [policyNumber, setPolicyNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const data = await api.getQuoteRequest(id as string);
        setQuote(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuote();
  }, [id]);

  const handleSendToInsurer = async () => {
    if (!confirm("Envoyer le dossier complet à l'assureur ?")) return;
    setActionLoading(true);
    try {
      await api.sendToInsurer(id as string);
      alert("Dossier transmis à l'assureur avec succès.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la transmission.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeContract = async () => {
    if (!policyNumber) return alert("Veuillez saisir le numéro de police fourni par l'assureur.");
    if (!confirm("Générer le contrat final et l'envoyer au client ?")) return;
    
    setActionLoading(true);
    try {
      await api.finalizeContract(id as string, policyNumber);
      alert("Contrat généré et envoyé au client avec succès.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération du contrat.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (!quote) return <div className="p-8 text-center text-red-500">Dossier introuvable.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/quotes" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Retour à la liste
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest mb-2">{quote.fullName}</h1>
          <p className="text-gray-400">Demande de {quote.formId} du {format(new Date(quote.createdAt), "dd MMMM yyyy", { locale: fr })}</p>
        </div>
        <div className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest ${statusColors[quote.status]}`}>
          {quote.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informations Client */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              Informations Client
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Nom Complet</span>
                <span className="font-medium">{quote.fullName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">Téléphone (Clic pour Appeler)</span>
                <a 
                  href={`tel:${quote.phone}`} 
                  className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg font-bold transition-colors"
                >
                  <Phone size={16} /> {quote.phone}
                </a>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Email</span>
                <span className="font-medium">{quote.email || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Localisation</span>
                <span className="font-medium">{quote.payload?.location || "—"}</span>
              </div>
            </div>
          </div>

          {/* Formulaire (Payload) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              Détails de la demande
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(quote.payload || {}).map(([key, value]: any) => (
                <div key={key}>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{key}</span>
                  <span className="font-medium">{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>
                </div>
              ))}
            </div>
          </div>

        {/* Documents */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              Pièces Justificatives
            </h2>
            {quote.documents && quote.documents.length > 0 ? (
              <div className="space-y-3">
                {quote.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-400" />
                      <span className="text-sm font-medium">{doc.type || doc.filename}</span>
                    </div>
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors"
                    >
                      <Download size={14} /> Voir / Télécharger
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun document fourni.</p>
            )}
          </div>

          {/* Messagerie Admin */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <Mail size={20} /> Messagerie Rapide
            </h2>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const to = form.to.value;
                const subject = form.subject.value;
                const message = form.message.value;
                setActionLoading(true);
                try {
                  await api.sendCustomEmail(to, subject, message);
                  alert("E-mail envoyé avec succès !");
                  form.reset();
                } catch (err) {
                  alert("Erreur lors de l'envoi de l'e-mail.");
                } finally {
                  setActionLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Destinataire</label>
                <select name="to" required className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50">
                  <option value={quote.email || ""}>Client ({quote.email || "Non renseigné"})</option>
                  <option value="assureur@example.com">Assureur (assureur@example.com)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Objet</label>
                <input type="text" name="subject" required placeholder="Ex: Pièces manquantes pour votre dossier" className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Message</label>
                <textarea name="message" required rows={4} placeholder="Tapez votre message ici..." className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={actionLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                <Send size={14} /> Envoyer l'E-mail
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Actions Administratives */}
        <div className="space-y-6">
          <div className="bg-black border border-white/20 rounded-xl p-6 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/20 pb-4 text-white">
              <ShieldCheck size={16} /> Flux Courtier
            </h2>

            <div className="space-y-8 relative">
              {/* Ligne connectrice verticale */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10 -z-10" />

              {/* Étape 1 : Paiement */}
              <div className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${quote.payment ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/50'}`}>
                  {quote.payment ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">1. Paiement Client</h3>
                  <p className="text-xs text-gray-400 mt-1 mb-2">Le client a réglé sa souscription.</p>
                  {quote.receiptUrl && (
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}${quote.receiptUrl}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium">
                      Voir la Quittance
                    </a>
                  )}
                </div>
              </div>

              {/* Étape 2 : Transmission Assureur */}
              <div className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${['INSURER_PENDING', 'COMPLETED'].includes(quote.status) ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/50'}`}>
                  {['INSURER_PENDING', 'COMPLETED'].includes(quote.status) ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">2. Accord Assureur</h3>
                  <p className="text-xs text-gray-400 mt-1 mb-3">Transmission du dossier à l'assureur pour validation.</p>
                  
                  {quote.status === "PROCESSING" && (
                    <button 
                      onClick={handleSendToInsurer}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      <Send size={14} /> Transmettre Dossier
                    </button>
                  )}
                  {['INSURER_PENDING', 'COMPLETED'].includes(quote.status) && (
                    <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Dossier Transmis</span>
                  )}
                </div>
              </div>

              {/* Étape 3 : Contrat Final */}
              <div className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${quote.status === 'COMPLETED' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/50'}`}>
                  {quote.status === 'COMPLETED' ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">3. Contrat & Police</h3>
                  <p className="text-xs text-gray-400 mt-1 mb-3">Saisie du N° de police et génération du contrat final inviolable.</p>
                  
                  {quote.status === "INSURER_PENDING" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Numéro de Police</label>
                        <input 
                          type="text" 
                          value={policyNumber}
                          onChange={(e) => setPolicyNumber(e.target.value)}
                          placeholder="EX: POL-2024-XXXX"
                          className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                      <button 
                        onClick={handleFinalizeContract}
                        disabled={actionLoading || !policyNumber}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded text-xs font-black uppercase tracking-widest transition-colors hover:bg-gray-200 disabled:opacity-50"
                      >
                        <FileText size={14} /> Générer Contrat
                      </button>
                    </div>
                  )}

                  {quote.status === "COMPLETED" && quote.contractUrl && (
                    <div className="space-y-2 mt-2">
                      <div className="text-xs text-white"><span className="text-gray-500">Police N°:</span> {quote.policyNumber}</div>
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL}${quote.contractUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        <Download size={14} /> Voir le Contrat
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
