import axios from "axios";
import { apiBaseUrl } from "./config";

const apiBranchClient = axios.create({
  baseURL: apiBaseUrl,
});

apiBranchClient.interceptors.request.use((config) => {
  return config;
});

export default apiBranchClient;
