import { Platform } from "react-native";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const url =
  Platform.OS === "android"
    ? "http://10.0.2.2:26367"
    : "http://192.168.1.18:26367";
//const url = "https://rcwc2n8v-26367.asse.devtunnels.ms";
const Api: AxiosInstance = axios.create({ baseURL: url + "/api" });

Api.interceptors.request.use(async (config) => {
  let token: string | null = null;
  if (Platform.OS === "web") {
    token = localStorage.getItem("token");
  } else {
    token = await AsyncStorage.getItem("token");
  }

  if (token) config.headers.set("Authorization", `Bearer ${token}`);

  return config;
});

Api.interceptors.response.use(
  async (res: AxiosResponse) => res.data,
  async (err: AxiosError) => Promise.reject(err)
);

export { Api };
