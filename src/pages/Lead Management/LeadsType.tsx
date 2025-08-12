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

const userTypeMap: { [key: number]: string } = {
  3: "Channel Partner",
  4: "Sales Manager",
  5: "Telecallers",
  6: "Marketing Executors",
  7: "Receptionists",
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

  
  const [selectedLeadIdSingle, setSelectedLeadIdSingle] = useState<number | null>(null);

  const navigate = useNavigate();
  const { lead_in, status } = useParams<{ lead_in: string; status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { leads, loading, error } = useSelector((state: RootState) => state.lead);

  const isBuilder = user?.user_type === BUILDER_USER_TYPE;

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

  const leadsParams = useMemo(() => {
    if (
      !isAuthenticated ||
      !user?.id ||
      !user?.user_type ||
      statusId < 0 ||
      (!isBuilder && (!user?.created_user_id || user?.created_user_type === undefined))
    ) {
      return null;
    }

    const params = {
      lead_added_user_id: isBuilder ? user.id : user.created_user_id!,
      lead_added_user_type: isBuilder ? user.user_type : Number(user.created_user_type),
      status_id: statusId,
    };

    if (!isBuilder) {
      return {
        ...params,
        assigned_user_type: user.user_type,
        assigned_id: user.id,
      };
    }

    return params;
  }, [isAuthenticated, user, statusId, isBuilder]);

  useEffect(() => {
    if (leadsParams) {
      dispatch(getLeadsByUser(leadsParams)).unwrap().catch((err) => {
        
      });
    } else if (isAuthenticated && user) {
      console.warn("Invalid user data:", {
        id: user.id,
        user_type: user.user_type,
        created_user_id: user.created_user_id,
        created_user_type: user.created_user_type,
        statusId,
      });
    }
    return () => {
      dispatch(clearLeads());
    };
  }, [leadsParams, dispatch, statusUpdated]);

  const filteredLeads = useMemo(() => {
    return (
      leads?.filter((item) => {
        const matchesSearch = !searchQuery
          ? true
          : item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer_phone_number.includes(searchQuery) ||
            item.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.interested_project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.assigned_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.assigned_emp_number.includes(searchQuery);

        const matchesUserType = !selectedUserType
          ? true
          : item.assigned_user_type === parseInt(selectedUserType);

        const matchesCreatedDate = !createdDate
          ? true
          : item.created_date.split("T")[0] === createdDate;

        const matchesUpdatedDate = !updatedDate
          ? true
          : item.updated_date?.split("T")[0] === updatedDate;

        const matchesCity = !selectedCity
          ? true
          : item.city?.toString() === selectedCity;

        return matchesSearch && matchesUserType && matchesCreatedDate && matchesUpdatedDate && matchesCity;
      }) || []
    );
  }, [leads, searchQuery, selectedUserType, createdDate, updatedDate, selectedState, selectedCity]);

  const totalCount = filteredLeads.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentLeads = filteredLeads.slice(
    (localPage - 1) * itemsPerPage,
    localPage * itemsPerPage
  );
  console.log("currentLeads: ", currentLeads);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          leadAddedUserType: isBuilder ? user!.user_type : Number(user!.created_user_type),
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
    const lead = currentLeads.find((item) => item.lead_id === selectedLeadIdSingle);
    if (lead) handleViewHistory(lead);
  };

  const handleBulkBookingDone = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select a lead.");
      return;
    }
    handleMarkAsBooked(selectedLeadIdSingle);
  };

  const handleBulkUpdateLead = () => {
    if (selectedLeadIdSingle === null) {
      toast.error("Please select a lead.");
      return;
    }
    handleUpdateLead(selectedLeadIdSingle);
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
        {isBuilder ? (
          <>
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
            <Button
              variant="primary"
              onClick={handleBulkBookingDone}
              disabled={selectedLeadIdSingle === null}
              className="px-4 py-2 h-10"
            >
              Booking Done
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={handleBulkUpdateLead}
              disabled={selectedLeadIdSingle === null}
              className="px-4 py-2 h-10"
            >
              Update Lead
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkViewHistory}
              disabled={selectedLeadIdSingle === null}
              className="px-4 py-2 h-10"
            >
              View History
            </Button>
          </>
        )}
      </div>

      <div className="space-y-6">
        {loading && <div className="text-center text-gray-600 dark:text-gray-400 py-4">Loading leads...</div>}
        {error && <div className="text-center text-red-500 py-4">{error}</div>}
        {!loading && !error && filteredLeads.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-4">No leads found.</div>
        )}
        {!loading && !error && filteredLeads.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow className="bg-blue-900 text-white">
                    <TableCell isHeader className="text-center font-medium text-xs whitespace-nowrap">
                      Select
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
                      Name
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
                      Number
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
                      Project
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
                      Lead Type
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
                      Created
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
                      Updated
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
                      Assigned
                    </TableCell>
                    <TableCell isHeader className="text-left font-medium text-xs whitespace-nowrap">
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
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedLeadIdSingle === item.lead_id}
                          onChange={() => handleCheckboxChange(item.lead_id)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span title={item.customer_name || "N/A"}>
                          {item.customer_name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        {item.customer_phone_number || "N/A"}
                      </TableCell>
                      <TableCell className="text-left truncate max-w-[120px]">
                        <span title={item.interested_project_name || "N/A"}>
                          {item.interested_project_name || "N/A"}
                        </span>
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
                        {userTypeMap[item.assigned_user_type] || "N/A"}
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
              {Math.min(localPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} entries
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