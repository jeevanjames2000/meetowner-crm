import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { AppDispatch, RootState } from "../store/store";
import {
  getUserById,
  isTokenExpired,
  setToken,
} from "../store/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

interface JwtPayload {
  user_id: number;
}

const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();
  const navigate = useNavigate();
  const queryToken = useMemo(
    () => new URLSearchParams(location.search).get("url"),
    [location.search]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const hasProcessedTokenRef = useRef(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (!queryToken || hasProcessedTokenRef.current) return;
    setIsLoading(true);
    const processToken = async () => {
      try {
        if (isTokenExpired(queryToken)) {
          throw new Error("Token has expired");
        }
        const decoded: JwtPayload = jwtDecode<JwtPayload>(queryToken);
        const userId = decoded.user_id;
        if (!userId) {
          throw new Error("Invalid token: No user_id found");
        }
        const res = await dispatch(
          getUserById({ userId, token: queryToken })
        ).unwrap();
        if (res?.user?.crm_access === 1) {
          await dispatch(setToken(queryToken));
          setIsValidUser(true);
          if (location.pathname !== "/") {
            navigate("/", { replace: true });
          }
        } else if (location.pathname !== "/signin") {
          navigate("/signin", { replace: true });
        }
      } catch (err) {
        console.error("Token processing error:", err);
        if (location.pathname !== "/signin") {
          navigate("/signin", { replace: true });
        }
      } finally {
        hasProcessedTokenRef.current = true;
        setIsLoading(false);
      }
    };
    processToken();
  }, [queryToken, dispatch, navigate, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isAuthenticated || isValidUser) {
    return <Outlet />;
  }
  return <Navigate to="/signin" replace state={{ from: location }} />;
};

export default ProtectedRoute;
