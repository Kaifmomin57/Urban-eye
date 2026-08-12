const API_BASE = "http://localhost:8000";

export const apiClient = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  postFormData: async (endpoint: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  patch: async (endpoint: string, data?: any) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  patchFormData: async (endpoint: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      body: formData,
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
};
