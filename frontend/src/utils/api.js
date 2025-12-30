// frontend/src/utils/api.js
export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");

  // ✅ Ensure base always ends with /api
  const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const base = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
};
