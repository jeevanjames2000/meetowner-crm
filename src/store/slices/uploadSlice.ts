// src/store/slices/uploadSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import  { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface UploadResponse {
  message: string;
  url: string;
}

interface ErrorResponse {
  message?: string;
}

export interface UploadState {
  uploadLoading: boolean;
  uploadError: string | null;
  uploadSuccess: string | null;
  uploadedImageUrl: string | null;
}

const initialState: UploadState = {
  uploadLoading: false,
  uploadError: null,
  uploadSuccess: null,
  uploadedImageUrl: null,
};

// Async Thunk to upload user image to AWS S3
export const uploadUserImage = createAsyncThunk(
  "upload/uploadUserImage",
  async (
    { user_id, image }: { user_id: number; image: File },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("user_id", user_id.toString());
      formData.append("image", image);

      const promise = axiosInstance.post<UploadResponse>(
        "/awsS3/uploadUserImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.promise(promise, {
        loading: "Uploading image...",
        success: "Image uploaded successfully!",
        error: "Failed to upload image",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Upload image error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to upload images");
          case 400:
            return rejectWithValue(
              axiosError.response.data?.message || "Invalid image data"
            );
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to upload image"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    clearUploadMessages: (state) => {
      state.uploadError = null;
      state.uploadSuccess = null;
      state.uploadedImageUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadUserImage.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = null;
        state.uploadedImageUrl = null;
      })
      .addCase(uploadUserImage.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = action.payload.message;
        state.uploadedImageUrl = action.payload.url;
      })
      .addCase(uploadUserImage.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload as string;
      });
  },
});

export const { clearUploadMessages } = uploadSlice.actions;
export default uploadSlice.reducer;