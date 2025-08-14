import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
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
  const { error } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const queryToken = searchParams.get("url");
  const [isLoading, setIsLoading] = useState(!!queryToken);
  const [isValidUser, setIsValidUser] = useState(false);
  const [hasProcessedToken, setHasProcessedToken] = useState(false);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  useEffect(() => {
    if (!queryToken || hasProcessedToken) return;
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
          navigate("/");
        } else {
          navigate("/signin");
        }
      } catch (err) {
        console.error("Token processing error:", err);
      } finally {
        setHasProcessedToken(true);
        setIsLoading(false);
      }
    };
    processToken();
  }, [queryToken, dispatch, hasProcessedToken, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (hasProcessedToken && isValidUser) {
    return <Outlet />;
  }
  return <Navigate to="/signin" replace state={{ from: location }} />;
};
export default ProtectedRoute;
