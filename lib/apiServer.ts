import axios from "axios";
import { apiBaseUrl } from "./config";
import { cookies } from "next/headers";

const apiServer = axios.create({
  baseURL: apiBaseUrl,
});

apiServer.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }



  return config;

  
});

export default apiServer;
