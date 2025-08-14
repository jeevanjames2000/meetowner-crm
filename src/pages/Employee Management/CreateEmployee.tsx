import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { User, MapPin, KeyRound, Mail, EyeIcon, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import Input from "../../components/form/input/InputField";
import PhoneInput from "../../components/form/group-input/PhoneInput";
import Dropdown from "../../components/form/Dropdown";
import Label from "../../components/form/Label";
import toast from "react-hot-toast";
import { insertUser } from "../../store/slices/userslice";
import { useNavigate } from "react-router";
import {
  fetchAllCities,
  fetchAllStates,
  fetchLocalities,
} from "../../store/slices/places";
interface FormData {
  name: string;
  mobile: string;
  email: string;
  designation: string;
  password: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
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
  locality?: string;
}
interface Option {
  value: string;
  text: string;
}
const CreateEmployee = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.user);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { cities, states, localities } = useSelector(
    (state: RootState) => state.places
  );
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    designation: "",
    password: "",
    city: "",
    state: "",
    pincode: "",
    locality: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const localityInputRef = useRef<HTMLDivElement>(null);
  const stateOptions = useMemo(
    () => [
      ...states
        .filter(
          (state) =>
            state.name &&
            typeof state.name === "string" &&
            state.name.trim() !== ""
        )
        .map((state) => ({ value: state.name, text: state.name })),
    ],
    [states]
  );
  const cityOptions = useMemo(
    () => [
      ...cities
        .filter(
          (city) =>
            city.name &&
            typeof city.name === "string" &&
            city.name.trim() !== ""
        )
        .map((city) => ({ value: city.name, text: city.name })),
    ],
    [cities]
  );
  const placeOptions = useMemo(
    () => [
      ...localities
        .filter(
          (place) =>
            place.locality &&
            typeof place.locality === "string" &&
            place.locality.trim() !== ""
        )
        .map((place) => ({ value: place.locality, text: place.locality })),
    ],
    [localities]
  );
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };
  };
  useEffect(() => {
    dispatch(fetchAllStates()).then((result) => {
      if (fetchAllStates.rejected.match(result))
        toast.error("Failed to load states.");
    });
  }, [dispatch]);
  useEffect(() => {
    if (formData.state) {
      dispatch(fetchAllCities({ state: formData.state })).then((result) => {
        if (fetchAllCities.rejected.match(result))
          toast.error("Failed to load cities.");
      });
    }
  }, [dispatch, formData.state]);
  useEffect(() => {
    if (formData.city && formData.state) {
      dispatch(
        fetchLocalities({ city: formData.city, state: formData.state })
      ).then((result) => {
        if (fetchLocalities.rejected.match(result))
          toast.error("Failed to load localities.");
      });
    }
  }, [dispatch, formData.city, formData.state]);
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      toast.error("Please log in to access this page");
      return;
    }
  }, [isAuthenticated, user, navigate]);
  const debouncedFetchLocalities = useCallback(
    debounce((city: string, state: string, query: string) => {
      dispatch(fetchLocalities({ city, state, query }));
    }, 300),
    [dispatch]
  );
  const handleLocalityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setFormData((prev) => ({ ...prev, locality: searchTerm }));
      if (formData.city && formData.state) {
        debouncedFetchLocalities(formData.city, formData.state, searchTerm);
        setIsLocalityDropdownOpen(true);
      }
      setErrors((prev) => ({ ...prev, locality: undefined }));
    },
    [formData.city, formData.state, debouncedFetchLocalities]
  );
  const handleLocalitySelect = useCallback((locality: string) => {
    setFormData((prev) => ({ ...prev, locality }));
    setIsLocalityDropdownOpen(false);
    setErrors((prev) => ({ ...prev, locality: undefined }));
  }, []);
  const handleLocalityFocus = useCallback(() => {
    if (formData.city && formData.state && formData.locality) {
      debouncedFetchLocalities(
        formData.city,
        formData.state,
        formData.locality
      );
      setIsLocalityDropdownOpen(true);
    }
  }, [
    formData.city,
    formData.state,
    formData.locality,
    debouncedFetchLocalities,
  ]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        localityInputRef.current &&
        !localityInputRef.current.contains(e.target as Node)
      ) {
        setIsLocalityDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
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
  const allDesignationOptions = [
    { value: "2", text: "Sales Manager" },
    { value: "3", text: "Telecallers" },
    { value: "4", text: "Marketing Agent" },
  ];
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
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    if (!formData.state) {
      newErrors.state = "Select a state";
    }
    if (!formData.city) {
      newErrors.city = "Select a city";
    }
    if (!formData.locality.trim()) {
      newErrors.locality = "Locality is required";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const createdBy = user?.name || "Admin";

    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      location: formData.locality,
      user_type: formData.designation,
      designation: formData.designation,
      created_by: createdBy,
      created_userID: user?.user_id || "",
    };
    try {
      await dispatch(insertUser(payload)).unwrap();
      toast.success("Employee created successfully");
      setFormData({
        name: "",
        mobile: "",
        email: "",
        designation: "",
        password: "",
        city: "",
        state: "",
        pincode: "",
        locality: "",
      });
      setErrors({});
      navigate("/");
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
            <div className="min-h-[80px]">
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
            <div className="min-h-[80px]">
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
            <div className="min-h-[80px]">
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
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="designation"
                label="Select Designation"
                options={allDesignationOptions}
                value={formData.designation}
                onChange={handleChange("designation")}
                placeholder="Select a designation"
                error={errors.designation}
              />
            </div>
            <div className="min-h-[80px] relative">
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
            <div className="min-h-[80px] w-full max-w-md">
              <Dropdown
                id="state"
                label="Select State *"
                options={stateOptions}
                value={formData.state}
                onChange={handleChange("state")}
                placeholder="Search for a state..."
                error={errors.state}
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
                disabled={!formData.state}
                error={errors.city}
              />
            </div>
            <div className="min-h-[80px] relative" ref={localityInputRef}>
              <Label htmlFor="locality">Select Locality *</Label>
              <Input
                type="text"
                id="locality"
                value={formData.locality}
                onChange={handleLocalityChange}
                onFocus={handleLocalityFocus}
                placeholder="Search for a locality..."
                disabled={!formData.city}
                className="dark:bg-gray-800"
              />
              {isLocalityDropdownOpen && formData.city && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {placeOptions.length > 0 ? (
                    placeOptions.map((option) => (
                      <li
                        key={option.value}
                        onClick={() => handleLocalitySelect(option.value)}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {option.text}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No localities found
                    </li>
                  )}
                </ul>
              )}
              {errors.locality && (
                <p className="text-red-500 text-sm mt-1">{errors.locality}</p>
              )}
            </div>
            <div className="min-h-[80px]">
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
