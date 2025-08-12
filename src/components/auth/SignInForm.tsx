import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { LoginRequest } from "../../types/UserModel";
import { AppDispatch, RootState } from "../../store/store";
import { loginUser } from "../../store/slices/authSlice";


export default function SignInForm() {
  const navigate = useNavigate();
 const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, error, loading } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const [formData, setFormData] = useState<LoginRequest>({
    mobile: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    mobile: "",
    password: "",
    general: "",
  });


  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); 
    } else {
    
      setFormData({ mobile: "", password: "" });
      setErrors({ mobile: "", password: "", general: "" });
      setFormKey(Date.now());
    }
  }, [isAuthenticated, navigate]);


  useEffect(() => {
    if (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: error,
      }));
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: name === "mobile" ? value.replace(/\D/g, "") : value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
      general: "",
    }));
  };

  const isValidMobile = (mobile: string) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = { mobile: "", password: "", general: "" };
    let hasError = false;

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      hasError = true;
    } else if (!isValidMobile(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
      hasError = true;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Dispatch loginUser action
    const resultAction = await dispatch(loginUser(formData));

    // Check if login was successful
    if (loginUser.fulfilled.match(resultAction)) {
      setFormData({ mobile: "", password: "" });
      setFormKey(Date.now());
      navigate("/"); // Navigate to home on success
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray
    -900 text-gray-900 dark:text-white p-6">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-bold text-2xl text-blue-900">Sign In</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your mobile number and password to sign in!
            </p>
          </div>

          <form key={formKey} onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-800 dark:text-white">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  name="mobile"
                  placeholder="Enter Mobile number"
                  value={formData.mobile}
                  maxLength={10}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7700ff]"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-800 dark:text-white">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 pr-10 mt-1 border rounded-md bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7700ff]"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-300 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-300 size-5" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <Button
                  className="w-full px-5 py-3 font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md text-sm shadow-md"
                  size="sm"
                  disabled={loading} // Disable button during API call
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </div>
          </form>

          {errors.general && (
            <p className="mt-4 text-sm text-red-500 text-center">{errors.general}</p>
          )}
        </div>
      </div>
    </div>
  );
}