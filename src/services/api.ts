async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw data || new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
  const res = await request(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function register(name: string, email: string, password: string) {
  const res = await request(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.data;
}

export async function googleLogin(idToken: string) {
  const res = await request(`/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return res.data;
}

export async function getProfile(token: string) {
  const res = await request(`/api/user/profile`, { headers: { ...authHeaders(token) } });
  return res.data || res;
}

export async function searchDestinations(q: string) {
  const res = await request(`/api/search?q=${encodeURIComponent(q)}`);
  return res.data;
}

export async function getDestination(xid: string) {
  const res = await request(`/api/destination/${encodeURIComponent(xid)}`);
  return res.data;
}

export async function getFavorites(token: string) {
  const res = await request(`/api/favorites`, { headers: { ...authHeaders(token) } });
  return res.data;
}

export interface FavoritePayload {
  xid: string;
  destinationName: string;
  image?: string;
  country?: string;
}

export async function addFavorite(token: string, payload: FavoritePayload) {
  const res = await request(`/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function removeFavorite(token: string, xid: string) {
  const res = await request(`/api/favorites/${encodeURIComponent(xid)}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  return res.data;
}

export async function getVisited(token: string) {
  const res = await request(`/api/visited`, { headers: { ...authHeaders(token) } });
  return res.data;
}

export interface VisitedPayload {
  xid: string;
  destinationName: string;
  image?: string;
  country?: string;
  visitedDate?: string | Date;
}

export async function addVisited(token: string, payload: VisitedPayload) {
  const res = await request(`/api/visited`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function removeVisited(token: string, xid: string) {
  const res = await request(`/api/visited/${encodeURIComponent(xid)}`, { method: "DELETE", headers: { ...authHeaders(token) } });
  return res.data;
}

const api = { login, register, googleLogin, getProfile, searchDestinations, getDestination, getFavorites, addFavorite, removeFavorite, getVisited, addVisited, removeVisited };
export default api;
