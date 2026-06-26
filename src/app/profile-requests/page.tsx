"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

export default function ProfileRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await api.getProfileRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateProfileRequestStatus(id, status, adminNote);
      await fetchRequests();
      setSelectedReq(null);
      setAdminNote("");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Demandes de modification Profil</h1>
          <p className="text-gray-400 text-sm">Modérez les changements d'informations des clients et vérifiez les justificatifs.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 bg-black/20">
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Client</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Date</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Changements demandés</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Statut</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Aucune demande trouvée.</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{req.client?.fullName || "N/A"}</div>
                      <div className="text-xs text-gray-500">{req.client?.phone}</div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {format(new Date(req.createdAt), "dd MMM yyyy", { locale: fr })}
                    </td>
                    <td className="p-4 text-gray-400">
                      <div className="text-xs">
                        {Object.entries(req.requestedData).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <span className="font-bold capitalize">{k}:</span> <span>{v as string}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[req.status]}`}>
                        {statusLabels[req.status] || req.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedReq(req)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition-colors"
                      >
                        Examiner
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReq && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4 text-white">Détails de la demande</h2>
            
            <div className="mb-6 space-y-4">
              <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Client</h3>
                <p className="text-white">{selectedReq.client?.fullName} ({selectedReq.client?.phone})</p>
              </div>

              <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Changements demandés</h3>
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  {Object.entries(selectedReq.requestedData).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-sm">
                      <span className="font-bold text-gray-400 capitalize">{k}:</span> <span className="text-white">{v as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Justificatif</h3>
                {selectedReq.proofDocumentUrl ? (
                  <a href={selectedReq.proofDocumentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                    <ExternalLink size={16} /> Voir le document (S'ouvre dans un nouvel onglet)
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun justificatif fourni.</p>
                )}
              </div>

              {selectedReq.status === 'PENDING' && (
                <div>
                  <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Note de l'administrateur (Optionnel)</h3>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Ex: Justificatif illisible, veuillez renvoyer."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/30 text-white"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-sm"
              >
                Fermer
              </button>
              {selectedReq.status === 'PENDING' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedReq.id, 'REJECTED')}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded font-bold text-sm flex items-center gap-2"
                  >
                    <XCircle size={16} /> Rejeter
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedReq.id, 'APPROVED')}
                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded font-bold text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Approuver
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
