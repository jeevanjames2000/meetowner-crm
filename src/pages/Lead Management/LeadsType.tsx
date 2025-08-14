import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
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
import { clearLeads, getLeadsByUser } from "../../store/slices/leadslice";
import toast from "react-hot-toast";
import { BUILDER_USER_TYPE, sidebarSubItems } from "./CustomComponents";
import UpdateLeadModal from "./UpdateLeadModel";
import FilterBar from "../../components/common/FilterBar";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";

interface Lead {
  lead_id: number;
  unique_property_id: string;
  customer_name: string | null;
  customer_phone_number: string | null;
  customer_email: string | null;
  interested_project_id?: number;
  interested_project_name: string | null;
  city_id: string | null;
  state_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_date?: string | null;
  updated_date?: string | null;
  assigned_name: string | null;
  assigned_emp_number: string | null;
  assigned_user_type: number | null;
  status_id: number;
  budget: string | null;
  property_for: string | null;
  sub_type: string | null;
}

const userTypeMap: { [key: number]: string } = {
  3: "Channel Partner",
  4: "Sales Manager",
  5: "Telecallers",
  6: "Marketing Executors",
  7: "Receptionists",
};

const statusMap: Record<number, string> = {
  1: "Open",
  2: "Follow Up",
  3: "In Progress",
  4: "Site Visit Scheduled",
  5: "Site Visit Done",
  6: "Won",
  7: "Lost",
  8: "Revoked",
};

const formatToIndianCurrency = (value: string | null): string => {
  if (!value || isNaN(parseFloat(value))) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};

// Utility to validate date strings
const isValidDate = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// Normalize date to YYYY-MM-DD
const normalizeDate = (dateStr: string | null): string | null => {
  if (!dateStr || !isValidDate(dateStr)) return null;
  return new Date(dateStr).toISOString().split("T")[0];
};

const LeadsType: React.FC = () => {
  const [localPage, setLocalPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [statusUpdated, setStatusUpdated] = useState<boolean>(false);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [updatedDate, setUpdatedDate] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedLeadIdSingle, setSelectedLeadIdSingle] = useState<
    number | null
  >(null);

  const navigate = useNavigate();
  const { lead_in, status } = useParams<{ lead_in: string; status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { leads, loading, error } = useSelector(
    (state: RootState) => state.lead
  );

  console.log("user:", user);
  console.log("leads (raw):", leads);

  // Deduplicate leads by unique_property_id
  const deduplicatedLeads = useMemo(() => {
    const seen = new Map<string, Lead>();
    leads?.forEach((item) => {
      const key = item.unique_property_id;
      const existing = seen.get(key);
      const itemCreatedDate = normalizeDate(item.created_at || item.created_date);
      const existingCreatedDate = existing
        ? normalizeDate(existing.created_at || existing.created_date)
        : null;

      if (
        !existing ||
        (item.lead_id && !existing.lead_id) ||
        (itemCreatedDate && existingCreatedDate && itemCreatedDate > existingCreatedDate)
      ) {
        seen.set(key, item);
      }
    });
    const result = Array.from(seen.values());

    return result;
  }, [leads]);

  const isBuilder = user?.user_type === BUILDER_USER_TYPE;
  const itemsPerPage = 10;
  const statusId = parseInt(status || "0", 10);

  // Derive state options
  const stateOptions = useMemo(() => {
    const uniqueStates = [
      ...new Set(
        deduplicatedLeads
          ?.map((item: Lead) => item.state_id)
          .filter((state): state is string => state !== null)
      ),
    ];
    return uniqueStates.map((state) => ({
      value: state,
      label: state,
    }));
  }, [deduplicatedLeads]);

  // Derive city options
  const cityOptions = useMemo(() => {
    const filteredLeads = selectedState
      ? deduplicatedLeads?.filter(
        (item: Lead) =>
          item.state_id &&
          item.state_id.toLowerCase() === selectedState.toLowerCase()
      )
      : deduplicatedLeads;
    const uniqueCities = [
      ...new Set(filteredLeads?.map((item: Lead) => item.city_id)),
    ];
    return uniqueCities.map((city) => ({
      value: city,
      label: city,
    }));
  }, [deduplicatedLeads, selectedState]);

  const sidebarItem = sidebarSubItems.find(
    (item) =>
      item.lead_in.toLowerCase() === lead_in?.toLowerCase() &&
      item.status === statusId
  );

  const userFilterOptions = useMemo(
    () =>
      Object.entries(userTypeMap).map(([value, label]) => ({
        value: value.toString(),
        label,
      })),
    []
  );

  const leadsParams = useMemo(() => {
    if (!isAuthenticated || !user?.id || !user?.user_type || statusId < 0) {
      return null;
    }
    return { status_id: statusId };
  }, [user, statusId]);

  useEffect(() => {
    if (leadsParams) {
      dispatch(getLeadsByUser(leadsParams))
        .unwrap()
        .catch((err) => {
          console.error("Error fetching leads:", err);
          toast.error(err || "Failed to fetch leads");
        });
    }
    return () => {
      dispatch(clearLeads());
    };
  }, [leadsParams, dispatch, statusUpdated]);

  const filteredLeads = useMemo(() => {
    const leads = deduplicatedLeads?.filter((item: Lead) => {
      const itemCreatedDate = item.created_at || item.created_date;
      const itemUpdatedDate = item.updated_at || item.updated_date;

      const normalizedItemCreatedDate = normalizeDate(itemCreatedDate);
      const normalizedItemUpdatedDate = normalizeDate(itemUpdatedDate);

      const matchesSearch = !searchQuery
        ? true
        : (item.fullname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.
          mobile
          || "").includes(searchQuery) ||
        (item.
          email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.interested_project_name || item.property_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.assigned_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.assigned_emp_number || "").includes(searchQuery);

      const matchesUserType = !selectedUserType
        ? true
        : item.assigned_user_type?.toString() === selectedUserType;

      const matchesCreatedDate = !createdDate
        ? true
        : normalizedItemCreatedDate
          ? updatedDate
            ? normalizedItemCreatedDate >= createdDate
            : normalizedItemCreatedDate === createdDate
          : false;

      const matchesUpdatedDate = !updatedDate
        ? true
        : normalizedItemUpdatedDate && createdDate
          ? normalizedItemUpdatedDate >= createdDate && normalizedItemUpdatedDate <= updatedDate
          : false;

      const matchesState = !selectedState
        ? true
        : item.state_id
          ? item.state_id.toLowerCase() === selectedState.toLowerCase()
          : false;

      const matchesCity = !selectedCity
        ? true
        : item.city_id
          ? item.city_id.toLowerCase() === selectedCity.toLowerCase()
          : false;

      if (itemCreatedDate && !isValidDate(itemCreatedDate)) {
        console.warn(`Invalid created_date/at for lead ${item.lead_id}:`, itemCreatedDate);
      }
      if (itemUpdatedDate && !isValidDate(itemUpdatedDate)) {
        console.warn(`Invalid updated_date/at for lead ${item.lead_id}:`, itemUpdatedDate);
      }

      const isMatch =
        matchesSearch &&
        matchesUserType &&
        matchesCreatedDate &&
        matchesUpdatedDate &&
        matchesState &&
        matchesCity;

    

      return isMatch;
    }) || [];

 

    return leads;
  }, [
    deduplicatedLeads,
    searchQuery,
    selectedUserType,
    createdDate,
    updatedDate,
    selectedState,
    selectedCity,
  ]);

  const totalCount = filteredLeads.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentLeads = filteredLeads.slice(
    (localPage - 1) * itemsPerPage,
    localPage * itemsPerPage
  );



  const getPageTitle = () => sidebarItem?.name || "Leads";

  const handleSearch = (value: string) => {

    setSearchQuery(value.trim());
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

  const handleUpdateModalSubmit = (data: any) => {
    setStatusUpdated(!statusUpdated);
    setIsUpdateModalOpen(false);
    setSelectedLeadId(null);
  };

  const handleMarkAsBooked = (leadId: number) => {
    const lead = currentLeads.find((item) => item.lead_id === leadId);
    if (lead) {
      navigate(`/leads/book/${leadId}`, {
        state: {
          leadId,
          leadAddedUserId: isBuilder ? user!.id : user!.created_user_id!,
          leadAddedUserType: isBuilder
            ? user!.user_type
            : Number(user!.created_user_type),
          propertyId: lead.interested_project_id || 2,
        },
      });
    } else {
      toast.error("Lead not found");
    }
  };

  const handleUpdateLead = (leadId: number) => {
    setSelectedLeadId(leadId);
    setIsUpdateModalOpen(true);
  };

  const handleUserTypeChange = (value: string | null) => {
  
    setSelectedUserType(value);
    setLocalPage(1);
  };

  const handleCreatedDateChange = (date: string | null) => {
    const normalized = normalizeDate(date);
  
    setCreatedDate(normalized);
    setLocalPage(1);
  };

  const handleUpdatedDateChange = (date: string | null) => {
    const normalized = normalizeDate(date);
  
    if (normalized && createdDate && normalized < createdDate) {
      toast.error("Update date cannot be before start date.");
      return;
    }
    setUpdatedDate(normalized);
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
    setSelectedUserType(null);
    setCreatedDate(null);
    setUpdatedDate(null);
    setSelectedState(null);
    setSelectedCity(null);
    setSearchQuery("");
    setLocalPage(1);
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

  return (
    <div className="relative min-h-screen">
      <PageMeta title={`Lead Management - ${getPageTitle()}`} />
      <FilterBar
        showUserTypeFilter={true}
        showCreatedDateFilter={true}
        showUpdatedDateFilter={true}
        showStateFilter={true}
        showCityFilter={true}
        userFilterOptions={userFilterOptions}
        stateOptions={stateOptions}
        cityOptions={cityOptions}
        onUserTypeChange={handleUserTypeChange}
        onCreatedDateChange={handleCreatedDateChange}
        onUpdatedDateChange={handleUpdatedDateChange}
        onStateChange={handleStateChange}
        onCityChange={handleCityChange}
        onClearFilters={handleClearFilters}
        selectedUserType={selectedUserType}
        createdDate={createdDate}
        updatedDate={updatedDate}
        selectedState={selectedState}
        selectedCity={selectedCity}
        className="mb-4"
      />
      <div className="mb-4 flex gap-2">
        <PageBreadcrumbList
          pageTitle={getPageTitle()}
          pagePlacHolder="Search by Name, Mobile, Email, Project"
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
          size="xs"
          className="px-4 py-2 h-10"
        >
          View History
        </Button>
      </div>
      <div className="space-y-6">
        {loading && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-4">
            Loading leads...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 py-4">
            {error}
            <Button
              variant="primary"
              size="sm"
              onClick={() => dispatch(getLeadsByUser(leadsParams))}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        )}
        {!loading && !error && filteredLeads.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-4">
            No leads found.
          </div>
        )}
        {!loading && !error && filteredLeads.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-blue-900 text-white">
                  <TableRow>
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
                      Mobile
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Property Id
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
                      Updated
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Assigned
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      City
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap"
                    >
                      Budget
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {currentLeads.map((item: Lead) => (
                    <TableRow
                      key={item.lead_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedLeadIdSingle === item.lead_id}
                          onChange={() => handleCheckboxChange(item.lead_id)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span title={item.fullname || "N/A"}>
                          {item.fullname
                            || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        {item.

                          mobile
                          || "N/A"}
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span title={item.unique_property_id || "N/A"}>
                          {item.unique_property_id || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span title={item.
                          property_name || "N/A"}>
                          {item.
                            property_name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        {statusMap[item.status_id] || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {normalizeDate(item.updated_at || item.updated_date) || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {userTypeMap[item.assigned_user_type || 0] || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.city_id || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {formatToIndianCurrency(item.budget) || "N/A"}
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
      {isUpdateModalOpen && selectedLeadId && (
        <UpdateLeadModal
          leadId={selectedLeadId}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateModalSubmit}
        />
      )}
    </div>
  );
};

export default LeadsType;