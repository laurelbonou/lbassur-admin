"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ChevronLeft, FileText, User, Mail, Phone, Calendar, 
  CreditCard, ShieldCheck, Download, AlertCircle, CheckCircle2,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [policyNumber, setPolicyNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) throw new Error("ID not found in params");
        const data = await api.getQuoteRequest(id as string);
        setQuote(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les détails de cette souscription.");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchQuote();
  }, [params.id]);

  const handleSendToInsurer = async () => {
    setIsSending(true);
    try {
      await api.sendToInsurer(quote.id);
      setQuote({ ...quote, status: "INSURER_PENDING" });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi à l'assureur.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFinalize = async () => {
    if (!policyNumber) {
      alert("Veuillez entrer le numéro de police fourni par l'assureur.");
      return;
    }
    setIsFinalizing(true);
    try {
      const res = await api.finalizeContract(quote.id, policyNumber);
      setQuote(res.quote);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la finalisation.");
    } finally {
      setIsFinalizing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Chargement...</div>;
  }

  if (error || !quote) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          {error || "Souscription introuvable."}
        </div>
        <Link href="/quotes" className="inline-block mt-4 text-sm text-blue-500 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link 
        href="/quotes"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={16} /> Retour aux souscriptions
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
            Détails Souscription
          </h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            ID: <span className="font-mono text-gray-300">{quote.id}</span>
          </p>
        </div>
        <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border ${
          quote.status === "NEW" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
          quote.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
          quote.status === "DRAFT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
          quote.status === "PROCESSING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          "bg-gray-500/10 text-gray-400 border-gray-500/20"
        }`}>
          {quote.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <User size={18} className="text-gray-400" /> Informations Client
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Nom Complet</span>
                <span className="font-medium text-white">{quote.fullName}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Téléphone</span>
                <span className="font-medium text-white flex items-center gap-1"><Phone size={12}/> {quote.phone}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Email</span>
                <span className="font-medium text-white flex items-center gap-1"><Mail size={12}/> {quote.email || "Non renseigné"}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Date de demande</span>
                <span className="font-medium text-white flex items-center gap-1"><Calendar size={12}/> {format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
            </div>
          </div>

          {/* Form Data */}
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText size={18} className="text-gray-400" /> Fiche de Cotation
            </h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              {Object.entries(quote.payload || {}).map(([key, value]) => (
                <div key={key}>
                  <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="font-medium text-white">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <FileCheck size={18} className="text-gray-400" /> Documents & Signature
            </h2>
            <div className="space-y-3">
              {quote.documents?.length > 0 ? (
                quote.documents.map((doc: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded">
                    <span className="text-sm text-gray-300 font-mono">{doc.type || "Document"}</span>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                      <Download size={14} /> Télécharger
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Aucun document téléchargé.</p>
              )}
              
              {quote.signatureData && (
                <div className="mt-4 p-4 border border-white/10 rounded bg-white/5">
                  <span className="block text-gray-500 mb-2 text-xs uppercase tracking-wider">Signature Électronique</span>
                  <img src={quote.signatureData} alt="Signature Client" className="h-20 invert opacity-80" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-gray-400" /> Paiement
            </h2>
            {quote.payment ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-bold text-white">{quote.payment.amount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Méthode</span>
                  <span className="text-white">{quote.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut</span>
                  <span className="text-green-400 font-bold">{quote.payment.status}</span>
                </div>
                {quote.receiptUrl && (
                  <a href={quote.receiptUrl} target="_blank" rel="noreferrer" className="block mt-4 text-center text-xs text-black bg-white py-2 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                    Voir la Quittance
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-500 flex items-center gap-2">
                <AlertCircle size={14}/> Non payé
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-gray-400" /> Actions Administrateur
            </h2>

            <div className="space-y-4">
              {/* Send to Insurer */}
              <button
                onClick={handleSendToInsurer}
                disabled={isSending || quote.status === "COMPLETED" || quote.status === "INSURER_PENDING"}
                className="w-full text-left p-3 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors rounded text-blue-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="block font-bold mb-1">1. Envoyer à l'assureur</span>
                <span className="text-xs text-blue-500/70 block">Transmettre les documents pour validation</span>
              </button>

              {/* Finalize */}
              <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 rounded">
                <span className="block font-bold text-emerald-400 mb-1 text-sm">2. Finaliser le contrat</span>
                <span className="text-xs text-emerald-500/70 block mb-3">Générer l'attestation finale avec le numéro de police</span>
                
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="Numéro de Police (ex: POL-12345)"
                  disabled={quote.status === "COMPLETED"}
                  className="w-full bg-black/50 border border-emerald-500/30 text-white p-2 text-sm rounded mb-2 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing || quote.status === "COMPLETED" || !policyNumber}
                  className="w-full bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest py-2 rounded hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                  {isFinalizing ? "Génération..." : "Générer Attestation"}
                </button>
              </div>

              {quote.contractUrl && (
                <a href={quote.contractUrl} target="_blank" rel="noreferrer" className="w-full flex justify-center items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 py-3 rounded uppercase font-bold tracking-widest">
                  <CheckCircle2 size={16} /> Voir Attestation Finale
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
