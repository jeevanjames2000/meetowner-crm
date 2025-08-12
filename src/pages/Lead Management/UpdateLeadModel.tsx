import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getLeadStatuses, updateLeadByEmployee } from "../../store/slices/leadslice";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import { LeadStatus } from "../../types/LeadModel";

interface UpdateLeadModalProps {
  leadId: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const UpdateLeadModal: React.FC<UpdateLeadModalProps> = ({ leadId, onClose, onSubmit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { leadStatuses, loading: statusesLoading, error: statusesError } = useSelector(
    (state: RootState) => state.lead
  );

  const [formData, setFormData] = useState({
    follow_up_feedback: "",
    next_action: "",
    status_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const statusOptions = leadStatuses?.map((status: LeadStatus) => ({
    value: status.status_id.toString(),
    label: status.status_name,
  })) || [];

  useEffect(() => {
    dispatch(getLeadStatuses());
  }, [dispatch]);

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.status_id) newErrors.status_id = "Status is required";
    if (!formData.follow_up_feedback.trim()) newErrors.follow_up_feedback = "Follow-up feedback is required";
    if (!formData.next_action.trim()) newErrors.next_action = "Next action is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user?.id || !user?.user_type || !user?.name || !user?.mobile) {
      setSubmitError("User information is missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const submitData = {
        lead_id: leadId,
        follow_up_feedback: formData.follow_up_feedback,
        next_action: formData.next_action,
        status_id: parseInt(formData.status_id),
        updated_by_emp_type: user.user_type,
        updated_by_emp_id: user.id,
        updated_by_emp_name: user.name,
        updated_emp_phone: user.mobile,
        lead_added_user_type: user.created_user_type,
        lead_added_user_id: user.created_user_id,
      };
      console.log(submitData);

      const result = await dispatch(updateLeadByEmployee(submitData)).unwrap();
      setSubmitSuccess(`Lead updated successfully! Lead ID: ${submitData.lead_id}`);
      onSubmit(submitData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to update lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] pointer-events-auto">
      <div className=" absolute inset-0 bg-white/30 backdrop-blur-sm">
<div className="relative flex items-center justify-center h-full">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Update Lead</h2>
        {submitSuccess && (
          <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md">
            {submitSuccess}
          </div>
        )}
        {submitError && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
            {submitError}
          </div>
        )}
        {statusesError && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
            {statusesError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status_id}
            onChange={handleInputChange("status_id")}
            placeholder={statusesLoading ? "Loading statuses..." : "Select status"}
            error={errors.status_id}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Follow-up Feedback
            </label>
            <Input
              type="text"
              value={formData.follow_up_feedback}
              onChange={(e) => handleInputChange("follow_up_feedback")(e.target.value)}
              placeholder="Enter follow-up feedback"
              className={errors.follow_up_feedback ? "border-red-500" : ""}
            />
            {errors.follow_up_feedback && (
              <p className="text-red-500 text-sm mt-1">{errors.follow_up_feedback}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Next Action
            </label>
            <Input
              type="text"
              value={formData.next_action}
              onChange={(e) => handleInputChange("next_action")(e.target.value)}
              placeholder="Enter next action"
              className={errors.next_action ? "border-red-500" : ""}
            />
            {errors.next_action && (
              <p className="text-red-500 text-sm mt-1">{errors.next_action}</p>
            )}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || statusesLoading}
            >
              {isSubmitting || statusesLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating Lead...
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </div>
      </div>
      </div>
    </div>
  );
};

export default UpdateLeadModal;