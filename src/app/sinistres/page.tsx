"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ShieldAlert, Search, Filter, CheckCircle2, ChevronDown } from "lucide-react";

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await fetch("/api/proxy/clients/claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/proxy/clients/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchClaims();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Gestion des Sinistres
          </h1>
          <p className="text-gray-400 text-sm">Traitez et suivez les déclarations de sinistres de vos clients.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par client, police, description..." 
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
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Détails du Sinistre</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Contrat / Police</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Statut</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse">
                    Chargement des données...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Aucun sinistre déclaré pour le moment.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{claim.client?.fullName || "Inconnu"}</div>
                      <div className="text-xs text-gray-500">{claim.client?.phone}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="text-white text-xs mb-1 font-semibold">Date d'incident: {format(new Date(claim.incidentDate), "dd MMM yyyy", { locale: fr })}</div>
                      <div className="text-xs text-gray-400 line-clamp-2" title={claim.description}>{claim.description}</div>
                      <div className="text-[10px] text-gray-600 mt-1">Déclaré le {format(new Date(claim.createdAt), "dd MMM yyyy", { locale: fr })}</div>
                    </td>
                    <td className="p-4">
                      {claim.quoteRequest ? (
                        <>
                          <div className="text-white text-xs font-semibold">{claim.quoteRequest.insuranceType?.toUpperCase()}</div>
                          <div className="text-xs text-gray-500 font-mono mt-1">{claim.quoteRequest.policyNumber || "Pas de police"}</div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-500 italic">Non lié</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        claim.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        claim.status === "INVESTIGATING" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        claim.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {claim.status === "PENDING" ? "En Attente" :
                         claim.status === "INVESTIGATING" ? "En Cours" :
                         claim.status === "RESOLVED" ? "Résolu" : "Rejeté"}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={claim.status}
                        onChange={(e) => handleUpdateStatus(claim.id, e.target.value)}
                        className="bg-black/50 border border-white/10 text-xs text-white p-2 rounded focus:outline-none focus:border-white/30"
                      >
                        <option value="PENDING">Mettre en attente</option>
                        <option value="INVESTIGATING">Traiter (En cours)</option>
                        <option value="RESOLVED">Marquer Résolu</option>
                        <option value="REJECTED">Rejeter</option>
                      </select>
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
