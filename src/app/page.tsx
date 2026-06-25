"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Activity, Users, CheckCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface Quote {
  id: string;
  fullName: string;
  status: string;
  createdAt: string;
}

export default function AdminIndex() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getQuoteRequests();
        setQuotes(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const total = quotes.length;
  const pending = quotes.filter((q) => q.status === "NEW" || q.status === "PROCESSING").length;
  const completed = quotes.filter((q) => q.status === "COMPLETED" || q.status === "CONVERTED").length;

  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bienvenue sur votre espace d'administration LBAssur.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Demandes</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">En cours / Attente</p>
                <p className="text-2xl font-bold text-gray-900">{pending}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dossiers Finalisés</p>
                <p className="text-2xl font-bold text-gray-900">{completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-gray-400" />
                Activités récentes
              </h2>
              <Link href="/quotes" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Voir tout
              </Link>
            </div>
            
            <div className="divide-y divide-gray-50">
              {recentQuotes.length > 0 ? (
                recentQuotes.map((quote) => (
                  <div key={quote.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{quote.fullName}</p>
                        <p className="text-sm text-gray-500">Nouvelle demande de souscription</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        quote.status === "NEW" ? "bg-amber-100 text-amber-700" :
                        quote.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {quote.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(quote.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Aucune activité récente.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
