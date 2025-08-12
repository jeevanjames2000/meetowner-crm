import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import ngrokAxiosInstance from "../../hooks/AxiosInstance";
import { ErrorResponse, Lead, LeadsResponse, LeadUpdate, LeadUpdatesResponse, LeadState, LeadStatusResponse, LeadStatus, LeadSourceResponse, LeadSource, InsertLeadResponse, AssignLeadResponse, BookingDoneResponse, UpdateLeadByEmployeeResponse } from "../../types/LeadModel";

const initialState: LeadState = {
  leads: null,
  cpLeads: null,
  leadUpdates: null,
  bookedLeads: null,
  leadStatuses: null, 
  leadSources: null, 
  loading: false,
  error: null,
};

export const getLeadsByUser = createAsyncThunk<
  Lead[],
  {
    lead_added_user_type: number;
    lead_added_user_id: number;
    assigned_user_type?: number;
    assigned_id?: number;
    status_id?: number; 
  },
  { rejectValue: string }
>(
  "lead/getLeadsByUser",
  async (
    { lead_added_user_type, lead_added_user_id, assigned_user_type, assigned_id, status_id },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const queryParams = new URLSearchParams({
        lead_added_user_type: lead_added_user_type.toString(),
        lead_added_user_id: lead_added_user_id.toString(),
        ...(assigned_user_type && { assigned_user_type: assigned_user_type.toString() }),
        ...(assigned_id && { assigned_id: assigned_id.toString() }),
        ...(status_id !== undefined && { status_id: status_id.toString() }), // Conditionally include status_id
      });

      const response = await ngrokAxiosInstance.get<LeadsResponse>(
        `/api/v1/getLeadsByUser?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.results || response.data.results.length === 0) {
        return rejectWithValue("No leads found");
      }

      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get leads by user error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("No leads found for this user");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch leads");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);
export const getLeadsByID = createAsyncThunk<
  Lead[],
  {
    lead_added_user_type: number;
    lead_added_user_id: number;
    lead_source_user_id:number;
    assigned_user_type?: number;
    assigned_id?: number;
    status_id?: number; 
  },
  { rejectValue: string }
>(
  "lead/getLeadsByID",
  async (
    { lead_added_user_type, lead_added_user_id, assigned_user_type, assigned_id, status_id },
    { rejectWithValue }
  ) => {
    console.log("assigned_id: ", assigned_id);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const queryParams = new URLSearchParams({
        lead_added_user_type: lead_added_user_type.toString(),
        lead_added_user_id: lead_added_user_id.toString(),
        lead_source_user_id: assigned_id.toString(),
        assigned_id: assigned_id.toString(),
        ...(assigned_user_type && { assigned_user_type: assigned_user_type.toString() }),
        ...(status_id !== undefined && { status_id: status_id.toString() }), 
      });

      console.log("queryParams: ", queryParams);
      const response = await ngrokAxiosInstance.get<LeadsResponse>(
        `/api/v1/leads/getLeadsChannelPartner?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.results || response.data.results.length === 0) {
        return rejectWithValue("No leads found");
      }

      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get leads by user error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("No leads found for this user");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch leads");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const getLeadUpdatesByLeadId = createAsyncThunk<
  LeadUpdate[],
  {
    lead_id: number;
    lead_added_user_type: number;
    lead_added_user_id: number;
  },
  { rejectValue: string }
>(
  "lead/getLeadUpdatesByLeadId",
  async ({ lead_id, lead_added_user_type, lead_added_user_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const queryParams = new URLSearchParams({
        lead_id: lead_id.toString(),
        lead_added_user_type: lead_added_user_type.toString(),
        lead_added_user_id: lead_added_user_id.toString(),
      });

      const response = await ngrokAxiosInstance.get<LeadUpdatesResponse>(
        `/api/v1/leads/getLeadUpdatesByLeadId?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.results || response.data.results.length === 0) {
        return rejectWithValue("No lead updates found");
      }

      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get lead updates by lead ID error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("No updates found for this lead");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch lead updates");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);


export const getBookedLeads = createAsyncThunk<
  Lead[],
  {
    lead_added_user_id: number;
    lead_added_user_type: number;
    assigned_user_type?: number; // Made optional
    assigned_id?: number; // Made optional
  },
  { rejectValue: string }
>(
  "lead/getBookedLeads",
  async (
    { lead_added_user_id, lead_added_user_type, assigned_user_type, assigned_id },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const queryParams = new URLSearchParams({
        lead_added_user_id: lead_added_user_id.toString(),
        lead_added_user_type: lead_added_user_type.toString(),
        ...(assigned_user_type !== undefined && { assigned_user_type: assigned_user_type.toString() }),
        ...(assigned_id !== undefined && { assigned_id: assigned_id.toString() }),
      });

      console.log("getBookedLeads query params:", queryParams.toString()); // Debug log

      const response = await ngrokAxiosInstance.get<LeadsResponse>(
        `/api/v1/leads/bookedleads?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.results || response.data.results.length === 0) {
        return rejectWithValue("No booked leads found");
      }

      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get booked leads error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("No booked leads found for this user");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch booked leads");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const getLeadStatuses = createAsyncThunk<
  LeadStatus[],
  void,
  { rejectValue: string }
>(
  "lead/getLeadStatuses",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const response = await ngrokAxiosInstance.get<LeadStatusResponse>(
        `/api/v1/leads/leadstatus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.results || response.data.results.length === 0) {
        return rejectWithValue("No lead statuses found");
      }

      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get lead statuses error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("No lead statuses found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch lead statuses");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const getLeadSources = createAsyncThunk<
  LeadSource[],
  void,
  { rejectValue: string }
>(
  "lead/getLeadSources",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const response = await ngrokAxiosInstance.get<LeadSourceResponse>(
        `/api/v1/leads/leadsource`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.results || response.data.results.length === 0) {
        return rejectWithValue("No lead sources found");
      }

      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get lead sources error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 404:
            return rejectWithValue("No lead sources found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to fetch lead sources");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const insertLead = createAsyncThunk<
  InsertLeadResponse,
  {
    customer_name: string;
    customer_phone_number: string;
    customer_email: string;
    interested_project_id: number;
    interested_project_name: string;
    lead_source_id: number;
    sqft: string;
    budget: string;
    lead_added_user_type: number;
    lead_added_user_id: number;
    assigned_user_type?: number;
    assigned_id?: number;
    assigned_name?: string;
    assigned_emp_number?: string;
    lead_source_user_id?:number;
  },
  { rejectValue: string }
>(
  "lead/insertLead",
  async (leadData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }
      const payload: any = {
        customer_name: leadData.customer_name,
        customer_phone_number: leadData.customer_phone_number,
        customer_email: leadData.customer_email,
        interested_project_id: leadData.interested_project_id,
        interested_project_name: leadData.interested_project_name,
        lead_source_id: leadData.lead_source_id,
        lead_source_user_id:leadData.lead_source_user_id,
        sqft: leadData.sqft,
        budget: leadData.budget,
        lead_added_user_type: leadData.lead_added_user_type,
        lead_added_user_id: leadData.lead_added_user_id,
      };

  
      if (leadData.lead_source_id === 6) {
        if (
          !leadData.assigned_user_type ||
          !leadData.assigned_id ||
          !leadData.assigned_name ||
          !leadData.assigned_emp_number
        ) {
          return rejectWithValue("All assigned fields are required for lead source ID 6");
        }
        payload.assigned_user_type = leadData.assigned_user_type;
        payload.assigned_id = leadData.assigned_id;
        payload.assigned_name = leadData.assigned_name;
        payload.assigned_emp_number = leadData.assigned_emp_number;
      }

      const response = await ngrokAxiosInstance.post<InsertLeadResponse>(
        `/api/v1/insertLead`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status !== "success") {
        return rejectWithValue(response.data.message || "Failed to insert lead");
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Insert lead error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 400:
            return rejectWithValue(axiosError.response.data?.message || "Invalid lead data provided");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to insert lead");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const assignLeadToEmployee = createAsyncThunk<
  AssignLeadResponse,
  {
    lead_id: number;
    assigned_user_type: number;
    assigned_id: number;
    assigned_name: string;
    assigned_emp_number: string;
    assigned_priority: string;
    followup_feedback: string;
    next_action: string;
    lead_added_user_type: number;
    lead_added_user_id: number;
    status_id?: number;
  },
  { rejectValue: string }
>(
  "lead/assignLeadToEmployee",
  async (assignData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

     
      const payload = {
        ...assignData,
        status_id: assignData.status_id !== undefined ? assignData.status_id : 1,
      };

      const response = await ngrokAxiosInstance.post<AssignLeadResponse>(
        `/api/v1/leads/assignLeadToEmployee`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status !== "success") {
        return rejectWithValue(response.data.message || "Failed to assign lead");
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Assign lead error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 400:
            return rejectWithValue("Invalid lead data provided");
          case 404:
            return rejectWithValue("Lead not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to assign lead");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

export const markLeadAsBooked = createAsyncThunk<
  BookingDoneResponse,
  {
    lead_id: number;
    lead_added_user_type: number;
    lead_added_user_id: number;
    property_id: number;
    flat_number: string;
    floor_number: string;
    block_number: string;
    asset: string;
    sqft: string;
    budget: string;
  },
  { rejectValue: string }
>(
  'lead/markLeadAsBooked',
  async (
    {
      lead_id,
      lead_added_user_type,
      lead_added_user_id,
      property_id,
      flat_number,
      floor_number,
      block_number,
      asset,
      sqft,
      budget,
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No authentication token found. Please log in.');
      }

      const payload = {
        lead_id,
        lead_added_user_type,
        lead_added_user_id,
        property_id,
        flat_number,
        floor_number,
        block_number,
        asset,
        sqft,
        budget,
      };

      const response = await ngrokAxiosInstance.post<BookingDoneResponse>(
        '/api/v1/leads/bookingdone',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status !== 'success') {
        return rejectWithValue(response.data.message || 'Failed to mark lead as booked');
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Mark lead as booked error:', axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue('Unauthorized: Invalid or expired token');
          case 400:
            return rejectWithValue(axiosError.response.data?.message || 'Invalid lead or booking data provided');
          case 404:
            return rejectWithValue(axiosError.response.data?.message || 'Lead not found');
          case 500:
            return rejectWithValue('Server error. Please try again later.');
          default:
            return rejectWithValue(axiosError.response.data?.message || 'Failed to mark lead as booked');
        }
      }
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

export const updateLeadByEmployee = createAsyncThunk<
  UpdateLeadByEmployeeResponse,
  {
    lead_id: number;
    follow_up_feedback: string;
    next_action: string;
    status_id: number;
    updated_by_emp_type: number;
    updated_by_emp_id: number;
    updated_by_emp_name: string;
    updated_emp_phone: string;
    lead_added_user_type: number;
    lead_added_user_id: number;
  },
  { rejectValue: string }
>(
  "lead/updateLeadByEmployee",
  async (updateData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const response = await ngrokAxiosInstance.post<UpdateLeadByEmployeeResponse>(
        `/api/v1/leads/updateLeadByEmployee`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status !== "success") {
        return rejectWithValue(response.data.message || "Failed to update lead");
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Update lead by employee error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized: Invalid or expired token");
          case 400:
            return rejectWithValue("Invalid lead data provided");
          case 404:
            return rejectWithValue("Lead not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(axiosError.response.data?.message || "Failed to update lead");
        }
      }
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);


const leadSlice = createSlice({
  name: "lead",
  initialState,
  reducers: {
    clearLeads: (state) => {
      state.leads = null;
      state.leadUpdates = null;
      state.bookedLeads = null;
      state.leadStatuses = null; 
      state.leadSources = null; 
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeadsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(getLeadsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      }) .addCase(getLeadsByID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadsByID.fulfilled, (state, action) => {
        state.loading = false;
        state.cpLeads = action.payload;
      })
      .addCase(getLeadsByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getLeadUpdatesByLeadId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadUpdatesByLeadId.fulfilled, (state, action) => {
        state.loading = false;
        state.leadUpdates = action.payload;
      })
      .addCase(getLeadUpdatesByLeadId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getBookedLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookedLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.bookedLeads = action.payload;
      })
      .addCase(getBookedLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getLeadStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.leadStatuses = action.payload;
      })
      .addCase(getLeadStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(getLeadSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadSources.fulfilled, (state, action) => {
        state.loading = false;
        state.leadSources = action.payload;
      })
      .addCase(getLeadSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
       .addCase(insertLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(insertLead.fulfilled, (state) => {
        state.loading = false;
        
      })
      .addCase(insertLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(assignLeadToEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignLeadToEmployee.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data && state.leads) {
          state.leads = state.leads.map((lead) =>
            lead.lead_id === action.payload.data.lead_id ? action.payload.data : lead
          );
        }
      })
      .addCase(assignLeadToEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

       .addCase(markLeadAsBooked.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markLeadAsBooked.fulfilled, (state, action) => {
        state.loading = false;
        if (state.leads) {
          state.leads = state.leads.filter((lead) => lead.lead_id !== action.payload.lead_id);
        }
        
      })
      .addCase(markLeadAsBooked.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateLeadByEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeadByEmployee.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateLeadByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLeads } = leadSlice.actions;
export default leadSlice.reducer;