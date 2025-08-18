import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../store/store";
import {
  getUserById,
  isTokenExpired,
  setisAuthenticated,
  setToken,
} from "../store/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
interface JwtPayload {
  user_id: number;
}
const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    error,
    token: reduxToken,
    isAuthenticated,
  } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryToken = searchParams.get("url");
  const [isLoading, setIsLoading] = useState(!!queryToken);
  const [hasProcessedToken, setHasProcessedToken] = useState(false);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
  useEffect(() => {
    if (!queryToken || hasProcessedToken) return;
    const processToken = async () => {
      try {
        if (isTokenExpired(queryToken)) throw new Error("Token has expired");
        const decoded: JwtPayload = jwtDecode<JwtPayload>(queryToken);
        if (!decoded?.user_id)
          throw new Error("Invalid token: No user_id found");
        const res = await dispatch(
          getUserById({ userId: decoded.user_id, token: queryToken })
        ).unwrap();
        if (res?.user?.crm_access === 1) {
          dispatch(setToken(queryToken));
          dispatch(setisAuthenticated(true));
          localStorage.setItem("token", queryToken);
        }
      } catch (err) {
        console.error("Token processing error:", err);
      } finally {
        setHasProcessedToken(true);
        setIsLoading(false);
      }
    };
    processToken();
  }, [queryToken, dispatch, hasProcessedToken]);
  useEffect(() => {
    if (!reduxToken) {
      const storedToken = localStorage.getItem("token");
      if (storedToken && !isTokenExpired(storedToken)) {
        dispatch(setToken(storedToken));
        dispatch(setisAuthenticated(true));
      }
    }
  }, [reduxToken, dispatch]);
  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated && reduxToken && !isTokenExpired(reduxToken)) {
    return <Outlet />;
  }
  return <Navigate to="/signin" replace state={{ from: location }} />;
};
export default ProtectedRoute;
