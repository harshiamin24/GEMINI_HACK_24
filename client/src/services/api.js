const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('urbanlogix_token') || 'demo-admin-token';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data;
}

export const api = {
  // Hubs
  getHubs: () => request('/hubs'),
  getHubById: (id) => request(`/hubs/${id}`),
  createHub: (hubData) => request('/hubs', { method: 'POST', body: JSON.stringify(hubData) }),
  updateHub: (id, hubData) => request(`/hubs/${id}`, { method: 'PUT', body: JSON.stringify(hubData) }),
  deleteHub: (id) => request(`/hubs/${id}`, { method: 'DELETE' }),

  // Bikes
  getBikes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bikes${qs ? `?${qs}` : ''}`);
  },
  createBike: (bikeData) => request('/bikes', { method: 'POST', body: JSON.stringify(bikeData) }),
  updateBike: (id, bikeData) => request(`/bikes/${id}`, { method: 'PUT', body: JSON.stringify(bikeData) }),
  deleteBike: (id) => request(`/bikes/${id}`, { method: 'DELETE' }),

  // Parcels
  getParcels: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/parcels${qs ? `?${qs}` : ''}`);
  },
  createParcel: (parcelData) => request('/parcels', { method: 'POST', body: JSON.stringify(parcelData) }),
  updateParcelStatus: (id, status) => request(`/parcels/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  allocateParcels: () => request('/parcels/allocate', { method: 'POST' }),
  deleteParcel: (id) => request(`/parcels/${id}`, { method: 'DELETE' }),

  // Routes
  getRoutes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/routes${qs ? `?${qs}` : ''}`);
  },
  optimizeRoutes: (routeParams) => request('/routes/optimize', { method: 'POST', body: JSON.stringify(routeParams) }),
  updateRouteStatus: (id, status) => request(`/routes/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Analytics
  getDashboardMetrics: () => request('/analytics/dashboard'),
  getCarbonAnalytics: (period = 30) => request(`/analytics/carbon?period=${period}`),

  // AI Advisor
  queryAdvisor: (message, context) => request('/ai/advisor', { method: 'POST', body: JSON.stringify({ message, context }) }),
};
