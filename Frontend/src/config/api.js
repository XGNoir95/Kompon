import axios from "axios";
/**
 * Change ONLY this when you deploy or switch ports.
 * - For dev with Vite proxy: leave empty string "" to use "/api".
 * - For direct calls: set e.g. "http://localhost:5000" or your prod API origin.
 * - Or set VITE_API_ORIGIN in .env to override this value.
 */
export const API_HOST = "http://localhost:5000";

export const API_BASE_URL = API_HOST
  ? `${API_HOST.replace(/\/+$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});
