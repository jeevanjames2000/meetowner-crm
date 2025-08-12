import React, { useState, useEffect } from "react";
import { User, MapPin, KeyRound, Mail, EyeIcon, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import Input from "../../components/form/input/InputField";
import PhoneInput from "../../components/form/group-input/PhoneInput";
import Dropdown from "../../components/form/Dropdown";
import { usePropertyQueries } from "../../hooks/PropertyQueries";
import toast from "react-hot-toast";
import { insertUser } from "../../store/slices/userslice";
import { useNavigate } from "react-router";
import { setCityDetails } from "../../store/slices/propertyDetails";
interface FormData {
  name: string;
  mobile: string;
  email: string;
  designation: string;
  password: string;
  city: string;
  state: string;
  pincode: string;
  location: string;
}
interface Errors {
  name?: string;
  mobile?: string;
  email?: string;
  designation?: string;
  password?: string;
  city?: string;
  state?: string;
  pincode?: string;
  location?: string;
  address?: string;
  photo?: string;
}
const CreateEmployee = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { states } = useSelector((state: RootState) => state.property);
  const { loading } = useSelector((state: RootState) => state.user);
  const { citiesQuery, statesQuery } = usePropertyQueries();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    designation: "",
    password: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "530001",
    location: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const citiesResult = citiesQuery(
    formData.state ? parseInt(formData.state) : undefined
  );
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      toast.error("Please log in to access this page");
      return;
    }
    if (user.user_type !== 2) {
      navigate("/");
      toast.error("Access denied: Only builders can create employees");
    }
  }, [isAuthenticated, user, navigate]);
  useEffect(() => {
    if (citiesResult.data) {
      dispatch(setCityDetails(citiesResult.data));
    }
  }, [citiesResult.data, dispatch]);
  useEffect(() => {
    if (citiesResult.isError) {
      toast.error(
        `Failed to fetch cities: ${
          citiesResult.error?.message || "Unknown error"
        }`
      );
    }
    if (statesQuery.isError) {
      toast.error(
        `Failed to fetch states: ${
          statesQuery.error?.message || "Unknown error"
        }`
      );
    }
  }, [
    citiesResult.isError,
    citiesResult.error,
    statesQuery.isError,
    statesQuery.error,
  ]);
  const allDesignationOptions = [
    { value: "4", text: "Sales Manager" },
    { value: "5", text: "Telecallers" },
    { value: "6", text: "Marketing Agent" },
    { value: "7", text: "Receptionists" },
  ];
  const cityOptions =
    citiesResult?.data?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];
  const stateOptions =
    states?.map((s: any) => ({ value: s.value, text: s.label })) || [];
  const handleChange =
    (field: keyof FormData) => (value: string | File | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  const handleDropdownChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "state" && { city: "" }),
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };
  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name should be alphabets and name spaces";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10 digit mobile number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.designation) {
      newErrors.designation = "Select a designation";
    } else if (!/^[A-Za-z]+$/.test(formData.name.trim())) {
      newErrors.designation = "Designation only contains Alphabets and Spaces";
    }
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.city) newErrors.city = "Select a city";
    if (!formData.state) newErrors.state = "Select a state";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter valid 6-digit pincode";
    }
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.photo) newErrors.photo = "Photo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const createdBy = localStorage.getItem("name") || "Admin";
    const createdUserId = parseInt(localStorage.getItem("userId") || "1");
    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
      city:
        cityOptions.find((c) => c.value === formData.city)?.text ||
        formData.city,
      state:
        stateOptions.find((s) => s.value === formData.state)?.text ||
        formData.state,
      pincode: formData.pincode,
      location: formData.location,
      user_type: formData.designation,
      created_by: createdBy,
      created_userID: createdUserId,
    };
    try {
      await dispatch(insertUser(payload)).unwrap();
      setFormData({
        name: "",
        mobile: "",
        email: "",
        designation: "",
        password: "",
        city: "",
        state: "",
        pincode: "",
        location: "",
      });
      setErrors({});
    } catch (error) {
      console.error("User Insertion failed:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-realty-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Create Employee
          </h1>
          <p className="text-gray-600">
            Add a new team member to your organization
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User size={16} /> Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name")(e.target.value)}
                placeholder="Enter employee name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.name}</p>
              )}
            </div>
            {}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mobile
              </label>
              <PhoneInput
                countries={[{ code: "IN", label: "+91" }]}
                value={formData.mobile}
                placeholder="Enter mobile number"
                onChange={handleChange("mobile")}
              />
              {errors.mobile && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.mobile}</p>
              )}
            </div>
            {}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Mail size={16} /> Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email")(e.target.value)}
                placeholder="example@domain.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.email}</p>
              )}
            </div>
            {}
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="designation"
                label="Select Designation"
                options={allDesignationOptions}
                value={formData.designation}
                onChange={handleDropdownChange("designation")}
                placeholder="Select a designation"
                error={errors.designation}
              />
            </div>
            {}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <KeyRound size={16} /> Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password")(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9"
              >
                {showPassword ? <EyeOff size={18} /> : <EyeIcon size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  ⚠️ {errors.password}
                </p>
              )}
            </div>
            {}
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="state"
                label="Select State"
                options={stateOptions}
                value={formData.state}
                onChange={handleDropdownChange("state")}
                placeholder="Search for a state..."
                error={errors.state}
              />
            </div>
            {}
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="city"
                label="Select City"
                options={cityOptions}
                value={formData.city}
                onChange={handleDropdownChange("city")}
                placeholder="Search for a city..."
                disabled={!formData.state}
                error={errors.city}
              />
            </div>
            {}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin size={16} /> Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location")(e.target.value)}
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">
                  ⚠️ {errors.location}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin size={16} /> Pincode
              </label>
              <Input
                value={formData.pincode}
                onChange={(e) => handleChange("pincode")(e.target.value)}
                placeholder="Enter pincode"
              />
              {errors.pincode && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.pincode}</p>
              )}
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-900 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateEmployee;
