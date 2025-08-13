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
import { clearLeads, getPropertyEnquiries } from "../../store/slices/leadslice";
import FilterBar from "../../components/common/FilterBar";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import UpdateLeadModal from "./UpdateLeadModel";
import { BUILDER_USER_TYPE, sidebarSubItems } from "./CustomComponents";
import { useNavigate, useParams } from "react-router";

interface PropertyEnquiry {
  id: number;
  unique_property_id: string;
  fullname: string;
  email: string | null;
  mobile: string;
  created_date: string;
  updated_date: string;
  created_time: string;
  sent_status: number;
  sub_type: string;
  property_for: string;
  property_type: string | null;
  property_in: string;
  state_id: string;
  city_id: string;
  location_id: string;
  property_cost: string;
  bedrooms: string;
  bathroom: number;
  facing: string;
  car_parking: number;
  bike_parking: number;
  description: string;
  image: string;
  google_address: string;
  property_name: string;
  userDetails: {
    id: number;
    name: string;
    email: string;
    mobile: string;
  };
}

const userTypeMap: { [key: number]: string } = {
  3: "Channel Partner",
  4: "Sales Manager",
  5: "Telecallers",
  6: "Marketing Executors",
  7: "Receptionists",
};
const formatToIndianCurrency = (value) => {
  if (!value || isNaN(value)) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};
const OpenLeads: React.FC = () => {
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
  const { openLeads, loading, error } = useSelector(
    (state: RootState) => state.lead
  );

  const isBuilder = user?.user_type === BUILDER_USER_TYPE;
  const userId =
    user?.id || parseInt(localStorage.getItem("userId") || "96", 10);
  const itemsPerPage = 10;
  const statusId = parseInt(status || "0", 10);

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
    if (isAuthenticated && userId) {
      dispatch(getPropertyEnquiries({ user_id: userId }))
        .unwrap()
        .catch((err) => {
          toast.error(err || "Failed to fetch property enquiries");
        });
    }
    return () => {
      dispatch(clearLeads());
    };
  }, [isAuthenticated, userId, statusUpdated, dispatch]);

  const filteredLeads = useMemo(() => {
    return (
      openLeads?.filter((item: PropertyEnquiry) => {
        const matchesSearch = !searchQuery
          ? true
          : item.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mobile.includes(searchQuery) ||
            (item.email &&
              item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.property_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            item.sub_type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesUserType = !selectedUserType
          ? true
          : item.userDetails.id.toString() === selectedUserType; // Assuming userDetails.id relates to user type

        const matchesCreatedDate = !createdDate
          ? true
          : item.created_date.split("T")[0] === createdDate;

        const matchesUpdatedDate = !updatedDate
          ? true
          : item.updated_date.split("T")[0] === updatedDate;

        const matchesState = !selectedState
          ? true
          : item.state_id.toLowerCase() === selectedState.toLowerCase();

        const matchesCity = !selectedCity
          ? true
          : item.city_id.toLowerCase() === selectedCity.toLowerCase();

        return (
          matchesSearch &&
          matchesUserType &&
          matchesCreatedDate &&
          matchesUpdatedDate &&
          matchesState &&
          matchesCity
        );
      }) || []
    );
  }, [
    openLeads,
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

  const getPageTitle = () => sidebarItem?.name || "Property Enquiries";

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

  const handleMarkAsBooked = (leadId: number) => {
    const lead = currentLeads.find(
      (item: PropertyEnquiry) => item.id === leadId
    );
    if (lead) {
      navigate(`/leads/book/${leadId}`, {
        state: {
          leadId,
          leadAddedUserId: isBuilder ? user!.id : user!.created_user_id!,
          leadAddedUserType: isBuilder
            ? user!.user_type
            : Number(user!.created_user_type),
          propertyId: lead.id,
        },
      });
    } else {
      toast.error("Enquiry not found");
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
    setCreatedDate(date);
    setLocalPage(1);
  };

  const handleUpdatedDateChange = (date: string | null) => {
    setUpdatedDate(date);
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
      toast.error("Please select an enquiry.");
      return;
    }
    handleLeadAssign(selectedLeadIdSingle);
  };

  const handleBulkViewHistory = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select an enquiry.");
      return;
    }
    const lead = currentLeads.find(
      (item: PropertyEnquiry) => item.id === selectedLeadIdSingle
    );
    if (lead) handleViewHistory(lead);
  };

  const handleBulkBookingDone = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select an enquiry.");
      return;
    }
    handleMarkAsBooked(selectedLeadIdSingle);
  };

  const handleBulkUpdateLead = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select an enquiry.");
      return;
    }
    handleUpdateLead(selectedLeadIdSingle);
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
        {error && <div className="text-center text-red-500 py-4">{error}</div>}
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
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {currentLeads.map((item: PropertyEnquiry) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedLeadIdSingle === item.id}
                          onChange={() => handleCheckboxChange(item.id)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span
                          title={
                            item.fullname || item.userDetails.name || "N/A"
                          }
                        >
                          {item.fullname || item.userDetails.name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        {item.mobile || item.userDetails.mobile || "N/A"}
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span
                          title={item.email || item.userDetails.email || "N/A"}
                        >
                          {item.email || item.userDetails.email || "N/A"}
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

export default OpenLeads;
