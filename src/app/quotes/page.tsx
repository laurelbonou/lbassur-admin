"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Filter, Eye, AlertCircle, FileCheck, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONVERTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  PROCESSING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  INSURER_PENDING: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusLabels: Record<string, string> = {
  NEW: "Nouveau",
  CONVERTED: "Converti",
  PROCESSING: "En Traitement (Payé)",
  INSURER_PENDING: "Chez l'Assureur",
  COMPLETED: "Terminé",
};

export default function QuotesListPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await api.getQuoteRequests();
        // Sort by newest
        const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setQuotes(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Souscriptions</h1>
          <p className="text-gray-400 text-sm">Gérez les demandes de souscription et les contrats.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un client, email, téléphone..." 
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30 text-white placeholder-gray-600 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
            <Filter size={16} /> Filtrer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 bg-black/20">
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Client</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Contact</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Date</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Statut</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Chargement des données...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Aucune souscription trouvée.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{quote.fullName}</div>
                      <div className="text-xs text-gray-500">{quote.formId}</div>
                    </td>
                    <td className="p-4 text-gray-400">
                      <div>{quote.email || "Non renseigné"}</div>
                      <div>{quote.phone}</div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {format(new Date(quote.createdAt), "dd MMM yyyy", { locale: fr })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[quote.status] || "bg-gray-500/10 text-gray-400"}`}>
                        {statusLabels[quote.status] || quote.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/quotes/${quote.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition-colors"
                      >
                        <Eye size={14} /> Voir
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
