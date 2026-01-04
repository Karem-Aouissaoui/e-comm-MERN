import axios from "axios";

/**
 * Axios client:
 * - baseURL from Vite env
 * - withCredentials allows cookie auth (access_token) to be stored/sent
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
