import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import { AppDispatch, RootState } from "../store/store";
import { getUserProfile } from "../store/slices/userslice";

const BUILDER_USER_TYPE = 2; 

export default function UserProfiles() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, loading, error } = useSelector((state: RootState) => state.user);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const profileParams = useMemo(() => {
    if (!isAuthenticated || !user?.id || !user?.user_type) {
      return null;
    }
    if (user.user_type === BUILDER_USER_TYPE) {
      return {
        admin_user_id: user.id,
        admin_user_type: user.user_type,
      };
    } else {
      return {
        admin_user_id: user.created_user_id,
        admin_user_type: BUILDER_USER_TYPE,
        emp_id: user.id,
        emp_user_type: user.user_type,
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (profileParams) {
      dispatch(getUserProfile(profileParams))
        .unwrap()
        .catch((err) => {
          toast.error(err || "Failed to fetch user profile");
        });
    } else if (isAuthenticated && user) {
      toast.error("Invalid user data for fetching profile");
      console.warn("Invalid user data:", {
        id: user.id,
        user_type: user.user_type,
        created_user_id: user.created_user_id,
      });
    }
  }, [profileParams, dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <PageMeta title="Meet Owner Admin Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </>
  );
}