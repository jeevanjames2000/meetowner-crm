
import { ReactNode } from "react";


// export interface RootState {
//   auth: {
//     isAuthenticated: boolean;
//     userType: string;
//   };
// }


export interface ProtectedRouteProps {
  children: ReactNode;
}


export interface ErrorResponse {
  error?: string; // Add error field to handle backend response
  message?: string;
}