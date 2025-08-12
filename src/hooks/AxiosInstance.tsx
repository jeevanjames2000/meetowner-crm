import axios, { AxiosInstance } from "axios";

const ngrokAxiosInstance: AxiosInstance = axios.create({
  // baseURL: 'https://72189bcc9357.ngrok-free.app',
  baseURL: "http://localhost:5000",

  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

export default ngrokAxiosInstance;
