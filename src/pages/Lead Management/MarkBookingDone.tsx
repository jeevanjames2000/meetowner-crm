import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { AppDispatch, RootState } from '../../store/store';
import { markLeadAsBooked } from '../../store/slices/leadslice';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import toast from 'react-hot-toast';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const MarkBookingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { leadId, leadAddedUserId, leadAddedUserType, propertyId } = location.state || {};
  const { loading, error } = useSelector((state: RootState) => state.lead);

  const [formData, setFormData] = useState({
    flat_number: '',
    floor_number: '',
    block_number: '',
    asset: '',
    sqft: '',
    budget: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (!leadId || !leadAddedUserId || !leadAddedUserType || !propertyId) {
      toast.error("Invalid booking data");
      navigate(-1); // Navigate back if required data is missing
    }
  }, [error, leadId, leadAddedUserId, leadAddedUserType, propertyId, navigate]);

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.flat_number.trim()) newErrors.flat_number = 'Flat number is required';
    if (formData.flat_number.length > 50) newErrors.flat_number = 'Flat number cannot exceed 50 characters';
    if (!formData.floor_number.trim()) newErrors.floor_number = 'Floor number is required';
    if (formData.floor_number.length > 50) newErrors.floor_number = 'Floor number cannot exceed 50 characters';
    if (!formData.block_number.trim()) newErrors.block_number = 'Block number is required';
    if (formData.block_number.length > 50) newErrors.block_number = 'Block number cannot exceed 50 characters';
    if (!formData.asset.trim()) newErrors.asset = 'Asset type is required';
    if (formData.asset.length > 100) newErrors.asset = 'Asset cannot exceed 100 characters';
    if (!formData.sqft.trim()) newErrors.sqft = 'Square footage is required';
    if (!/^\d+(\.\d{1,2})?$/.test(formData.sqft)) newErrors.sqft = 'Invalid square footage (e.g., 1500.00)';
    if (formData.sqft.length > 10) newErrors.sqft = 'Square footage cannot exceed 10 characters';
    if (!formData.budget.trim()) newErrors.budget = 'Budget is required';
    if (!/^\d+(\.\d{1,2})?$/.test(formData.budget)) newErrors.budget = 'Invalid budget (e.g., 8000.00)';
    if (formData.budget.length > 20) newErrors.budget = 'Budget cannot exceed 20 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = {
        lead_id: leadId,
        lead_added_user_type: leadAddedUserType,
        lead_added_user_id: leadAddedUserId,
        property_id: propertyId,
        flat_number: formData.flat_number,
        floor_number: formData.floor_number,
        block_number: formData.block_number,
        asset: formData.asset,
        sqft: formData.sqft,
        budget: formData.budget,
      };

      const result = await dispatch(markLeadAsBooked(submitData)).unwrap();
      toast.success(`Lead ${result.lead_id} booked successfully!`);
      navigate(-1); // Navigate back to the previous page (LeadsType)
    } catch (err) {
      // Error is already handled by toast in useEffect
    }
  };

  const handleCancel = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen p-6">
      <PageMeta title="Lead Management - Book Lead" />
      <PageBreadcrumb
        pageTitle="Mark Lead as Booked"
        pagePlacHolder=""
        onFilter={() => {}} // No search on this page
      />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full mx-auto mt-6">
        <h2 className="text-xl font-semibold mb-4">Mark Lead as Booked</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Flat Number</Label>
              <Input
                type="text"
                value={formData.flat_number}
                onChange={(e) => handleInputChange('flat_number')(e.target.value)}
                placeholder="Enter Flat Number (e.g., S15)"
                className={errors.flat_number ? 'border-red-500' : ''}
              />
              {errors.flat_number && (
                <p className="text-red-500 text-sm mt-1">{errors.flat_number}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Floor Number</Label>
              <Input
                type="text"
                value={formData.floor_number}
                onChange={(e) => handleInputChange('floor_number')(e.target.value)}
                placeholder="Enter Floor Number (e.g., 2)"
                className={errors.floor_number ? 'border-red-500' : ''}
              />
              {errors.floor_number && (
                <p className="text-red-500 text-sm mt-1">{errors.floor_number}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Block Number</Label>
              <Input
                type="text"
                value={formData.block_number}
                onChange={(e) => handleInputChange('block_number')(e.target.value)}
                placeholder="Enter Block Number (e.g., 1A)"
                className={errors.block_number ? 'border-red-500' : ''}
              />
              {errors.block_number && (
                <p className="text-red-500 text-sm mt-1">{errors.block_number}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Asset</Label>
              <Input
                type="text"
                value={formData.asset}
                onChange={(e) => handleInputChange('asset')(e.target.value)}
                placeholder="Enter Asset Type (e.g., 4BHK)"
                className={errors.asset ? 'border-red-500' : ''}
              />
              {errors.asset && <p className="text-red-500 text-sm mt-1">{errors.asset}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Square Feet</Label>
            <Input
              type="text"
              value={formData.sqft}
              onChange={(e) => handleInputChange('sqft')(e.target.value)}
              placeholder="Enter Square Feet (e.g., 1500)"
              className={errors.sqft ? 'border-red-500' : ''}
            />
            {errors.sqft && <p className="text-red-500 text-sm mt-1">{errors.sqft}</p>}
          </div>
          <div className="space-y-1">
            <Label>Budget</Label>
            <Input
              type="text"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget')(e.target.value)}
              placeholder="Enter Budget (e.g., 8000)"
              className={errors.budget ? 'border-red-500' : ''}
            />
            {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Booking...
                </div>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkBookingPage;