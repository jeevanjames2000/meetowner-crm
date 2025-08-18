import { createAsyncThunk, createSlice, createAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import ngrokAxiosInstance from "../../hooks/AxiosInstance";
import CryptoJS from "crypto-js";
interface LoginRequest {
  mobile: string;
  isWhatsapp?: boolean;
  countryCode?: string;
}
interface SendOtpRequest {
  mobile: string;
  decryptedOtp?: string | null
}
interface SendWhatsappRequest {
  mobile: string;
  countryCode?: string;
}
interface WhatsappOtpResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    message: string;
  };
  otp: number;
}
interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}
interface User {
  user_id: number;
  mobile: string;
  name: string;
  user_type: number;
  email: string;
  state: string | null;
  city: string | null;
  pincode: string | null;
  status: number | null;
  created_userID: number | null;
  created_by: string | null;
  photo: string | null;
  alt_mobile?: string | null;
  address?: string | null;
  gst_number?: string | null;
  rera_number?: string | null;
  designation?: string | null;
  created_date?: string | null;
  created_time?: string | null;
  updated_date?: string | null;
  updated_time?: string | null;
  location?: number | null;
  from_app?: number | null;
  uploaded_from_seller_panel?: string | null;
}
interface ProfileResponse {
  id: number;
  mobile: string;
  name: string;
  user_type: number;
  email: string;
  state: string | null;
  city: string | null;
  pincode: string | null;
  status: number | null;
  created_userID: number | null;
  created_by: string | null;
  photo: string | null;
  alt_mobile?: string | null;
  address?: string | null;
  gst_number?: string | null;
  rera_number?: string | null;
  designation?: string | null;
  created_date?: string | null;
  created_time?: string | null;
  updated_date?: string | null;
  updated_time?: string | null;
  location?: number | null;
  from_app?: number | null;
  uploaded_from_seller_panel?: string | null;
}
interface LoginResponse {
  message: string;
  user: User;
  token: string;
}
interface OtpResponse {
  status: string;
  message: string;
  apiResponse?: any;
}
interface ErrorResponse {
  message?: string;
}
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  userCounts: UserCount[] | null;
  otpSent: boolean;
  otpVerified: boolean;
  tempUser: User | null;
  tempToken: string | null;
  otp: string | null;
  isWhatsappFlow: boolean;
}
interface DecodedToken {
  exp: number;
  [key: string]: any;
}
interface UserCount {
  user_type: string;
  count: number;
  trend?: "up" | "down";
  percentage?: number;
}
const JWT_SECRET = "khsfskhfks983493123!@#JSFKORuiweo232";
export const OTP_LENGTH = 4;
export const RESEND_COOLDOWN = 30;
export function decrypt(encryptedText: string): string | null {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    if (!ivHex || !encryptedHex) return null;
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const key = CryptoJS.SHA256(JWT_SECRET);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted } as CryptoJS.lib.CipherParams,
      key,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    return result || null;
  } catch {
    return null;
  }
}
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue, dispatch }) => {
    try {
      const promise = ngrokAxiosInstance.post("/meetCRM/v2/auth/authCRMLogin", {
        mobile: credentials.mobile,
      });
      toast.promise(promise, {
        loading: "Logging in...",
        success: "Login successful! Sending OTP...",
        error: "Login failed",
      });
      const response = await promise;
      if (response.data.status !== "success") {
        throw new Error(response.data.message || "Login failed");
      }
      await dispatch(sendUnifiedOtp({ mobile: credentials.mobile })).unwrap();
      return {
        id: response.data.user_details.id,
        user_id: response.data.user_details.user_id,
        mobile: response.data.user_details.mobile,
        name: response.data.user_details.name,
        user_type: response.data.user_details.user_type,
        email: response.data.user_details.email,
        state: response.data.user_details.state,
        city: response.data.user_details.city,
        pincode: response.data.user_details.pincode,
        status: response.data.user_details.status,
        created_userID: response.data.user_details.created_userID,
        created_by: response.data.user_details.created_by,
        photo: response.data.user_details.photo,
        alt_mobile: response.data.user_details.alt_mobile,
        address: response.data.user_details.address,
        gst_number: response.data.user_details.gst_number,
        rera_number: response.data.user_details.rera_number,
        designation: response.data.user_details.designation,
        created_date: response.data.user_details.created_date,
        created_time: response.data.user_details.created_time,
        updated_date: response.data.user_details.updated_date,
        updated_time: response.data.user_details.updated_time,
        location: response.data.user_details.location,
        from_app: response.data.user_details.from_app,
        uploaded_from_seller_panel: response.data.user_details.uploaded_from_seller_panel,
        accessToken: response.data.accessToken,
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        const backendMessage =
          axiosError.response.data?.message ||
          axiosError.response.data?.error ||
          null;
        if (backendMessage) {
          return rejectWithValue(backendMessage);
        }
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Invalid mobile number");
          case 404:
            return rejectWithValue("Login service not found (404). Please try again later.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "An unexpected error occurred"
            );
        }
      }
      if (axiosError.code === "ECONNABORTED" || axiosError.message === "Network Error") {
        return rejectWithValue("Network error. Please check your connection and try again.");
      }
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);
export const sendUnifiedOtp = createAsyncThunk(
  "auth/sendUnifiedOtp",
  async ({ mobile }: { mobile: string }, { rejectWithValue }) => {
    try {
      const response = await ngrokAxiosInstance.post<OtpResponse>(
        "/auth/v1/sendBothOtps",
        { mobile, countryCode: "91" },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === "success") {
        const otp = response.data?.otp || null;
        let decryptedOtp: string | null = null;
        if (otp) {
          try {
            decryptedOtp = decrypt(otp);
            if (!decryptedOtp) {
              return rejectWithValue("Failed to decrypt OTP");
            }
          } catch {
            return rejectWithValue("Failed to decrypt OTP");
          }
        }
        return {
          otp: decryptedOtp,
          message: `OTP sent to ${mobile}`,
        };
      } else {
        return rejectWithValue(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Error sending OTP"
      );
    }
  }
);
export const getUserById = createAsyncThunk<
  { user: User; token: string },
  { userId: number; token: string },
  { rejectValue: string }
>(
  "auth/v1/getUserById",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await ngrokAxiosInstance.get<{ user: User }>(
        `/meetCRM/v2/auth/authenticate?user_id=${userId}`,
      );
      if (response.data.status === "false") {
        return rejectWithValue("User not found");
      }
      return { user: response.data.data, token };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get user by ID error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("User not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to fetch user"
            );
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);
export const verifyOtpAdmin = createAsyncThunk(
  "auth/verifyOtpAdmin",
  async ({ mobile, otp }: VerifyOtpRequest, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const storedOtp = state.auth.otp;
      if (otp !== storedOtp) {
        throw new Error("Invalid OTP");
      }
      return {
        status: "success",
        message: "OTP verified successfully",
        user: state.tempUser,
        token: state.tempToken,
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse> | Error;
      console.error("Verify OTP error:", axiosError);
      const errorMessage =
        axiosError instanceof AxiosError
          ? axiosError.response?.data?.message || "Failed to verify OTP"
          : axiosError.message || "Failed to verify OTP";
      return rejectWithValue(errorMessage);
    }
  }
);
export const verifyWhatsappOtpLocally = createAction<{ otp: string }>("auth/verifyWhatsappOtpLocally");
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (user_id: number, { rejectWithValue }) => {
    try {
      const response = await ngrokAxiosInstance.get<ProfileResponse>(
        `/user/v1/getEmpProfile?user_id=${user_id}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get profile error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized access. Please log in again.");
          case 404:
            return rejectWithValue("User profile not found.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to fetch user profile."
            );
        }
      }
      if (axiosError.code === "ECONNABORTED" || axiosError.message === "Network Error") {
        return rejectWithValue("Network error. Please check your connection and try again.");
      }
      return rejectWithValue("Failed to fetch user profile.");
    }
  }
);
export const getAllUsersCount = createAsyncThunk(
  "auth/getAllUsersCount",
  async (_, { rejectWithValue }) => {
    try {
      const promise = ngrokAxiosInstance.get<UserCount[]>("/user/v1/getAllUsersCount");
      const response = await promise;
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array");
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse> | Error;
      console.error("Error fetching user counts:", axiosError);
      return rejectWithValue(
        axiosError instanceof AxiosError
          ? axiosError.response?.data || { message: "Failed to fetch user counts" }
          : { message: axiosError.message }
      );
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    userCounts: null,
    otpSent: false,
    otpVerified: false,
    tempUser: null,
    tempToken: null,
    otp: null,
    isWhatsappFlow: false,
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.userCounts = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.tempUser = null;
      state.tempToken = null;
      state.otp = null;
      state.isWhatsappFlow = false;
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("userType");
      localStorage.removeItem("email");
      localStorage.removeItem("mobile");
      localStorage.removeItem("city");
      localStorage.removeItem("state");
      localStorage.removeItem("userId");
      localStorage.removeItem("photo");
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.error = null;
      state.tempUser = null;
      state.tempToken = null;
      state.otp = null;
      state.isWhatsappFlow = false;
    },
    setToken:(state,action)=>{
      state.token=action.payload
    },
    setisAuthenticated:(state,action)=>{
      state.isAuthenticated=action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.tempUser = {
          user_id: action.payload.id,
          mobile: action.payload.mobile,
          name: action.payload.name,
          user_type: action.payload.user_type,
          email: action.payload.email || "",
          state: action.payload.state || null,
          city: action.payload.city || null,
          pincode: action.payload.pincode || null,
          status: action.payload.status ?? null,
          created_userID: action.payload.created_userID ?? null,
          created_by: action.payload.created_by || null,
          photo: action.payload.photo || null,
          alt_mobile: action.payload.alt_mobile || null,
          address: action.payload.address || null,
          gst_number: action.payload.gst_number || null,
          rera_number: action.payload.rera_number || null,
          designation: action.payload.designation || null,
          created_date: action.payload.created_date || null,
          created_time: action.payload.created_time || null,
          updated_date: action.payload.updated_date || null,
          updated_time: action.payload.updated_time || null,
          location: action.payload.location || null,
          from_app: action.payload.from_app || null,
          uploaded_from_seller_panel: action.payload.uploaded_from_seller_panel || null,
        };
        state.tempToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
     .addCase(sendUnifiedOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isWhatsappFlow = false;
      })
      .addCase(sendUnifiedOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.otp = action.payload.otp;
      })
      .addCase(sendUnifiedOtp.rejected, (state, action) => {
        
        state.loading = false;
        state.error = action.payload as string;
        state.tempUser = null;
        state.tempToken = null;
        state.otp = null;
      })
      .addCase(verifyOtpAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        state.isAuthenticated = true;
        state.user = state.tempUser;
        state.token = state.tempToken;
        if (state.tempUser) {
          localStorage.setItem("userDetails", JSON.stringify(state.tempUser));
          localStorage.setItem("name", state.tempUser.name);
          localStorage.setItem("userType", state.tempUser.user_type.toString());
          localStorage.setItem("email", state.tempUser.email || "");
          localStorage.setItem("mobile", state.tempUser.mobile);
          localStorage.setItem("city", state.tempUser.city || "");
          localStorage.setItem("state", state.tempUser.state || "");
          localStorage.setItem("userId", state.tempUser.user_id.toString());
          localStorage.setItem("photo", state.tempUser.photo || "");
        }
        if (state.tempToken) {
          localStorage.setItem("token", state.tempToken);
        }
      })
      .addCase(verifyOtpAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          user_id: action.payload.id,
          mobile: action.payload.mobile,
          name: action.payload.name,
          user_type: action.payload.user_type,
          email: action.payload.email || "",
          state: action.payload.state || null,
          city: action.payload.city || null,
          pincode: action.payload.pincode || null,
          status: action.payload.status ?? null,
          created_userID: action.payload.created_userID ?? null,
          created_by: action.payload.created_by || null,
          photo: action.payload.photo || null,
          alt_mobile: action.payload.alt_mobile || null,
          address: action.payload.address || null,
          gst_number: action.payload.gst_number || null,
          rera_number: action.payload.rera_number || null,
          designation: action.payload.designation || null,
          created_date: action.payload.created_date || null,
          created_time: action.payload.created_time || null,
          updated_date: action.payload.updated_date || null,
          updated_time: action.payload.updated_time || null,
          location: action.payload.location || null,
          from_app: action.payload.from_app || null,
          uploaded_from_seller_panel: action.payload.uploaded_from_seller_panel || null,
        };
        localStorage.setItem("name", action.payload.name);
        localStorage.setItem("userType", action.payload.user_type.toString());
        localStorage.setItem("email", action.payload.email || "");
        localStorage.setItem("mobile", action.payload.mobile);
        localStorage.setItem("city", action.payload.city || "");
        localStorage.setItem("state", action.payload.state || "");
        localStorage.setItem("userId", action.payload.id.toString());
        localStorage.setItem("photo", action.payload.photo || "");
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.otpVerified = false;
        state.tempUser = null;
        state.tempToken = null;
        state.otp = null;
        localStorage.clear();
      })
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.user = {
          id: action.payload.user.user_id,
          name: action.payload.user.name,
          email: action.payload.user.email,
          photo: action.payload.user.photo,
          mobile: action.payload.user.mobile,
          subscription_package: action.payload.user.subscription_package,
          subscription_status: action.payload.user.subscription_status,
          crm_access: action.payload.user.crm_access,
        };
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAllUsersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsersCount.fulfilled, (state, action) => {
        state.loading = false;
        state.userCounts = action.payload;
      })
      .addCase(getAllUsersCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};
export const { logout, resetOtpState,setToken,setisAuthenticated } = authSlice.actions;
export default authSlice.reducer;