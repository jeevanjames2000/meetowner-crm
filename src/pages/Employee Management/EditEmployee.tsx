import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { User, Mail, MapPin } from "lucide-react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Dropdown from "../../components/form/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  getUserProfile,
  updateEmployee,
  UpdateEmployeeRequest,
} from "../../store/slices/userslice";
import { fetchAllCities, fetchAllStates } from "../../store/slices/places";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import toast from "react-hot-toast";
interface FormData {
  name: string;
  mobile: string;
  email: string;
  designation: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  user_type: number;
  id: number;
}
interface Errors {
  name?: string;
  mobile?: string;
  email?: string;
  designation?: string;
  city?: string;
  state?: string;
  pincode?: string;
  locality?: string;
}
interface Option {
  value: string;
  text: string;
}
const allDesignationOptions = [
  { value: "2", text: "Sales Manager" },
  { value: "3", text: "Telecaller" },
  { value: "4", text: "Marketing Executive" },
];
const userTypeMap: { [key: number]: string } = {
  2: "Sales Manager",
  3: "Telecaller",
  4: "Marketing Executive",
};
const EditEmployee: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user_id, status } = useParams<{ user_id: string; status: string }>();
  const pageUserType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const { cities, states } = useSelector((state: RootState) => state.places);
  const {
    selectedUser,
    loading: profileLoading,
    error: profileError,
  } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState<FormData>({
    id: 0,
    name: "",
    mobile: "",
    email: "",
    designation: "",
    city: "",
    state: "",
    pincode: "",
    locality: "",
    user_type: 0,
  });
  const [errors, setErrors] = useState<Errors>({});
  const designationOptions: Option[] =
    pageUserType === 7
      ? allDesignationOptions.filter((option) => option.value !== "7")
      : allDesignationOptions;
  const stateOptions = useMemo(
    () =>
      states
        .filter(
          (state) =>
            state.name &&
            typeof state.name === "string" &&
            state.name.trim() !== ""
        )
        .map((state) => ({ value: state.name, text: state.name })),
    [states]
  );
  const cityOptions = useMemo(
    () =>
      cities
        .filter(
          (city) =>
            city.name &&
            typeof city.name === "string" &&
            city.name.trim() !== ""
        )
        .map((city) => ({ value: city.name, text: city.name })),
    [cities]
  );
  useEffect(() => {
    dispatch(fetchAllStates()).then((result) => {
      if (fetchAllStates.rejected.match(result)) {
        toast.error("Failed to load states.");
      }
    });
  }, [dispatch]);
  useEffect(() => {
    if (formData.state) {
      dispatch(fetchAllCities({ state: formData.state })).then((result) => {
        if (fetchAllCities.rejected.match(result)) {
          toast.error("Failed to load cities.");
        }
      });
    }
  }, [dispatch, formData.state]);
  useEffect(() => {
    if (user_id) {
      dispatch(getUserProfile({ user_id: Number(user_id) }));
    }
  }, [dispatch, user_id]);
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        id: selectedUser.id || 0,
        name: selectedUser.name || "",
        mobile: selectedUser.mobile || "",
        email: selectedUser.email || "",
        designation: String(selectedUser.user_type || ""),
        city: selectedUser.city || "",
        state: selectedUser.state || "",
        pincode: selectedUser.pincode || "",
        locality: selectedUser.location || "",
        user_type: selectedUser.user_type || 0,
      });
    }
  }, [selectedUser]);
  useEffect(() => {
    if (profileError) {
      toast.error(`Failed to fetch employee data: ${profileError}`);
      setTimeout(() => {
        navigate(`/employees/${status}`);
      }, 2000);
    }
  }, [profileError, navigate, status]);
  const handleChange = useCallback(
    (field: keyof FormData) => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        ...(field === "state" ? { city: "", locality: "" } : {}),
        ...(field === "city" ? { locality: "" } : {}),
      }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );
  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name should contain only alphabets and spaces";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.designation) {
      newErrors.designation = "Select a designation";
    }
    if (!formData.state) {
      newErrors.state = "Select a state";
    }
    if (!formData.city) {
      newErrors.city = "Select a city";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }
    if (formData.locality && formData.locality.trim() === "") {
      newErrors.locality = "Locality cannot be empty if provided";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload: UpdateEmployeeRequest = {
      user_id: formData.id,
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      location: formData.locality || undefined,
      designation: parseInt(formData.designation, 10),
      user_type: parseInt(formData.designation) || formData.user_type,
    };
    try {
      const res = await dispatch(updateEmployee(payload)).unwrap();
      toast.success("Employee updated successfully");
      navigate(`/employee/${res?.designation || 2}`);
    } catch (error) {
      console.error("Employee update failed:", error);
      toast.error(error as string);
    }
  };
  const handleCancel = () => {
    navigate(`/employee/${status}`);
  };
  if (!user_id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          No Employee Selected
        </h2>
      </div>
    );
  }
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Loading Employee Data...
        </h2>
      </div>
    );
  }
  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Employee Not Found
        </h2>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-realty-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <PageMeta title="Edit Employee" />
        <ComponentCard title="Edit Employee">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="min-h-[80px]">
              <Label htmlFor="name" className="flex items-center gap-1">
                <User size={16} /> Name
              </Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name")(e.target.value)}
                placeholder="Enter employee name"
                disabled={profileLoading}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.name}</p>
              )}
            </div>
            <div className="min-h-[80px]">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                type="text"
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile")(e.target.value)}
                placeholder="Enter mobile number"
                disabled={profileLoading}
              />
              {errors.mobile && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.mobile}</p>
              )}
            </div>
            <div className="min-h-[80px]">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail size={16} /> Email ID
              </Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email")(e.target.value)}
                placeholder="example@domain.com"
                disabled={profileLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.email}</p>
              )}
            </div>
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="designation"
                label="Select Designation"
                options={designationOptions}
                value={formData.designation}
                onChange={handleChange("designation")}
                placeholder="Select a designation"
                error={errors.designation}
                disabled={profileLoading}
              />
            </div>
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="state"
                label="Select State *"
                options={stateOptions}
                value={formData.state}
                onChange={handleChange("state")}
                placeholder="Search for a state..."
                error={errors.state}
                disabled={profileLoading}
              />
            </div>
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="city"
                label="Select City *"
                options={cityOptions}
                value={formData.city}
                onChange={handleChange("city")}
                placeholder="Search for a city..."
                disabled={!formData.state || profileLoading}
                error={errors.city}
              />
            </div>
            <div className="min-h-[80px]">
              <Label htmlFor="pincode" className="flex items-center gap-1">
                <MapPin size={16} /> Pincode
              </Label>
              <Input
                type="text"
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleChange("pincode")(e.target.value)}
                placeholder="Enter pincode"
                disabled={profileLoading}
              />
              {errors.pincode && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.pincode}</p>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="w-[30%] px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={profileLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-[30%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={profileLoading}
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
};
export default EditEmployee;
