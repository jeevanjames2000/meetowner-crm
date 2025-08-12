import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { clearMessages, updateEmployee } from "../../store/slices/employee";
import { getCities, getStates } from "../../store/slices/propertyDetails";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";

interface Option {
  value: string;
  text: string;
}

const allDesignationOptions: Option[] = [
  { value: "7", text: "Manager" },
  { value: "8", text: "TeleCaller" },
  { value: "9", text: "Marketing Executive" },
  { value: "10", text: "Customer Support" },
  { value: "11", text: "Customer Service" },
];

const EditEmployee: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { employee } = location.state || {};
  const { cities, states } = useSelector((state: RootState) => state.property);
  const { updateLoading, updateError, updateSuccess } = useSelector((state: RootState) => state.employee);
  const pageUserType = useSelector((state: RootState) => state.auth.user?.user_type); // Get logged-in user's type

  const [selectedEmployee, setSelectedEmployee] = useState<any>(employee || null);
  console.log("Incoming employee:", employee);

  // Filter designation options based on pageUserType
  const designationOptions: Option[] = pageUserType === 7
    ? allDesignationOptions.filter(option => option.value !== "7")
    : allDesignationOptions;

  const cityOptions: Option[] =
    cities?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];

  const stateOptions: Option[] =
    states?.map((state: any) => ({
      value: state.value,
      text: state.label,
    })) || [];

  useEffect(() => {
    dispatch(getCities());
    dispatch(getStates());
  }, [dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => {
        navigate(-1);
        dispatch(clearMessages());
      }, 1000);
    }
  }, [updateSuccess, navigate, dispatch]);

  const getDesignationValue = (text: string) => {
    const option = designationOptions.find(opt => opt.text === text); // Use filtered options
    console.log(`Designation text: ${text}, mapped value: ${option ? option.value : 'none'}`);
    return option ? [option.value] : [];
  };

  const getCityValue = (text: string) => {
    const option = cityOptions.find(opt => opt.text === text);
    return option ? [option.value] : [];
  };

  const getStateValue = (text: string) => {
    const option = stateOptions.find(opt => opt.text === text);
    return option ? [option.value] : [];
  };

  const handleSave = (e: React.FormEvent) => {
    const createdBy = localStorage.getItem("name") as string;
    const createdUserIdRaw = localStorage.getItem("userId");
    const designationText = typeof selectedEmployee.designation === "string"
      ? selectedEmployee.designation
      : Array.isArray(selectedEmployee.designation) && selectedEmployee.designation.length > 0
        ? selectedEmployee.designation[0]
        : "";
    const designationValue = designationOptions.find(opt => opt.text === designationText)?.value;

    e.preventDefault();
    if (selectedEmployee) {
      const employeeToUpdate = {
        id: selectedEmployee.id,
        name: Array.isArray(selectedEmployee.name) ? selectedEmployee.name[0] : selectedEmployee.name || "",
        mobile: Array.isArray(selectedEmployee.mobile) ? selectedEmployee.mobile[0] : selectedEmployee.mobile || "",
        email: Array.isArray(selectedEmployee.email) ? selectedEmployee.email[0] : selectedEmployee.email || "",
        designation: selectedEmployee.designation,
        city: Array.isArray(selectedEmployee.city) && selectedEmployee.city.length > 0
          ? selectedEmployee.city[0]
          : typeof selectedEmployee.city === "string"
            ? selectedEmployee.city
            : "",
        pincode: selectedEmployee.pincode,
        state: Array.isArray(selectedEmployee.state) && selectedEmployee.state.length > 0
          ? selectedEmployee.state[0]
          : typeof selectedEmployee.state === "string"
            ? selectedEmployee.state
            : "",
        user_type: parseInt(designationValue || "0"),
        status: selectedEmployee.status,
        created_by: createdBy,
        created_userID: parseInt(createdUserIdRaw || "0"),
      };
      console.log("Saving:", employeeToUpdate);
      dispatch(updateEmployee(employeeToUpdate));
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    if (selectedEmployee) {
      const newValue = field === "name" || field === "mobile" || field === "email" || field === "pincode"
        ? Array.isArray(value) ? value[0] : value
        : field === "designation"
          ? Array.isArray(value) ? value[0] : value
          : Array.isArray(value) ? value : [value];
      setSelectedEmployee({ ...selectedEmployee, [field]: newValue });
      console.log(`Field ${field} updated to:`, newValue);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!selectedEmployee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Employee Selected</h2>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <PageMeta title="Edit Employee" />
      <PageBreadcrumbList pageTitle="Edit Employee" pagePlacHolder="Edit employee details" />
      <ComponentCard title="Edit Employee">
        <form onSubmit={handleSave} className="space-y-6">
          {updateSuccess && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              {updateSuccess}
            </div>
          )}
          {updateError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {updateError}
            </div>
          )}

          <div className="min-h-[80px]">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={Array.isArray(selectedEmployee.name) ? selectedEmployee.name[0] : selectedEmployee.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter employee name"
              disabled={updateLoading}
            />
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              type="text"
              id="mobile"
              value={Array.isArray(selectedEmployee.mobile) ? selectedEmployee.mobile[0] : selectedEmployee.mobile || ""}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="Enter mobile number"
              disabled={updateLoading}
            />
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="email">Email ID</Label>
            <Input
              type="email"
              id="email"
              value={Array.isArray(selectedEmployee.email) ? selectedEmployee.email[0] : selectedEmployee.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="example@domain.com"
              disabled={updateLoading}
            />
          </div>

          <div className="relative mb-10 min-h-[80px]">
            <MultiSelect
              label="Designation"
              options={designationOptions} 
              defaultSelected={getDesignationValue(selectedEmployee.designation)}
              onChange={(values) => handleInputChange("designation", designationOptions.filter(opt => values.includes(opt.value)).map(opt => opt.text))}
              disabled={updateLoading}
            />
          </div>

          <div className="relative mb-10 min-h-[80px]">
            <MultiSelect
              label="City"
              options={cityOptions}
              defaultSelected={getCityValue(Array.isArray(selectedEmployee.city) ? selectedEmployee.city[0] : selectedEmployee.city)}
              onChange={(values) => handleInputChange("city", cityOptions.filter(opt => values.includes(opt.value)).map(opt => opt.text))}
              disabled={updateLoading}
            />
          </div>

          <div className="relative mb-10 min-h-[80px]">
            <MultiSelect
              label="State"
              options={stateOptions}
              defaultSelected={getStateValue(Array.isArray(selectedEmployee.state) ? selectedEmployee.state[0] : selectedEmployee.state)}
              onChange={(values) => handleInputChange("state", stateOptions.filter(opt => values.includes(opt.value)).map(opt => opt.text))}
              disabled={updateLoading}
            />
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              type="text"
              id="pincode"
              value={selectedEmployee.pincode || ""}
              onChange={(e) => handleInputChange("pincode", e.target.value)}
              placeholder="Enter pincode"
              disabled={updateLoading}
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-[30%] px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={updateLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-[30%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={updateLoading}
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default EditEmployee;