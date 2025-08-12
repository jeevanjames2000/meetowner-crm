import { useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/ui/button/Button';
import Timeline, { TimelineEvent } from '../../components/ui/timeline/Timeline';
import { AppDispatch, RootState } from '../../store/store';
import { getLeadSources, getLeadUpdatesByLeadId } from '../../store/slices/leadslice';
import { Lead, LeadUpdate } from '../../types/LeadModel';
import { BUILDER_USER_TYPE } from './CustomComponents';
import toast from 'react-hot-toast';

const ViewLeadDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { leads, leadUpdates, loading, error } = useSelector((state: RootState) => state.lead);
  const property = location.state?.property as Lead;
  const isBuilder = user?.user_type === BUILDER_USER_TYPE;
  const leadSources = useSelector((state: RootState) => state.lead.leadSources);


  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      toast.error('Please log in to view lead details');
      return;
    }


    if (!property) {
      navigate('/leads');
      toast.error('No lead data provided');
      return;
    }

    if (isBuilder) {
      if (!user.user_type || !user.id) {
        navigate('/login');
        toast.error('User data incomplete. Please log in again.');
        return;
      }
      dispatch(
        getLeadUpdatesByLeadId({
          lead_id: property.lead_id,
          lead_added_user_type: user.user_type,
          lead_added_user_id: user.id,
        })
      );
    } else {
      if (!user.created_user_type || !user.created_user_id) {
        navigate('/login');
        toast.error('User data incomplete for non-builder user. Please log in again.');
        return;
      }
      dispatch(
        getLeadUpdatesByLeadId({
          lead_id: property.lead_id,
          lead_added_user_type: Number(user.created_user_type),
          lead_added_user_id: user.created_user_id,
        })
      );
    }
  }, [property, navigate, dispatch, isAuthenticated, user]);

  useEffect(() => {
  dispatch(getLeadSources());
}, [dispatch]);

  const lead = typeof property === 'number' ? leads?.find((l) => l.lead_id === property) : property;

  if (!lead) {
    return (
      <div className="p-6 space-y-6">
        {loading && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-4">
            Loading lead details...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 py-4">
            {error}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/leads')}
              className="ml-4"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    );
  }

  const timeline: TimelineEvent[] = leadUpdates?.length
    ? leadUpdates.map((update: LeadUpdate, index: number) => ({
        label: update.status_name || `Update ${index + 1}`,
        timestamp: `${update.update_date} ${update.update_time}`,
        status: update.status_id && lead.status_id && update.status_id <= lead.status_id ? 'completed' : 'pending',
        description: update.feedback,
        nextAction: update.next_action,
        current: update.status_id === lead.status_id,
        updatedEmpType: update.updated_by_emp_type,
        updatedEmpId: update.updated_by_emp_id,
        updatedEmpPhone: update.updated_emp_phone,
        updatedEmpName: update.updated_by_emp_name,
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-4">
        Lead Details: {lead.interested_project_name}
      </h2>

      {loading && (
        <div className="text-center text-gray-600 dark:text-gray-400 py-4">
          Loading lead updates...
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 py-4">{error}</div>
      )}

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2 text-[16px] text-gray-800 dark:text-gray-100 leading-relaxed">
            <p>
              <strong>Name:</strong> {lead.customer_name}
            </p>
            <p>
              <strong>Mobile:</strong> {lead.customer_phone_number}
            </p>
            <p>
              <strong>Email:</strong> {lead.customer_email || 'N/A'}
            </p>
            <p>
              <strong>Project:</strong> {lead.interested_project_name}
            </p>
            <p>
              <strong>Budget:</strong> {lead.budget || 'N/A'}
            </p>
        <p>
  <strong>Lead Source:</strong>{" "}
  {
    leadSources?.find(
      (source) => String(source.lead_source_id) === String(lead.lead_source_id)
    )?.lead_source_name || lead.lead_source_id
  }
</p>   


            <p>
              <strong>Created:</strong> {lead.created_date} {lead.created_time}
            </p>
            <p>
              <strong>Assigned:</strong> {lead.assigned_name} ({lead.assigned_emp_number})
            </p>
            <p>
              <strong>Status:</strong> {lead.status_name}
            </p>
            <p>
              <strong>city:</strong> {lead.city}
            </p>
             <p>
              <strong>state:</strong> {lead.state}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Lead Timeline</h2>
          <Timeline data={timeline} />
        </div>
      </div>

      <div className="pt-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default ViewLeadDetails;