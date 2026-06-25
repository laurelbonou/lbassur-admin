const API_BASE_URL = "/api/proxy";

export const api = {
  getQuoteRequests: async () => {
    const res = await fetch(`${API_BASE_URL}/quote-requests`);
    if (!res.ok) throw new Error("Failed to fetch quote requests");
    return res.json();
  },

  getQuoteRequest: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/quote-requests/${id}`);
    if (!res.ok) throw new Error("Quote not found");
    return res.json();
  },

  sendToInsurer: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/quote-requests/${id}/send-to-insurer`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to send to insurer");
    return res.json();
  },

  finalizeContract: async (id: string, policyNumber: string) => {
    const res = await fetch(`${API_BASE_URL}/quote-requests/${id}/finalize-contract`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ policyNumber })
    });
    if (!res.ok) throw new Error("Failed to finalize contract");
    return res.json();
  },

  sendCustomEmail: async (to: string, subject: string, message: string) => {
    const res = await fetch(`${API_BASE_URL}/notifications/send-custom-email`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, message })
    });
    if (!res.ok) throw new Error("Failed to send custom email");
    return res.json();
  }
};

export default api;
