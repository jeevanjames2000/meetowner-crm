import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ngrokAxiosInstance from '../../hooks/AxiosInstance';
import { Project, ProjectsResponse, InsertPropertyResponse } from '../../types/ProjectModel';

interface ProjectState {
  ongoingProjects: Project[];
  upcomingProjects: Project[];
  allProjects: Project[];
  stoppedProjects: Project[]; // New field for stopped properties
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  ongoingProjects: [],
  upcomingProjects: [],
  allProjects: [],
  stoppedProjects: [], // Initialize new field
  selectedProject: null,
  loading: false,
  error: null,
};

// Insert Property Thunk (unchanged)
export const insertProperty = createAsyncThunk<
  InsertPropertyResponse,
  FormData,
  { rejectValue: string }
>(
  'projects/insertProperty',
  async (formData, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No authentication token found. Please log in.');
    }
    try {
      const response = await ngrokAxiosInstance.post<InsertPropertyResponse>(
        '/api/v1/insertproperty',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to insert property'
      );
    }
  }
);




export const fetchAllProjects = createAsyncThunk<
  ProjectsResponse,
  { admin_user_type: number; admin_user_id: number },
  { rejectValue: string }
>(
  'projects/fetchAllProjects',
  async ({ user_id }, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No authentication token found. Please log in.');
    }
    try {
      const response = await ngrokAxiosInstance.get<ProjectsResponse>(
        `/meetCRM/v2/leads/getAllPropertiesByUserId?user_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data.properties;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all projects'
      );
    }
  }
);



const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjects(state) {
      state.ongoingProjects = [];
      state.upcomingProjects = [];
      state.allProjects = [];
      state.stoppedProjects = [];
      state.selectedProject = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(insertProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(insertProperty.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(insertProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
    
      .addCase(fetchAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action: PayloadAction<ProjectsResponse>) => {
        state.loading = false;
        state.allProjects = action.payload;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
     
  },
});

export const { clearProjects } = projectSlice.actions;
export default projectSlice.reducer;



