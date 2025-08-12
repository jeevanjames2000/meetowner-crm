import React, { useEffect } from "react";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Button from "../ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { usePropertyQueries } from "../../hooks/PropertyQueries";
import { setCityDetails } from "../../store/slices/propertyDetails";
import { RootState, AppDispatch } from "../../store/store";
import Dropdown from "../form/Dropdown";
interface SelectOption {
  value: string;
  label: string;
}
interface FilterBarProps {
  showUserTypeFilter?: boolean;
  showCreatedDateFilter?: boolean;
  showCreatedEndDateFilter?: boolean;
  showUpdatedDateFilter?: boolean;
  showStatusFilter?: boolean;
  showStateFilter?: boolean;
  showCityFilter?: boolean;
  userFilterOptions?: SelectOption[];
  statusFilterOptions?: SelectOption[];
  onUserTypeChange?: (value: string | null) => void;
  onCreatedDateChange?: (date: string | null) => void;
  onCreatedEndDateChange?: (date: string | null) => void;
  onUpdatedDateChange?: (date: string | null) => void;
  onStatusChange?: (value: string | null) => void;
  onStateChange?: (value: string | null) => void;
  onCityChange?: (value: string | null) => void;
  onClearFilters?: () => void;
  selectedUserType?: string | null;
  createdDate?: string | null;
  createdEndDate?: string | null;
  updatedDate?: string | null;
  selectedStatus?: string | null;
  selectedState?: string | null;
  selectedCity?: string | null;
  className?: string;
  showDateFilters?: boolean;
}
const FilterBar: React.FC<FilterBarProps> = ({
  showUserTypeFilter = false,
  showCreatedDateFilter = false,
  showCreatedEndDateFilter = false,
  showUpdatedDateFilter = false,
  showStatusFilter = false,
  showStateFilter = false,
  showCityFilter = false,
  userFilterOptions = [],
  statusFilterOptions = [],
  onUserTypeChange,
  onCreatedDateChange,
  onCreatedEndDateChange,
  onUpdatedDateChange,
  onStatusChange,
  onStateChange,
  onCityChange,
  onClearFilters,
  selectedUserType,
  createdDate,
  createdEndDate,
  updatedDate,
  selectedStatus,
  selectedState,
  selectedCity,
  className = "",
  showDateFilters = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { states } = useSelector((state: RootState) => state.property);
  const { citiesQuery } = usePropertyQueries();

  const citiesResult = citiesQuery(
    selectedState ? parseInt(selectedState) : undefined
  );
  const stateOptions =
    states?.map((state: any) => ({
      value: state.value.toString(),
      text: state.label,
    })) || [];


  const cityOptions =
    citiesResult?.data?.map((city: any) => ({
      value: city.label,
      text: city.label,
    })) || [];

  useEffect(() => {
    if (citiesResult.data) {
      dispatch(setCityDetails(citiesResult.data));
    }
  },
    [citiesResult.data, dispatch]);
  

  const handleCreatedDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
      if (createdEndDate && date > createdEndDate) {
        alert("Created start date cannot be after created end date");
        return;
      }
    }
    onCreatedDateChange?.(date || null);
  };
  const handleCreatedEndDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
      if (createdDate && date < createdDate) {
        alert("Created end date cannot be before created start date");
        return;
      }
    }
    onCreatedEndDateChange?.(date || null);
  };
  const handleUpdatedDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
      if (createdDate && date < createdDate) {
        alert("Updated date cannot be before created date");
        return;
      }
    }
    onUpdatedDateChange?.(date || null);
  };
  const handleClearFilters = () => {
    onClearFilters?.();
  };
  const displayCreatedDateFilter = showCreatedDateFilter || showDateFilters;
  const displayCreatedEndDateFilter =
    showCreatedEndDateFilter || showDateFilters;
  const displayUpdatedDateFilter = showUpdatedDateFilter || showDateFilters;
  return (
    <div className={`flex items-center gap-1 py-2 w-full ${className}`}>
      <div className="flex items-center gap-1 w-full flex-wrap">
        {showUserTypeFilter && userFilterOptions.length > 0 && (
          <div className="w-[1/4] flex-shrink-0">
            <Select
              options={userFilterOptions}
              placeholder="User Type"
              onChange={(value: string) => onUserTypeChange?.(value || null)}
              value={selectedUserType || ""}
              className="dark:bg-dark-900 text-sm"
            />
          </div>
        )}
        {showStateFilter && stateOptions.length > 0 && (
          <div className="w-[1/4] flex-shrink-0">
            <Dropdown
              id="state"
              options={stateOptions}
              value={selectedState || ""}
              onChange={(value: string, text: string) => {
                onStateChange?.(value || null);
                if (value !== selectedState) {
                  onCityChange?.(null);
                }
              }}
              placeholder="state..."
            />
          </div>
        )}
        {showCityFilter && (
          <div className="w-[1/4] flex-shrink-0">
            <Dropdown
              id="city"
              options={cityOptions}
              value={selectedCity || ""}
              onChange={(value: string, text: string) => {
                onCityChange?.(value || null); // 'value' will be the city name (label)
              }}
              placeholder="city..."
              disabled={!selectedState}
            />

          </div>
        )}
        <div className="flex items-center gap-2">
          {displayCreatedDateFilter && (
            <div className="w-[100px] flex-shrink-0">
              <DatePicker
                id="createdDate"
                placeholder="start"
                onChange={handleCreatedDateChange}
                defaultDate={createdDate ? new Date(createdDate) : undefined}
                className="w-full text-sm"
              />
            </div>
          )}
          {displayCreatedEndDateFilter && (
            <div className="w-[100px] flex-shrink-0">
              <DatePicker
                id="createdEndDate"
                placeholder="end"
                onChange={handleCreatedEndDateChange}
                defaultDate={
                  createdEndDate ? new Date(createdEndDate) : undefined
                }
                className="w-full text-sm"
              />
            </div>
          )}
        </div>
        {displayUpdatedDateFilter && (
          <div className="w-[100px] flex-shrink-0">
            <DatePicker
              id="updatedDate"
              placeholder="updated"
              onChange={handleUpdatedDateChange}
              defaultDate={updatedDate ? new Date(updatedDate) : undefined}
              className="w-full text-sm"
            />
          </div>
        )}
        {showStatusFilter && statusFilterOptions.length > 0 && (
          <div className="w-[140px] flex-shrink-0">
            <Select
              options={statusFilterOptions}
              placeholder="Select Status"
              onChange={(value: string) => onStatusChange?.(value || null)}
              value={selectedStatus || ""}
              className="dark:bg-dark-900 text-sm"
            />
          </div>
        )}
        {(showUserTypeFilter ||
          showStateFilter ||
          showCityFilter ||
          displayCreatedDateFilter ||
          displayCreatedEndDateFilter ||
          displayUpdatedDateFilter ||
          showStatusFilter) && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="px-3 py-2 ml-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
            >
              Clear
            </Button>
          )}
      </div>
    </div>
  );
};
export default FilterBar;
