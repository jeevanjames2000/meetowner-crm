import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { AuthState, LoginRequest, LoginResponse } from "../../types/UserModel";
import ngrokAxiosInstance from "../../hooks/AxiosInstance";
import { ErrorResponse } from "../../types/UserModel";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const promise = ngrokAxiosInstance.post<LoginResponse>(
        "/api/v1/login",
        credentials  
      );

      toast.promise(promise, {
        loading: "Logging in...",
        success: "Login successful!",
        error: "Login failed",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Login error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorMessage = axiosError.response.data?.error || axiosError.response.data?.message;

        switch (status) {
          case 401:
            return rejectWithValue(errorMessage || "Invalid mobile number or password");
          case 404:
            return rejectWithValue(errorMessage || "Login service not found (404). Please try again later.");
          case 500:
            return rejectWithValue(errorMessage || "Server error. Please try again later.");
          default:
            return rejectWithValue(errorMessage || "An unexpected error occurred");
        }
      }

      if (axiosError.code === "ECONNABORTED" || axiosError.message === "Network Error") {
        return rejectWithValue("Network error. Please check your connection and try again.");
      }

      return rejectWithValue("Login failed. Please try again.");
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
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("userType");
      localStorage.removeItem("email");
      localStorage.removeItem("mobile");
      localStorage.removeItem("city");
      localStorage.removeItem("state");
      localStorage.removeItem("userId");
      localStorage.removeItem("photo");
      localStorage.removeItem("location");
      localStorage.removeItem("address");
      localStorage.removeItem("pincode");
      localStorage.removeItem("gst_number");
      localStorage.removeItem("rera_number");
      localStorage.removeItem("company_name");
      localStorage.removeItem("company_number");
      localStorage.removeItem("company_address");
      localStorage.removeItem("representative_name");
      localStorage.removeItem("pan_card_number");
      localStorage.removeItem("aadhar_number");
      localStorage.removeItem("created_by");
      localStorage.removeItem("created_user_id");
      localStorage.removeItem("created_user_type");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("name", action.payload.user.name);
        localStorage.setItem("userType", action.payload.user.user_type.toString());
        localStorage.setItem("email", action.payload.user.email);
        localStorage.setItem("mobile", action.payload.user.mobile);
        localStorage.setItem("city", action.payload.user.city);
        localStorage.setItem("state", action.payload.user.state);
        localStorage.setItem("userId", action.payload.user.id.toString());
        localStorage.setItem("photo", action.payload.user.photo || "");
        localStorage.setItem("location", action.payload.user.location || "");
        localStorage.setItem("address", action.payload.user.address || "");
        localStorage.setItem("pincode", action.payload.user.pincode || "");
        localStorage.setItem("gst_number", action.payload.user.gst_number || "");
        localStorage.setItem("rera_number", action.payload.user.rera_number || "");
        localStorage.setItem("company_name", action.payload.user.company_name || "");
        localStorage.setItem("company_number", action.payload.user.company_number || "");
        localStorage.setItem("company_address", action.payload.user.company_address || "");
        localStorage.setItem("representative_name", action.payload.user.representative_name || "");
        localStorage.setItem("pan_card_number", action.payload.user.pan_card_number || "");
        localStorage.setItem("aadhar_number", action.payload.user.aadhar_number || "");
        localStorage.setItem("created_by", action.payload.user.created_by || "");
        localStorage.setItem("created_user_id", action.payload.user.created_user_id?.toString() || "");
        localStorage.setItem("created_user_type", action.payload.user.created_user_type?.toString() || "");
      })
      .addCase(loginUser.rejected, (state, action) => {
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

export const { logout } = authSlice.actions;
export default authSlice.reducer;