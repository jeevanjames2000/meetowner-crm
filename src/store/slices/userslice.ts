import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import ngrokAxiosInstance from "../../hooks/AxiosInstance";
import { ErrorResponse, UserCount, UserCountResponse, User, UsersResponse, UserState, UpdateUserStatusResponse, UpdateUserStatusRequest, DeleteUserResponse } from "../../types/UserModel";
import axiosIstance from "../../hooks/AxiosInstance";


export interface InsertUserRequest {
  user_type: number;
  name: string;
  mobile: string;
  email:string;
  password: string;
  status: number;
  state: string;
  city: string;
  location: string;
  address: string;
  pincode: string;
  gst_number?: string; 
  rera_number?: string; 
  created_by: string;
  created_user_id: number;
  created_user_type:number;
  company_name?: string;
  company_number?: string; 
  company_address?: string; 
  representative_name?: string; 
  pan_card_number?: string; 
  aadhar_number?: string;
  photo?:string;
  account_number:string;
  ifsc_code:string;
  company_logo?:string;
}

export interface InsertUserResponse {
  message: string;
  user_id: number;
}

const initialState: UserState = {
  userCounts: null,
  users: null,
  selectedUser: null,
  loading: false,
  error: null,
};


export const insertUser = createAsyncThunk<
  InsertUserResponse,
  FormData,
  { rejectValue: string }
>(
  "user/insertUser",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const response = await axiosIstance.post<InsertUserResponse>(
        `/meetCRM/v2/createEmp`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Insert user error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 400:
            return rejectWithValue("Invalid user data provided");
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 409:
            return rejectWithValue("User with this mobile number already exists");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to insert user");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);


export const getTypesCount = createAsyncThunk<
  UserCount[],
  { admin_user_id: number; admin_user_type: number; emp_id?: number; emp_user_type?: number },
  { rejectValue: string }
>(
  "user/getTypesCount",
  async ({ admin_user_id, admin_user_type, emp_id, emp_user_type }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const queryParams = new URLSearchParams({
        admin_user_id: admin_user_id.toString(),
        admin_user_type: admin_user_type.toString(),
        ...(emp_id !== undefined && { emp_id: emp_id.toString() }),
        ...(emp_user_type !== undefined && { emp_user_type: emp_user_type.toString() }),
      });

      const response = await ngrokAxiosInstance.get<UserCountResponse>(
        `/api/v1/getTypesCount?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get types count error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("User count service not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch user counts");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const getUsersByType = createAsyncThunk<
  User[],
  { created_user_id: number; user_type: number },
  { rejectValue: string }
>(
  "user/getUsersByType",
  async ({ created_user_id,user_type }, { rejectWithValue }) => {
    try {
      const response = await ngrokAxiosInstance.get<UsersResponse>(
        `/meetCRM/v2/getUsersTypeandCreatedBy?created_user_id=${created_user_id}&user_type=${user_type}`,
       
      );
console.log("getUsersByType response:", response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get users by type error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("Users not found for this type");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch users");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const getUserById = createAsyncThunk<
  User,
  { admin_user_id: number; emp_user_type: number; emp_user_id: number },
  { rejectValue: string }
>(
  "user/getUserById",
  async ({ admin_user_id, emp_user_type, emp_user_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const response = await ngrokAxiosInstance.get<UsersResponse>(
        `/api/v1/getUsersTypesByBuilder?admin_user_id=${admin_user_id}&emp_user_type=${emp_user_type}&emp_user_id=${emp_user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        return rejectWithValue("User not found");
      }

      return response.data.data[0];
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
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch user details");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const updateUserStatus = createAsyncThunk<
  UpdateUserStatusResponse,
  UpdateUserStatusRequest,
  { rejectValue: string }
>(
  "user/updateUserStatus",
  async (userStatusData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      // Validate feedback for status: 2
      if (userStatusData.status === 2 && !userStatusData.feedback?.trim()) {
        return rejectWithValue("Feedback is required when rejecting a user (status: 2)");
      }

      const response = await ngrokAxiosInstance.post<UpdateUserStatusResponse>(
        `/api/v1/updateuserstatus`,
        userStatusData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Update user status error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 400:
            return rejectWithValue("Invalid user status data provided");
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("User not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to update user status");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const getUserProfile = createAsyncThunk<
  User,
  { admin_user_id: number; admin_user_type: number; emp_id?: number; emp_user_type?: number },
  { rejectValue: string }
>(
  "user/getUserProfile",
  async ({ admin_user_id, admin_user_type, emp_id, emp_user_type }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const queryParams = new URLSearchParams({
        admin_user_id: admin_user_id.toString(),
        admin_user_type: admin_user_type.toString(),
        ...(emp_id !== undefined && { emp_id: emp_id.toString() }),
        ...(emp_user_type !== undefined && { emp_user_type: emp_user_type.toString() }),
      });

      const response = await ngrokAxiosInstance.get<UsersResponse>(
        `/api/v1/getuserprofile?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        return rejectWithValue("User not found");
      }

      return response.data.data[0]; // Return the first user from the data array
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get user profile error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 400:
            return rejectWithValue("Invalid query parameters provided");
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("User not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch user profile");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const deleteUser = createAsyncThunk<
  DeleteUserResponse,
  { id: number; created_user_id: number; created_user_type: number },
  { rejectValue: string }
>(
  "user/deleteUser",
  async ({ id, created_user_id, created_user_type }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const response = await ngrokAxiosInstance.delete<DeleteUserResponse>(
        `/api/v1/users/${id}`,
        {
          data: { created_user_id, created_user_type },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Delete user error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 400:
            return rejectWithValue("Invalid user ID or data provided");
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 403:
            return rejectWithValue("Forbidden: You do not have permission to delete this user");
          case 404:
            return rejectWithValue("User not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to delete user");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = null;
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
    
      .addCase(insertUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(insertUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(insertUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      .addCase(getTypesCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTypesCount.fulfilled, (state, action) => {
        state.loading = false;
        state.userCounts = action.payload;
      })
      .addCase(getTypesCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      .addCase(getUsersByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersByType.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsersByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
       .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
       .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
        if (state.users) {
          state.users = state.users.filter((user) => user.id !== state.selectedUser?.id);
        }
        state.selectedUser = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { clearUsers } = userSlice.actions;
export default userSlice.reducer;