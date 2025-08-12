
export interface BuilderQuery {
  id: number;
  name: string;
  number: string;
  message: string;
  created_date: string;
  admin_user_id: number;
  admin_user_type: number;
  admin_name: string;
  added_user_id: number;
  added_user_type: number;
  added_user_name: string;
}

export interface InsertBuilderQueryRequest {
  name: string;
  number: string;
  message: string;
  admin_user_id: number;
  admin_user_type: number;
  added_user_id: number;
  added_user_type: number;
}

export interface InsertBuilderQueryResponse {
  status: string;
  message: string;
  query_id: number;
}

export interface BuilderQueriesResponse {
  status: string;
  message: string;
  queries: BuilderQuery[];
}

export interface ErrorResponse {
  error: string;
}

export interface BuilderState {
  queries: BuilderQuery[] | null;
  loading: boolean;
  error: string | null;
}