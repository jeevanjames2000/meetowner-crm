import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { AppDispatch, RootState } from "../store/store";
import { isTokenExpired, logout } from "../store/slices/authSlice";
const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const myParam = searchParams.get("token");
  console.log("myParam: ", myParam);
  const stateData = location.state;
  useEffect(() => {
    if (isAuthenticated && token && isTokenExpired(token)) {
      dispatch(logout());
    }
  }, [isAuthenticated, token, dispatch]);
  if (!isAuthenticated || (token && isTokenExpired(token))) {
    return <Navigate to="/signin" replace />;
  }
  console.log("Query Params:", Object.fromEntries(searchParams));
  console.log("Location State:", stateData);
  return <Outlet />;
};
export default ProtectedRoute;
