import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import Button from "../../components/ui/button/Button";
import { RootState, AppDispatch } from "../../store/store";
import {
  getUserById,
  clearUsers,
  getEmpProfile,
} from "../../store/slices/userslice";

const statusText = (status: number) => {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    default:
      return "Inactive";
  }
};

const statusClass = (status: number) => {
  switch (status) {
    case 0:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case 2:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case 3:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  }
};

const EmployeeDetail = () => {
  const { id, status } = useParams<{ id: string; status: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { selectedUserEmp, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      dispatch(getEmpProfile({ user_id: id }));
    }

    return () => {
      dispatch(clearUsers());
    };
  }, [isAuthenticated, user, id, dispatch]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600 dark:text-gray-400">
        Loading employee details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            dispatch(
              getUserById({
                user_id: id,
              })
            )
          }
          className="ml-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!selectedUserEmp) {
    return (
      <div className="p-4 text-center text-gray-600 dark:text-gray-400">
        Employee not found
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
          Employee Details - {selectedUserEmp.name}
        </h1>
        <Button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-gray-300  dark:bg-gray-800 dark:border-gray-700 dark:text-black dark:hover:bg-gray-700 transition-all"
        >
          Back
        </Button>
      </div>

      <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-8">
          <Info label="Name" value={selectedUserEmp.name} />

          <Info label="Mobile" value={selectedUserEmp.mobile} />
          <Info label="Email" value={selectedUserEmp.email} />
          <Info label="City" value={selectedUserEmp.city} />
          <Info label="State" value={selectedUserEmp.state} />
          <Info label="Pincode" value={selectedUserEmp.pincode} />

          <Info
            label="Created By"
            value={selectedUserEmp.created_by || "N/A"}
          />

          <Info
            label="Created On"
            value={new Date(selectedUserEmp.created_date).toLocaleDateString(
              "en-IN",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          />
          <Info
            label="Created Time"
            value={selectedUserEmp.created_time || "N/A"}
          />
        </div>
      </div>
    </div>
  );
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-base font-medium text-gray-900 dark:text-white">
      {value}
    </p>
  </div>
);

export default EmployeeDetail;
