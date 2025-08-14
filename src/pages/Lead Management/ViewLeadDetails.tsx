import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/button/Button";
import Timeline, { TimelineEvent } from "../../components/ui/timeline/Timeline";
import { AppDispatch, RootState } from "../../store/store";
import {
  getLeadSources,
  getLeadUpdatesByLeadId,
} from "../../store/slices/leadslice";
import { Lead, LeadUpdate } from "../../types/LeadModel";
const statuses = [
  { status_id: 1, status_name: "Open" },
  { status_id: 2, status_name: "Follow Up" },
  { status_id: 3, status_name: "In Progress" },
  { status_id: 4, status_name: "Site Visit Scheduled" },
  { status_id: 5, status_name: "Site Visit Done" },
  { status_id: 6, status_name: "Won" },
  { status_id: 7, status_name: "Lost" },
  { status_id: 8, status_name: "Revoked" },
];
const ViewLeadDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { leadUpdates, loading, error } = useSelector(
    (state: RootState) => state.lead
  );
  const property = location.state?.property as Lead;

  const leadSources = useSelector((state: RootState) => state.lead.leadSources);

  useEffect(() => {
    dispatch(
      getLeadUpdatesByLeadId({
        lead_id: property.lead_id,
      })
    );
  }, [navigate, dispatch]);

  useEffect(() => {
    dispatch(getLeadSources());
  }, [dispatch]);

  if (!property) {
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
              onClick={() => navigate("/leads")}
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
        label:
          statuses.find((s) => s.status_id === update.update_status_id)
            ?.status_name || `Update ${index + 1}`,
        timestamp: `${update.update_date} ${update.update_time}`,
        status: index === 0 ? "completed" : "pending",
        description: update.feedback,
        nextAction: update.next_action,
        current: index === 0, // latest entry
        updatedEmpType: update.updated_by_emp_type,
        updatedEmpId: update.updated_by_emp_id,
        updatedEmpPhone: update.updated_emp_phone,
        updatedEmpName: update.updated_by_emp_name,
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-4">
        Lead Details: {property.property_name}
      </h2>

      {loading && (
        <div className="text-center text-gray-600 dark:text-gray-400 py-4">
          Loading lead updates...
        </div>
      )}
      {error && <div className="text-center text-red-500 py-4">{error}</div>}

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2 text-[16px] text-gray-800 dark:text-gray-100 leading-relaxed">
            <p>
              <strong>Name:</strong> {property.fullname}
            </p>
            <p>
              <strong>Mobile:</strong> {property.mobile}
            </p>
            <p>
              <strong>Email:</strong> {property.email || "N/A"}
            </p>
            <p>
              <strong>Project:</strong> {property.property_name}
            </p>
            <p>
              <strong>Budget:</strong> {property.budget || "N/A"}
            </p>
            <p>
              <strong>Lead Source:</strong>{" "}
              {leadSources?.find(
                (source) =>
                  String(source.lead_source_id) ===
                  String(property.lead_source_id)
              )?.lead_source_name || property.lead_source_id}
            </p>

            <p>
              <strong>Created:</strong> {property.created_at}{" "}
              {property.created_at}
            </p>
            <p>
              <strong>Assigned:</strong> {property.assigned_name} (
              {property.assigned_emp_number})
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {statuses.find((s) => s.status_id === property.status_id)
                ?.status_name || "Unknown"}
            </p>

            <p>
              <strong>city:</strong> {property.city_id}
            </p>
            <p>
              <strong>state:</strong> {property.state_id}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            Lead Timeline
          </h2>
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
