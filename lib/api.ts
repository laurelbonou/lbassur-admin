const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = {
  getQuoteRequests: async () => {
    const res = await fetch(`${API_BASE_URL}/quote-requests`, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "super-secret-admin-key" }
    });
    if (!res.ok) throw new Error("Failed to fetch quote requests");
    return res.json();
  },

  getQuoteRequest: async (id: string) => {
    // Re-using the same list logic to find one since there is no GET /quote-requests/:id in the backend yet
    const data = await api.getQuoteRequests();
    const quote = data.find((q: any) => q.id === id);
    if (!quote) throw new Error("Quote not found");
    return quote;
  },

  sendToInsurer: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/quote-requests/${id}/send-to-insurer`, {
      method: "POST",
      headers: { "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "super-secret-admin-key" }
    });
    if (!res.ok) throw new Error("Failed to send to insurer");
    return res.json();
  },

  finalizeContract: async (id: string, policyNumber: string) => {
    const res = await fetch(`${API_BASE_URL}/quote-requests/${id}/finalize-contract`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "super-secret-admin-key"
      },
      body: JSON.stringify({ policyNumber })
    });
    if (!res.ok) throw new Error("Failed to finalize contract");
    return res.json();
  }
};

export default api;
