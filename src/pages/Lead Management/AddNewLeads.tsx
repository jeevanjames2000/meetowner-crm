import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building, Target, Users, User } from "lucide-react";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllProjects } from "../../store/slices/projectSlice";
import { clearUsers, getUsersByType } from "../../store/slices/userslice";
import { getLeadSources } from "../../store/slices/leadslice";
import { LeadSource } from "../../types/LeadModel";
interface FormData {
  name: string;
  mobile: string;
  email: string;
  interestedProject: Project | null;
  leadSource: string;
  channelPartner: string;
  campaign: string;
  propertyType: string;
  squareFeet: string;
  budget: string;
}
interface Errors {
  name?: string;
  mobile?: string;
  email?: string;
  interestedProject?: string;
  leadSource?: string;
  channelPartner?: string;
  campaign?: string;
  propertyType?: string;
  squareFeet?: string;
  budget?: string;
}
interface Project {
  property_id: string | number;
  project_name: string;
  property_type: string;
}
interface ChannelPartner {
  id: string | number;
  name: string;
  mobile: string;
}
const LeadForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { allProjects, loading: projectsLoading } = useSelector(
    (state: RootState) => state.projects
  );

  const { users, loading: usersLoading } = useSelector(
    (state: RootState) => state.user
  );
  const {
    leadSources,
    loading: leadsLoading,
    error: leadsError,
  } = useSelector((state: RootState) => state.lead);
  console.log("leadSources: ", leadSources);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    interestedProject: null,
    leadSource: "",
    channelPartner: "",
    campaign: "",
    propertyType: "",
    squareFeet: "",
    budget: "",
  });
  console.log("formData: ", formData);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  useEffect(() => {
    dispatch(
      fetchAllProjects({
        user_id: user.id,
      })
    );
    dispatch(getLeadSources());
    return () => {
      dispatch(clearUsers());
    };
  }, [isAuthenticated, user, dispatch]);
  useEffect(() => {
    if (isAuthenticated && user?.id && formData.leadSource === "6") {
      dispatch(getUsersByType({ admin_user_id: user.id, emp_user_type: 3 }));
    }
  }, [formData.leadSource, isAuthenticated, user, dispatch]);
  const projectOptions =
    allProjects?.map((project: Project) => ({
      value: project.unique_property_id.toString(),
      label: `${project.property_name} - ${project.property_in}`,
    })) || [];
  const channelPartnerOptions =
    users?.map((partner: ChannelPartner) => ({
      value: partner.id.toString(),
      label: `${partner.name} - ${partner.mobile}`,
    })) || [];

  const leadSourceOptions =
    leadSources?.map((source: LeadSource) => ({
      value: source.lead_source_id.toString(),
      label: source.lead_source_name,
    })) || [];
  const handleInputChange =
    (field: keyof FormData) => (value: string | Project) => {
      setFormData((prev) => {
        if (field === "leadSource") {
          return {
            ...prev,
            [field]: value as string,
            channelPartner: "",
            campaign: "",
          };
        }
        return { ...prev, [field]: value };
      });
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain alphabets and Spaces";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.interestedProject) {
      newErrors.interestedProject = "Please select a project";
    }
    if (!formData.leadSource) {
      newErrors.leadSource = "Please select a lead source";
    }

    if (!formData.propertyType) {
      newErrors.propertyType = "Please select a property type";
    }
    if (!formData.squareFeet.trim()) {
      newErrors.squareFeet = "Square feet is required";
    }
    if (!formData.budget.trim()) {
      newErrors.budget = "Budget is required";
    } else if (!/^\d+$/.test(formData.budget)) {
      newErrors.budget = "Budget must be a valid number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const selectedProject = projectOptions.find(
        (opt) => opt.value === formData.interestedProject
      );
      const selectedChannelPartner = channelPartnerOptions.find(
        (opt) => opt.value === formData.channelPartner
      );
      const leadData: any = {
        unique_property_id: selectedProject?.unique_property_id,
        fullname: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        sub_type: selectedProject?.sub_type,
        property_for: selectedProject?.property_for,
        property_type: selectedProject?.property_type,
        property_in: selectedProject?.property_in,
        state_id: selectedProject?.state_id,
        city_id: selectedProject?.city_id,
        budget: formData.budget,
        google_address: selectedProject?.google_address,
        property_name: selectedProject?.property_name,
        lead_source_id: Number(formData.leadSource),
        lead_added_user_type: 1,
        lead_added_user_id: 4,
      };

      console.log("leadData: ", leadData);
      setSubmitSuccess(`Lead created successfully! Lead ID: ${result.lead_id}`);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        interestedProject: "",
        leadSource: "",
        channelPartner: "",
        campaign: "",
        propertyType: "",
        squareFeet: "",
        budget: "",
      });
    } catch (error: any) {
      setSubmitError(
        error.message || "Failed to create lead. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-realty-50 via-white to-realty-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {}
        {submitSuccess && (
          <div className="p-3 mb-6 bg-green-100 text-green-700 rounded-md">
            {submitSuccess}
          </div>
        )}
        {submitError && (
          <div className="p-3 mb-6 bg-red-100 text-red-700 rounded-md">
            {submitError}
          </div>
        )}
        {leadsError && (
          <div className="p-3 mb-6 bg-red-100 text-red-700 rounded-md">
            {leadsError}
          </div>
        )}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Add New Lead
          </h1>
          <p className="text-gray-600 text-sm">
            Capture potential client information for your real estate projects
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-[#1D3A76]" />
                Personal Information
              </h2>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-realty-700 dark:text-realty-300">
                  Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name")(e.target.value)}
                  placeholder="Enter customer's full name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-realty-700 dark:text-realty-300">
                  Mobile Number
                </label>
                <Input
                  type="number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile")(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className={errors.mobile ? "border-red-500" : ""}
                  maxLength={10}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-realty-700 dark:text-realty-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email")(e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-6 pt-6 border-t border-realty-200">
              <h2 className="text-lg font-semibold text-realty-700 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Project Interest
              </h2>
              <Select
                label="Interested Project"
                options={projectOptions}
                value={formData.interestedProject?.unique_property_id || ""}
                onChange={(value) => {
                  const selectedProject = allProjects.find(
                    (project: Project) =>
                      project.unique_property_id.toString() === value
                  );
                  handleInputChange("interestedProject")(
                    selectedProject || null
                  );
                }}
                placeholder={
                  projectsLoading
                    ? "Loading projects..."
                    : "Search or select a project"
                }
                error={errors.interestedProject}
              />
            </div>
            <div className="space-y-6 pt-6 border-t border-realty-200">
              <h2 className="text-lg font-semibold text-realty-700 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Lead Source
              </h2>
              <Select
                label="Lead Source"
                options={leadSourceOptions}
                value={formData.leadSource}
                onChange={handleInputChange("leadSource")}
                placeholder={
                  leadsLoading
                    ? "Loading lead sources..."
                    : "Select lead source"
                }
                error={errors.leadSource}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-realty-700 dark:text-realty-300">
                Budget
              </label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget")(e.target.value)}
                placeholder="Enter your budget"
                className={errors.budget ? "border-red-500" : ""}
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
              )}
            </div>
            <div className="pt-6">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  projectsLoading ||
                  usersLoading ||
                  leadsLoading
                }
                className="w-full py-3 bg-blue-900 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting || usersLoading || leadsLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Lead...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5 text-white" />
                    Create Lead
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-8 text-realty-600">
          <p className="text-sm">
            All lead information is securely stored and processed according to
            our privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};
export default LeadForm;
