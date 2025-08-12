
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router";

import { useEffect } from "react";
import { AppDispatch, RootState } from "../store/store";
import { isTokenExpired, logout } from "../store/slices/authSlice";

const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  
  useEffect(() => {
    if (isAuthenticated && token && isTokenExpired(token)) {
      dispatch(logout());
    }
  }, [isAuthenticated, token, dispatch]);

  
  if (!isAuthenticated || (token && isTokenExpired(token))) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;