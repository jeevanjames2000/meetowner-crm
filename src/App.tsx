import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { Toaster } from "react-hot-toast";
import { lazy } from "react";

import EmployeesScreen from "./pages/Employee Management/EmployeesScreen";
import AddNewLead from "./pages/Lead Management/AddNewLeads";
import ViewLeadDetails from "./pages/Lead Management/ViewLeadDetails";
import EmployeeDetail from "./pages/Employee Management/EmployeeDetail";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import ProtectedRoute from "./hooks/ProtectedRoute";
import { isTokenExpired } from "./store/slices/authSlice";
import CreateEmployee from "./pages/Employee Management/CreateEmployee";
import AllLeadDetails from "./pages/Lead Management/AllLeadDetails";
import AssignLeadEmployeePage from "./pages/Lead Management/AssignLeadToEmployee";
import MarkBookingPage from "./pages/Lead Management/MarkBookingDone";
import AllCpLeadDetails from "./pages/Lead Management/CpLeads";
import EmpLeads from "./pages/Lead Management/EmpLeads";
import OpenLeads from "./pages/Lead Management/OpenLeads";
import EditEmployee from "./pages/Employee Management/EditEmployee";
const LeadsType = lazy(() => import("./pages/Lead Management/LeadsType"));

export default function App() {
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <>
      <Router>
        <ScrollToTop />

        <Routes>
          <Route  element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              <Route path="/leads/:lead_in/:status" element={<LeadsType />} />
              <Route path="/openLeads" element={<OpenLeads />} />

              <Route path="/leads/addlead" element={<AddNewLead />} />
              <Route path="/leads/view" element={<ViewLeadDetails />} />

              <Route path="/lead/allLeads" element={<AllLeadDetails />} />
              <Route path="/lead/Leads" element={<AllCpLeadDetails />} />
              <Route path="/lead/EmpLeads" element={<EmpLeads />} />
              <Route
                path="/leads/assign/:leadId"
                element={<AssignLeadEmployeePage />}
              />

              <Route path="/leads/book/:leadId" element={<MarkBookingPage />} />

              <Route path="/employee/:status" element={<EmployeesScreen />} />
              <Route path="/create-employee" element={<CreateEmployee />} />
              <Route path="/edit-employee/:status/:id" element={<EditEmployee />} />
              <Route
                path="/employeedetails/:status/:id"
                element={<EmployeeDetail />}
              />
              
            </Route>
          </Route>
          <Route
            path="/signin"
            element={
              isAuthenticated && token && !isTokenExpired(token) ? (
                <Navigate to="/" replace />
              ) : (
                <SignIn />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{ duration: 3000, style: { zIndex: 9999 } }}
          containerStyle={{ top: "5rem" }}
        />
      </Router>
    </>
  );
}
