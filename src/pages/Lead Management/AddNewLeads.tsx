import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building, Target, Users, User } from "lucide-react";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { AppDispatch, RootState } from "../../store/store";
import { fetchOngoingProjects } from "../../store/slices/projectSlice";
import { clearUsers, getUsersByType } from "../../store/slices/userslice";
import { getLeadSources, insertLead } from "../../store/slices/leadslice";
import { LeadSource } from "../../types/LeadModel";
interface FormData {
  name: string;
  mobile: string;
  email: string;
  interestedProject: string;
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
  const { ongoingProjects, loading: projectsLoading } = useSelector(
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
  const isBuilder = user?.user_type === 2;
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    interestedProject: "",
    leadSource: isBuilder ? "" : "6",
    channelPartner: "",
    campaign: "",
    propertyType: "",
    squareFeet: "",
    budget: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (isBuilder) {
        dispatch(
          fetchOngoingProjects({
            admin_user_type: user.user_type,
            admin_user_id: user.id,
          })
        );
        dispatch(getLeadSources());
      } else {
        dispatch(
          fetchOngoingProjects({
            admin_user_type: user.created_user_type,
            admin_user_id: user.created_user_id,
          })
        );
      }
    }
    return () => {
      dispatch(clearUsers());
    };
  }, [isAuthenticated, user, dispatch, isBuilder]);
  useEffect(() => {
    if (
      isAuthenticated &&
      user?.id &&
      isBuilder &&
      formData.leadSource === "6"
    ) {
      dispatch(getUsersByType({ admin_user_id: user.id, emp_user_type: 3 }));
    }
  }, [formData.leadSource, isAuthenticated, user, dispatch, isBuilder]);
  const projectOptions =
    ongoingProjects?.map((project: Project) => ({
      value: project.property_id.toString(),
      label: `${project.project_name} - ${project.property_type}`,
    })) || [];
  const channelPartnerOptions =
    users?.map((partner: ChannelPartner) => ({
      value: partner.id.toString(),
      label: `${partner.name} - ${partner.mobile}`,
    })) || [];
  console.log("channelPartnerOptions: ", channelPartnerOptions);
  const campaignOptions =
    leadSources
      ?.filter(
        (source: LeadSource) => source.lead_source_name !== "Channel Partner"
      )
      ?.map((source: LeadSource) => ({
        value: source.lead_source_id.toString(),
        label: source.lead_source_name,
      })) || [];
  const leadSourceOptions =
    leadSources?.map((source: LeadSource) => ({
      value: source.lead_source_id.toString(),
      label: source.lead_source_name,
    })) || [];
  const propertyTypeOptions = [
    { value: "1bhk", label: "1 BHK" },
    { value: "2bhk", label: "2 BHK" },
    { value: "3bhk", label: "3 BHK" },
    { value: "4bhk", label: "4 BHK" },
    { value: "5bhk", label: "5 BHK" },
    { value: "6bhk", label: "6 BHK" },
  ];
  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => {
      if (field === "leadSource") {
        return {
          ...prev,
          [field]: value,
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
    if (isBuilder && !formData.leadSource) {
      newErrors.leadSource = "Please select a lead source";
    }
    if (isBuilder && formData.leadSource === "6" && !formData.channelPartner) {
      newErrors.channelPartner = "Please select a channel partner";
    }
    if (isBuilder && formData.leadSource === "4" && !formData.campaign) {
      newErrors.campaign = "Please select a campaign";
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
        customer_name: formData.name,
        customer_phone_number: formData.mobile,
        customer_email: formData.email,
        interested_project_id: Number(formData.interestedProject),
        interested_project_name: selectedProject?.label.split(" - ")[0],
        lead_source_id: isBuilder ? Number(formData.leadSource) : 6,
        lead_source_user_id: Number(formData.channelPartner),
        sqft: formData.squareFeet,
        budget: formData.budget,
        ...(isBuilder
          ? {
              lead_added_user_type: user?.user_type,
              lead_added_user_id: user?.id,
            }
          : {
              lead_added_user_type: user?.created_user_type,
              lead_added_user_id: user?.created_user_id,
            }),
        ...(isBuilder && formData.leadSource === "6"
          ? {
              assigned_user_type: 3,
              assigned_id: Number(formData.channelPartner),
              assigned_name:
                selectedChannelPartner?.label.split(" - ")[0] || "",
              assigned_emp_number:
                selectedChannelPartner?.label.split(" - ")[1] || "",
            }
          : !isBuilder
          ? {
              assigned_user_type: 3,
              assigned_id: user?.id,
              assigned_name: user?.name || "",
              assigned_emp_number: user?.mobile || "",
            }
          : {}),
      };
      console.log("leadData: ", leadData);
      const result = await dispatch(insertLead(leadData)).unwrap();
      setSubmitSuccess(`Lead created successfully! Lead ID: ${result.lead_id}`);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        interestedProject: "",
        leadSource: isBuilder ? "" : "6",
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
          {!isBuilder && (
            <p className="text-sm text-gray-600">
              This lead will be automatically assigned to you as the channel
              partner.
            </p>
          )}
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
            {}
            <div className="space-y-6 pt-6 border-t border-realty-200">
              <h2 className="text-lg font-semibold text-realty-700 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Project Interest
              </h2>
              <Select
                label="Interested Project"
                options={projectOptions}
                value={formData.interestedProject}
                onChange={handleInputChange("interestedProject")}
                placeholder={
                  projectsLoading
                    ? "Loading projects..."
                    : "Search or select a project"
                }
                error={errors.interestedProject}
              />
            </div>
            {}
            {isBuilder && (
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
                {formData.leadSource === "6" && (
                  <Select
                    label="Channel Partner"
                    options={channelPartnerOptions}
                    value={formData.channelPartner}
                    onChange={handleInputChange("channelPartner")}
                    placeholder={
                      usersLoading
                        ? "Loading partners..."
                        : "Select channel partner"
                    }
                    error={errors.channelPartner}
                  />
                )}
                {formData.leadSource === "4" && (
                  <Select
                    label="Marketing Campaign"
                    options={campaignOptions}
                    value={formData.campaign}
                    onChange={handleInputChange("campaign")}
                    placeholder={
                      leadsLoading ? "Loading campaigns..." : "Select campaign"
                    }
                    error={errors.campaign}
                  />
                )}
              </div>
            )}
            {}
            <div className="space-y-6 pt-6 border-t border-realty-200">
              <h2 className="text-lg font-semibold text-realty-700 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Property
              </h2>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-realty-700 dark:text-realty-300">
                  Select BHK Type
                </label>
                <div className="flex gap-3 flex-wrap">
                  {propertyTypeOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() =>
                        handleInputChange("propertyType")(option.value)
                      }
                      className={`px-4 py-2 rounded-md border transition-all ${
                        formData.propertyType === option.value
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-900"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.propertyType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.propertyType}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-realty-700 dark:text-realty-300">
                Square Feet
              </label>
              <Input
                type="number"
                value={formData.squareFeet}
                onChange={(e) =>
                  handleInputChange("squareFeet")(e.target.value)
                }
                placeholder="Enter square feet area"
                className={errors.squareFeet ? "border-red-500" : ""}
              />
              {errors.squareFeet && (
                <p className="text-red-500 text-sm mt-1">{errors.squareFeet}</p>
              )}
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
            {}
            <div className="pt-6">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  projectsLoading ||
                  (isBuilder && (usersLoading || leadsLoading))
                }
                className="w-full py-3 bg-blue-900 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ||
                (isBuilder && (usersLoading || leadsLoading)) ? (
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
