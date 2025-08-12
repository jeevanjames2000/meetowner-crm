import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// Assuming you have a MoreVerticalIcon (you can replace this with your own icon)
import { MoreVerticalIcon } from "lucide-react"; // Example using lucide-react for the icon

// Define the type for a member with additional fields and status
interface Member {
  slNo: number;
  name: string;
  mobileNumber: string;
  email: string;
  since: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string; // Optional for Users
  reraNumber?: string; // Optional for Users and Owners
  status: "Active" | "Suspended"; // Added status field
}

// Define the type for the state passed via navigation
interface LocationState {
  categoryLabel: string;
  members: Member[];
}

const BasicTables: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // State to manage the members list (since we need to modify it for edit/delete/suspend)
  const [membersList, setMembersList] = useState<Member[]>([]);
  // State to manage dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  // State to manage edit modal visibility and the member being edited
  const [editMember, setEditMember] = useState<Member | null>(null);
  // Ref to handle clicking outside the dropdown to close it
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize members list with status field
  useEffect(() => {
    if (state && state.members && state.members.length > 0) {
      const updatedMembers = state.members.map((member) => ({
        ...member,
        status: member.status || "Active", // Default to Active if status is not provided
      }));
      setMembersList(updatedMembers);
    }
  }, [state]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close modal on "Esc" key press for better accessibility
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditMember(null);
      }
    };
    if (editMember) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [editMember]);

  if (!state || !membersList || membersList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          No Data Available
        </h2>
      </div>
    );
  }

  const { categoryLabel } = state;

  // Determine which columns to show based on the category
  const showGstNumber = categoryLabel !== "Users";
  const showReraNumber = categoryLabel !== "Users" && categoryLabel !== "Owners";

  // Toggle dropdown visibility
  const toggleDropdown = (slNo: number) => {
    setDropdownOpen(dropdownOpen === slNo ? null : slNo);
  };

  // Handle Edit action
  const handleEdit = (member: Member) => {
    setEditMember(member);
    setDropdownOpen(null);
  };

  // Handle Delete action
  const handleDelete = (slNo: number) => {
    setMembersList(membersList.filter((member) => member.slNo !== slNo));
    setDropdownOpen(null);
  };

  // Handle Suspend/Activate action
  const handleSuspend = (slNo: number) => {
    setMembersList(
      membersList.map((member) =>
        member.slNo === slNo
          ? { ...member, status: member.status === "Active" ? "Suspended" : "Active" }
          : member
      )
    );
    setDropdownOpen(null);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editMember) {
      setMembersList(
        membersList.map((member) =>
          member.slNo === editMember.slNo ? editMember : member
        )
      );
      setEditMember(null);
    }
  };

  // Handle Edit form input changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editMember) {
      setEditMember({ ...editMember, [name]: value });
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      <div className={editMember ? "blur-sm pointer-events-none" : ""}>
        <PageMeta
          title={`Meet Owner ${categoryLabel} Table`}
         
        />
        <PageBreadcrumb pageTitle={`${categoryLabel} Table`} pagePlacHolder = "Filter projects, Sellers "/>
        <div className="space-y-6">
          <ComponentCard title={`${categoryLabel} Table`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Sl. No
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Mobile Number
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Email
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Address
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        City
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        State
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Pincode
                      </TableCell>
                      {showGstNumber && (
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          GST Number
                        </TableCell>
                      )}
                      {showReraNumber && (
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          RERA Number
                        </TableCell>
                      )}
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Since
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {membersList.map((member) => (
                      <TableRow key={member.slNo}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.slNo}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.mobileNumber}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.email}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.address}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.city}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.state}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.pincode}
                        </TableCell>
                        {showGstNumber && (
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {member.gstNumber || "N/A"}
                          </TableCell>
                        )}
                        {showReraNumber && (
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {member.reraNumber || "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {member.since}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {member.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <button onClick={() => toggleDropdown(member.slNo)}>
                            <MoreVerticalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </button>
                          {dropdownOpen === member.slNo && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                            >
                              <button
                                onClick={() => handleEdit(member)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(member.slNo)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleSuspend(member.slNo)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {member.status === "Active" ? "Suspend" : "Activate"}
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>

      {/* Edit Modal */}
      {editMember && (
        <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white  rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Edit Member
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editMember.name}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={editMember.mobileNumber}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editMember.email}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={editMember.address}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={editMember.city}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={editMember.state}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={editMember.pincode}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              {showGstNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={editMember.gstNumber || ""}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              )}
              {showReraNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    RERA Number
                  </label>
                  <input
                    type="text"
                    name="reraNumber"
                    value={editMember.reraNumber || ""}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D3A76] text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicTables;