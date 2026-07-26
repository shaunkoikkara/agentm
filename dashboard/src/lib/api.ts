const BASE_URL = '/api';

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export const api = {
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  signup: (data: any) => fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: any) => fetchApi('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  resendOtp: (data: any) => fetchApi('/auth/resend-otp', { method: 'POST', body: JSON.stringify(data) }),
  
  getTenant: () => fetchApi('/tenants/me'),
  updateTenant: (data: any) => fetchApi('/tenants/me', { method: 'PUT', body: JSON.stringify(data) }),
  connectWhatsApp: (data: { accessToken: string }) => fetchApi('/tenants/whatsapp-connect', { method: 'POST', body: JSON.stringify(data) }),
  
  getKnowledge: () => fetchApi('/knowledge'),
  createKnowledge: (data: any) => fetchApi('/knowledge', { method: 'POST', body: JSON.stringify(data) }),
  updateKnowledge: (id: string, data: any) => fetchApi(`/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKnowledge: (id: string) => fetchApi(`/knowledge/${id}`, { method: 'DELETE' }),
  
  getConversations: () => fetchApi('/conversations'),
  getConversationStats: () => fetchApi('/conversations/stats'),
  getConversation: (id: string) => fetchApi(`/conversations/${id}`),
  takeoverConversation: (id: string) => fetchApi(`/conversations/${id}/takeover`, { method: 'POST' }),
  releaseConversation: (id: string) => fetchApi(`/conversations/${id}/release`, { method: 'POST' }),
  sendMessage: (id: string, content: string) => fetchApi(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
};
