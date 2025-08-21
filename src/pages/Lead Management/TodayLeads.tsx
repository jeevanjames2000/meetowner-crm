import React, { useState, useEffect, useMemo } from "react";
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
import {
  clearLeads,
  getPropertyEnquiries,
  getTodayLeads,
  insertLead,
} from "../../store/slices/leadslice";
import FilterBar from "../../components/common/FilterBar";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import UpdateLeadModal from "./UpdateLeadModel";
import { sidebarSubItems } from "./CustomComponents";
import { useNavigate, useParams } from "react-router";
interface PropertyEnquiry {
  lead_id?: number;
  id?: number;
  unique_property_id: string;
  fullname: string | null;
  email: string | null;
  mobile: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_date?: string | null;
  updated_date?: string | null;
  created_time?: string | null;
  sent_status?: number;
  sub_type: string;
  property_for: string;
  property_type?: string | null;
  property_in: string;
  state_id: string | null;
  city_id: string;
  location_id?: string;
  property_cost?: string;
  budget?: string;
  bedrooms?: string;
  bathroom?: number;
  facing?: string;
  car_parking?: number;
  bike_parking?: number;
  description?: string;
  image?: string;
  google_address: string;
  property_name: string;
  userDetails?: {
    id?: number;
    name?: string;
    email?: string;
    mobile?: string;
  };
}
const userTypeMap: { [key: number]: string } = {
  3: "Channel Partner",
  4: "Sales Manager",
  5: "Telecallers",
  6: "Marketing Executors",
  7: "Receptionists",
};
const formatToIndianCurrency = (value: string | null): string => {
  if (!value || isNaN(parseFloat(value))) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};
const getLeadIdentifier = (item: PropertyEnquiry): string | number => {
  if (item.lead_id !== undefined) return item.lead_id;
  if (item.id !== undefined) return item.id;
  return item.unique_property_id;
};
const isValidDate = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};
const normalizeDate = (dateStr: string | null): string | null => {
  if (!dateStr || !isValidDate(dateStr)) return null;
  return new Date(dateStr).toISOString().split("T")[0];
};
const TodayLeads: React.FC = () => {
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
    number | string | null
  >(null);
  const navigate = useNavigate();
  const { lead_in, status } = useParams<{ lead_in: string; status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { todayLeads, loading, error } = useSelector(
    (state: RootState) => state.lead
  );
  const deduplicatedLeads = useMemo(() => {
    const seen = new Map<string, PropertyEnquiry>();
    (Array.isArray(todayLeads) ? todayLeads : []).forEach((item) => {
      const key = item.unique_property_id;
      const existing = seen.get(key);
      const itemCreatedDate = normalizeDate(
        item.created_at || item.created_date
      );
      const existingCreatedDate = existing
        ? normalizeDate(existing.created_at || existing.created_date)
        : null;

      if (
        !existing ||
        (item.lead_id && !existing.lead_id) ||
        (itemCreatedDate &&
          existingCreatedDate &&
          itemCreatedDate > existingCreatedDate)
      ) {
        seen.set(key, item);
      }
    });
    return Array.from(seen.values());
  }, [todayLeads]);

  const userId =
    user?.user_id || parseInt(localStorage.getItem("userId") || "96", 10);
  const itemsPerPage = 10;
  const statusId = parseInt(status || "0", 10);
  const stateOptions = useMemo(() => {
    const uniqueStates = [
      ...new Set(
        deduplicatedLeads
          ?.map((item: PropertyEnquiry) => item.state_id)
          .filter((state): state is string => state !== null)
      ),
    ];
    return uniqueStates.map((state) => ({
      value: state,
      label: state,
    }));
  }, [deduplicatedLeads]);
  const cityOptions = useMemo(() => {
    const filteredLeads = selectedState
      ? deduplicatedLeads?.filter(
          (item: PropertyEnquiry) =>
            item.state_id &&
            item.state_id.toLowerCase() === selectedState.toLowerCase()
        )
      : deduplicatedLeads;
    const uniqueCities = [
      ...new Set(filteredLeads?.map((item: PropertyEnquiry) => item.city_id)),
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
  useEffect(() => {
    dispatch(getTodayLeads({ user_id: userId }))
      .unwrap()
      .catch((err) => {
        console.error("Error fetching todayLeads:", err);
        toast.error(err || "Failed to fetch property enquiries");
      });
    return () => {
      dispatch(clearLeads());
    };
  }, [dispatch, userId, statusUpdated]);
  const filteredLeads = useMemo(() => {
    const leads =
      deduplicatedLeads?.filter((item: PropertyEnquiry) => {
        const itemCreatedDate = item.created_at || item.created_date;
        const itemUpdatedDate = item.updated_at || item.updated_date;
        const normalizedItemCreatedDate = normalizeDate(itemCreatedDate);
        const normalizedItemUpdatedDate = normalizeDate(itemUpdatedDate);
        const matchesSearch = !searchQuery
          ? true
          : (item.fullname || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (item.mobile || "").includes(searchQuery) ||
            (item.email || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (item.property_name || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (item.sub_type || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (item.property_for || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
        const matchesUserType = !selectedUserType
          ? true
          : item.userDetails?.id?.toString() === selectedUserType;
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
          ? normalizedItemUpdatedDate >= createdDate &&
            normalizedItemUpdatedDate <= updatedDate
          : false;
        const matchesState = !selectedState
          ? true
          : item.state_id
          ? item.state_id.toLowerCase() === selectedState.toLowerCase()
          : false;
        const matchesCity = !selectedCity
          ? true
          : item.city_id.toLowerCase() === selectedCity.toLowerCase();
        if (itemCreatedDate && !isValidDate(itemCreatedDate)) {
          console.warn(
            `Invalid created_date/at for lead ${item.lead_id || item.id}:`,
            itemCreatedDate
          );
        }
        if (itemUpdatedDate && !isValidDate(itemUpdatedDate)) {
          console.warn(
            `Invalid updated_date/at for lead ${item.lead_id || item.id}:`,
            itemUpdatedDate
          );
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
  const getPageTitle = () => sidebarItem?.name || "Today Leads";
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
  const handleViewHistory = (item: PropertyEnquiry) => {
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
  const handleCheckboxChange = (identifier: string | number) => {
    setSelectedLeadIdSingle((prev) =>
      prev === identifier ? null : identifier
    );
  };
  const handleBulkAssign = async () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select an enquiry.");
      return;
    }
    const lead = currentLeads.find(
      (item: PropertyEnquiry) =>
        getLeadIdentifier(item) === selectedLeadIdSingle
    );
    if (!lead) {
      toast.error("Selected lead not found.");
      return;
    }
    if (lead.lead_id) {
      navigate(`/leads/assign/${lead.lead_id}`);
    } else {
      const leadData = {
        unique_property_id: lead.unique_property_id,
        fullname: lead.fullname || lead.userDetails?.name || "N/A",
        email: lead.email || lead.userDetails?.email || null,
        mobile: lead.mobile || lead.userDetails?.mobile || "N/A",
        sub_type: lead.sub_type || "N/A",
        property_for: lead.property_for || "N/A",
        property_in: lead.property_in || "N/A",
        state_id: lead.state_id || "N/A",
        city_id: lead.city_id || "N/A",
        budget: lead.property_cost || lead.budget || "0.00",
        google_address: lead.google_address || "N/A",
        property_name: lead.property_name || "N/A",
        lead_source_id: 3,
        lead_added_user_type: 1,
        lead_added_user_id: userId || 4,
      };
      const resultAction = await dispatch(insertLead(leadData));
      if (insertLead.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        if (response.lead_id) {
          toast.success("Lead inserted successfully.");
          await dispatch(
            getTodayLeads({ user_id: leadData.lead_added_user_id })
          );
          navigate(`/leads/assign/${response.lead_id}`);
        } else {
          toast.error("Failed to retrieve new lead ID.");
        }
      } else {
        toast.error(resultAction.payload || "Failed to insert lead");
      }
    }
  };
  const handleBulkViewHistory = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select an enquiry.");
      return;
    }
    const lead = currentLeads.find(
      (item: PropertyEnquiry) =>
        getLeadIdentifier(item) === selectedLeadIdSingle
    );
    if (lead) handleViewHistory(lead);
  };
  return (
    <div className="relative min-h-screen">
      <PageMeta title={`Property Enquiries - ${getPageTitle()}`} />
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
          pagePlacHolder="Search by Name, Mobile, Email, Project, Type"
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
            Loading enquiries...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 py-4">
            {error}
            <Button
              variant="primary"
              size="sm"
              onClick={() => dispatch(getTodayLeads({ user_id: userId }))}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        )}
        {!loading && !error && filteredLeads.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-4">
            No enquiries found.
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
                      className="text-center font-medium text-xs whitespace-nowrap w-[5%]"
                    >
                      Select
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[15%]"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[15%]"
                    >
                      Mobile
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[15%]"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[15%]"
                    >
                      Project
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[10%]"
                    >
                      Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[10%]"
                    >
                      For
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[10%]"
                    >
                      City
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[10%]"
                    >
                      State
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[10%]"
                    >
                      Property Cost
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-left font-medium text-xs whitespace-nowrap w-[10%]"
                    >
                      Budget
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {currentLeads.map((item: PropertyEnquiry) => (
                    <TableRow
                      key={getLeadIdentifier(item)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedLeadIdSingle === getLeadIdentifier(item)
                          }
                          onChange={() =>
                            handleCheckboxChange(getLeadIdentifier(item))
                          }
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span
                          title={
                            item.fullname || item.userDetails?.name || "N/A"
                          }
                        >
                          {item.fullname || item.userDetails?.name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        {item.mobile || item.userDetails?.mobile || "N/A"}
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span
                          title={item.email || item.userDetails?.email || "N/A"}
                        >
                          {item.email || item.userDetails?.email || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span title={item.property_name || "N/A"}>
                          {item.property_name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        {item.sub_type || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.property_for || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.city_id || "N/A"}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.state_id || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatToIndianCurrency(item.property_cost) || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
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
export default TodayLeads;
