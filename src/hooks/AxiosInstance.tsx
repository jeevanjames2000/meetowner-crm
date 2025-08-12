import axios, { AxiosInstance } from "axios";

const ngrokAxiosInstance: AxiosInstance = axios.create({
  // baseURL: 'https://72189bcc9357.ngrok-free.app',
  baseURL: "https://3j4snx7z-5000.inc1.devtunnels.ms",

  headers: {
    "Content-Type": "application/json",
    // "ngrok-skip-browser-warning": "true",
  },
});

export default ngrokAxiosInstance;
