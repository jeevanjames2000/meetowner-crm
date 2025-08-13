import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../store/store";
import { getUserById, isTokenExpired, logout } from "../store/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

interface JwtPayload {
  user_id: number;
}
const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token, error } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryToken = searchParams.get("url");

  const [hasProcessedToken, setHasProcessedToken] = useState(false);

  useEffect(() => {
    // Handle query token
    if (queryToken && !hasProcessedToken) {
      try {
        const decoded: JwtPayload = jwtDecode<JwtPayload>(queryToken);

        const userId = decoded.user_id;

        if (userId) {
          dispatch(getUserById({ userId, token: queryToken }))
            .unwrap()
            .then((res) => {
              setHasProcessedToken(true);
              if (res?.user) {
                window.history.replaceState({}, "", "/"); // remove query params
              }
            })
            .catch((err) => {
              toast.error(err || "Failed to authenticate with token");
            });

        } else {
          toast.error("Invalid token: No userId found");
        }
      } catch (err) {
        console.error("Token decode error:", err);
        toast.error("Invalid token format");
      }
    }
  }, [queryToken, dispatch, hasProcessedToken]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!isAuthenticated || (token && isTokenExpired(token))) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
