export interface AroundThis {
  title: string;
  distance: string;
  create_date: string;
}

export interface Size {
  build_up_area: string;
  carpet_area: string;
  floor_plan: string | null;
  sqft_price: string;
  create_date: string;
}

export interface PaymentMode {
  payment_mode: string;
  create_date: string;
}

export interface Project {
  property_id: number;
  project_name: string;
  property_type: string;
  property_subtype: string;
  builder_name: string;
  state: string;
  city: string;
  locality: string;
  brochure: string | null;
  price_sheet: string | null;
  construction_status: 'Ready to Move' | 'Under Construction';
  possession_end_date: string | null;
  upcoming_project: 'Yes' | 'No';
  posted_by: string;
  user_id: string;
  rera_registered: 'Yes' | 'No';
  rera_number: string | null;
  launch_type: 'Pre Launch' | 'Soft Launch' | 'Launched';
  launched_date: string | null;
  created_date: string;
  stop_leads: 'Yes' | 'No' | null; // Added stop_leads
  sizes: Size[];
  around_this: AroundThis[];
  payment_modes: PaymentMode[];
}

export interface ProjectsResponse {
  message: string;
  data: Project[];
}

export interface InsertPropertyResponse {
  message: string;
  property_id: number;
}

export interface StopLeadsResponse {
  status: string;
  message: string;
}