import Medusa from "@medusajs/js-sdk";
import axios from "axios";
export const backendUrl = __BACKEND_URL__ ?? "/";

export const sdk = new Medusa({
  baseUrl: backendUrl,
  auth: {
    type: "session",
  },
});

// useful when you want to call the BE from the console and try things out quickly
if (typeof window !== "undefined") {
  (window as any).__sdk = sdk;
}

export const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // dùng session cookie admin
  headers: { "Content-Type": "application/json" },
});

// ---- Attach Bearer token tự động cho mọi request ----
const TOKEN_KEYS = [
  "medusa_auth_token",
  "admin_token",
  "access_token",
] as const;

const getToken = () =>
  TOKEN_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ?? "";

// Request interceptor: gắn Authorization nếu có token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    // không ghi đè nếu caller đã set Authorization riêng
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Nếu gửi FormData/Blob, đừng ép Content-Type JSON:
  if (
    config.data instanceof FormData ||
    (typeof Blob !== "undefined" && config.data instanceof Blob)
  ) {
    delete (config.headers as any)["Content-Type"];
  }
  return config;
});

// (Tuỳ chọn) Response interceptor: xử lý 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // localStorage.removeItem("medusa_auth_token");
      // điều hướng login, hoặc phát sự kiện
      // window.location.assign("/login");
    }
    return Promise.reject(err);
  }
);
