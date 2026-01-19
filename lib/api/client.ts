import axios from "axios";
import { apiBaseUrl } from "../config";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem("auth_session")!);

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session?.token}`;
  }

  return config;
});

export default apiClient;