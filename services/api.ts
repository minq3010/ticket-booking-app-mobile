import { Platform } from "react-native";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const url = Platform.OS === "ios" || "http://10.0.2.2:26367" 
            ? "http://192.168.1.18:26367" 
            : "http://127.0.0.1:26367"
const Api: AxiosInstance = axios.create({ baseURL: url + "/api" });

Api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem("token");

  if (token) config.headers.set("Authorization", `Bearer ${token}`);

  return config;
});

Api.interceptors.response.use(
  async (res: AxiosResponse) => res.data,
  async (err: AxiosError) => Promise.reject(err)
);

export { Api };