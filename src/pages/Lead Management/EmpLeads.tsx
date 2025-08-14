import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { RootState, AppDispatch } from "../../store/store";
import { Lead } from "../../types/LeadModel";
import {
  clearLeads,
  getLeadsByID,
  getLeadsByUser,
} from "../../store/slices/leadslice";
import FilterBar from "../../components/common/FilterBar";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
const userTypeOptions = [
  { value: "4", label: "Sales Manager" },
  { value: "5", label: "Telecallers" },
  { value: "6", label: "Marketing Executors" },
  { value: "7", label: "Receptionists" },
];
const statusOptions = [
  { value: "", label: "All" },
  { value: "0", label: "Today Leads" },
  { value: "1", label: "Open Leads" },
  { value: "2", label: "Today Follow" },
  { value: "3", label: "In Progress" },
  { value: "4", label: "Site Visit Scheduled" },
  { value: "5", label: "Site Visit Done" },
  { value: "6", label: "Won" },
  { value: "7", label: "Lost" },
  { value: "8", label: "Revoked" },
];
const EmpLeads: React.FC = () => {
  const [localPage, setLocalPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [startCreatedDate, setStartCreatedDate] = useState<string | null>(null);
  const [endCreatedDate, setEndCreatedDate] = useState<string | null>(null);
  const [startUpdatedDate, setStartUpdatedDate] = useState<string | null>(null);
  const [endUpdatedDate, setEndUpdatedDate] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedLeadIdSingle, setSelectedLeadIdSingle] = useState<
    number | null
  >(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { cpLeads, loading, error } = useSelector(
    (state: RootState) => state.lead
  );
  const {
    admin_user_id,
    admin_user_type,
    assigned_user_type,
    lead_source_user_id,
    assigned_id,
    name,
  } = location.state || {};
  const itemsPerPage = 10;
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const params = {
        lead_added_user_type: admin_user_type || user.user_type,
        lead_added_user_id: admin_user_id || user.id,
        lead_source_user_id: lead_source_user_id || user.id,
        assigned_user_type: user.user_type,
        assigned_id,
      };
      dispatch(getLeadsByID(params))
        .unwrap()
        .catch((err) => {
          toast.error(err || "Failed to fetch leads");
        });
    }
    return () => {
      dispatch(clearLeads());
    };
  }, [isAuthenticated, user, admin_user_id, admin_user_type, dispatch]);
  const filteredLeads =
    cpLeads?.filter((item) => {
      const matchesSearch = !searchQuery
        ? true
        : item.customer_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.customer_phone_number.includes(searchQuery) ||
          item.customer_email
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.interested_project_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.assigned_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.assigned_emp_number.includes(searchQuery);
      const matchesStatus = !selectedStatus
        ? true
        : item.status_id.toString() === selectedStatus;
      const itemCreatedDate = item.created_date?.split("T")[0] || "";
      const matchesCreatedDate =
        (!startCreatedDate || itemCreatedDate >= startCreatedDate) &&
        (!endCreatedDate || itemCreatedDate <= endCreatedDate);
      const itemUpdatedDate = item.updated_date?.split("T")[0] || "";
      const matchesUpdatedDate =
        (!startUpdatedDate || itemUpdatedDate >= startUpdatedDate) &&
        (!endUpdatedDate || itemUpdatedDate <= endUpdatedDate);
      const matchesCity = !selectedCity
        ? true
        : item.city?.toString() === selectedCity;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesCreatedDate &&
        matchesUpdatedDate &&
        matchesCity
      );
    }) || [];
  const totalCount = filteredLeads.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentLeads = filteredLeads.slice(
    (localPage - 1) * itemsPerPage,
    localPage * itemsPerPage
  );
  const getUserType =
    userTypeOptions.find(
      (option) => option.value === assigned_user_type?.toString()
    )?.label || "Unknown";
  const handleSearch = (value: string) => {
    setSearchQuery(value.trim());
    setLocalPage(1);
  };
  const handleStatusChange = (value: string | null) => {
    setSelectedStatus(value || "");
    setLocalPage(1);
  };
  const handleStartCreatedDateChange = (date: string | null) => {
    setStartCreatedDate(date);
    setLocalPage(1);
  };
  const handleEndCreatedDateChange = (date: string | null) => {
    setEndCreatedDate(date);
    setLocalPage(1);
  };
  const handleStartUpdatedDateChange = (date: string | null) => {
    setStartUpdatedDate(date);
    setLocalPage(1);
  };
  const handleStateChange = (value: string | null) => {
    setSelectedState(value);
    setSelectedCity(null);
    setLocalPage(1);
  };
  const handleCityChange = (value: string | null) => {
    setSelectedCity(value);
    setLocalPage(1);
  };
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setStartCreatedDate(null);
    setEndCreatedDate(null);
    setStartUpdatedDate(null);
    setEndUpdatedDate(null);
    setSelectedState(null);
    setSelectedCity(null);
    setLocalPage(1);
  };
  const goToPage = (page: number) => setLocalPage(page);
  const goToPreviousPage = () => localPage > 1 && goToPage(localPage - 1);
  const goToNextPage = () => localPage < totalPages && goToPage(localPage + 1);
  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = Math.max(1, localPage - Math.floor(totalVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);
    if (endPage - startPage + 1 < totalVisiblePages) {
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };
  const handleViewHistory = (item: Lead) => {
    navigate("/leads/view", { state: { property: item } });
  };
  const handleLeadAssign = (leadId: number) => {
    navigate(`/leads/assign/${leadId}`);
  };
  const handleMarkAsBooked = (leadId: number) => {
    const lead = currentLeads.find((item) => item.lead_id === leadId);
    if (lead) {
      navigate(`/leads/book/${leadId}`, {
        state: {
          leadId,
          leadAddedUserId: admin_user_id || user!.id,
          leadAddedUserType: admin_user_type || user!.user_type,
          propertyId: lead.interested_project_id || 2,
        },
      });
    } else {
      toast.error("Lead not found");
    }
  };
  const handleCheckboxChange = (leadId: number) => {
    setSelectedLeadIdSingle((prev) => (prev === leadId ? null : leadId));
  };
  const handleBulkAssign = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select a lead.");
      return;
    }
    handleLeadAssign(selectedLeadIdSingle);
  };
  const handleBulkViewHistory = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select a lead.");
      return;
    }
    const lead = currentLeads.find(
      (item) => item.lead_id === selectedLeadIdSingle
    );
    if (lead) handleViewHistory(lead);
  };
  const handleBulkBookingDone = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select a lead.");
      return;
    }
    handleMarkAsBooked(selectedLeadIdSingle);
  };
  return (
    <div className="relative min-h-screen">
      <PageMeta title="Lead Management - All Leads" />
      <FilterBar
        showUserTypeFilter={false}
        showStatusFilter={true}
        showCreatedDateFilter={true}
        showUpdatedDateFilter={true}
        showStateFilter={true}
        showCityFilter={true}
        statusFilterOptions={statusOptions}
        onStatusChange={handleStatusChange}
        onCreatedDateChange={handleStartCreatedDateChange}
        onCreatedEndDateChange={handleEndCreatedDateChange}
        onUpdatedDateChange={handleStartUpdatedDateChange}
        onStateChange={handleStateChange}
        onCityChange={handleCityChange}
        onClearFilters={handleClearFilters}
        createdDate={startCreatedDate}
        createdEndDate={endCreatedDate}
        updatedDate={startUpdatedDate}
        selectedStatus={selectedStatus}
        selectedState={selectedState}
        selectedCity={selectedCity}
        className="mb-4"
      />
      <div className="mb-4 flex gap-2">
        <PageBreadcrumbList
          pageTitle={`${getUserType} - ${name} All Leads`}
          pagePlacHolder="Search by Customer Name, Mobile, Email, Project, Budget, Priority, or Status"
          onFilter={handleSearch}
        />
        <Button
          variant="primary"
          onClick={handleBulkAssign}
          disabled={selectedLeadIdSingle === null}
          className="px-4 py-1 h-10"
        >
          Assign Lead
        </Button>
        <Button
          variant="primary"
          onClick={handleBulkViewHistory}
          disabled={selectedLeadIdSingle === null}
          className="px-4 py-1 h-10"
        >
          View History
        </Button>
        <Button
          variant="primary"
          onClick={handleBulkBookingDone}
          disabled={selectedLeadIdSingle === null}
          className="px-4 py-1 h-10"
        >
          Booking Done
        </Button>
      </div>
      <div className="space-y-6">
        {loading && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-4">
            Loading leads...
          </div>
        )}
        {error && <div className="text-center text-red-500 py-4">{error}</div>}
        {!loading && !error && filteredLeads.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-4">
            No leads found.
          </div>
        )}
        {!loading && !error && filteredLeads.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table className="w-full table-layout-fixed overflow-x-auto">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-blue-900">
                  <TableRow className="text-white">
                    <TableCell
                      isHeader
                      className="text-center font-medium text-xs whitespace-nowrap"
                    >
                      Select
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Number
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Project
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Lead Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Created
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Updated
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      City
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {currentLeads.map((item, index) => (
                    <TableRow
                      key={item.lead_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap w-[10%]">
                        <input
                          type="checkbox"
                          checked={selectedLeadIdSingle === item.lead_id}
                          onChange={() => handleCheckboxChange(item.lead_id)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        {item.customer_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.customer_phone_number || "N/A"}
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        {item.interested_project_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.status_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.created_date?.split("T")[0] || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.updated_date?.split("T")[0] || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.city || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {filteredLeads.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(localPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(localPage * itemsPerPage, filteredLeads.length)} of{" "}
              {filteredLeads.length} entries
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant={localPage === 1 ? "outline" : "primary"}
                size="sm"
                onClick={goToPreviousPage}
                disabled={localPage === 1}
              >
                Previous
              </Button>
              {getPaginationItems().map((page, index) => (
                <Button
                  key={`${page}-${index}`}
                  variant={page === localPage ? "primary" : "outline"}
                  size="sm"
                  onClick={() => typeof page === "number" && goToPage(page)}
                  disabled={page === "..."}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant={localPage === totalPages ? "outline" : "primary"}
                size="sm"
                onClick={goToNextPage}
                disabled={localPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default EmpLeads;
