// src/features/builder/builderSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import ngrokAxiosInstance from '../../hooks/AxiosInstance';
import {
  BuilderState,
  InsertBuilderQueryRequest,
  InsertBuilderQueryResponse,
  BuilderQueriesResponse,
  ErrorResponse,
  BuilderQuery,
} from '../../types/BuilderModel';

const initialState: BuilderState = {
  queries: null,
  loading: false,
  error: null,
};

export const createBuilderQuery = createAsyncThunk<
  InsertBuilderQueryResponse,
  InsertBuilderQueryRequest,
  { rejectValue: string }
>('builder/createBuilderQuery', async (queryData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No authentication token found. Please log in.');
    }

    const response = await ngrokAxiosInstance.post<InsertBuilderQueryResponse>(
      '/api/v1/postqueries',
      queryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Create builder query error:', axiosError);
    if (axiosError.response) {
      const status = axiosError.response.status;
      switch (status) {
        case 400:
          return rejectWithValue('Invalid query data provided');
        case 401:
          return rejectWithValue('Unauthorized: Invalid or expired token');
        case 404:
          return rejectWithValue('Admin or builder user not found');
        case 500:
          return rejectWithValue('Server error. Please try again later.');
        default:
          return rejectWithValue(axiosError.response.data?.error || 'Failed to create builder query');
      }
    }
    return rejectWithValue('Network error. Please check your connection and try again.');
  }
});

export const getBuilderQueries = createAsyncThunk<
  BuilderQuery[],
  { admin_user_id: number; admin_user_type: number },
  { rejectValue: string }
>('builder/getBuilderQueries', async ({ admin_user_id, admin_user_type }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No authentication token found. Please log in.');
    }

    const queryParams = new URLSearchParams({
      admin_user_id: admin_user_id.toString(),
      admin_user_type: admin_user_type.toString(),
    });

    const response = await ngrokAxiosInstance.get<BuilderQueriesResponse>(
      `/api/v1/allqueries?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.queries;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Get builder queries error:', axiosError);
    if (axiosError.response) {
      const status = axiosError.response.status;
      switch (status) {
        case 400:
          return rejectWithValue('Invalid query parameters provided');
        case 401:
          return rejectWithValue('Unauthorized: Invalid or expired token');
        case 404:
          return rejectWithValue('No queries found');
        case 500:
          return rejectWithValue('Server error. Please try again later.');
        default:
          return rejectWithValue(axiosError.response.data?.error || 'Failed to fetch builder queries');
      }
    }
    return rejectWithValue('Network error. Please check your connection and try again.');
  }
});

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    clearQueries: (state) => {
      state.queries = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBuilderQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBuilderQuery.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createBuilderQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      .addCase(getBuilderQueries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBuilderQueries.fulfilled, (state, action) => {
        state.loading = false;
        state.queries = action.payload;
      })
      .addCase(getBuilderQueries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { clearQueries } = builderSlice.actions;
export default builderSlice.reducer;