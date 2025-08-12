import React, { useState, useRef, useEffect } from "react";
import { Filter as FilterIcon, Clock } from "lucide-react";
import DatePicker from "../../form/date-picker"; 

interface FilterProps {
  onFilterChange?: (datetime: string) => void;
}

const Filter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const getCombinedDateTime = () => {
    return selectedDate && selectedTime
      ? new Date(`${selectedDate}T${selectedTime}`).toISOString()
      : "";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowFilter(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleApply = () => {
    const datetime = getCombinedDateTime();
    if (datetime && onFilterChange) {
      onFilterChange(datetime);
    }
    setShowFilter(false);
  };

  const handleClear = () => {
    setSelectedDate("");
    setSelectedTime("");
    if (onFilterChange) onFilterChange("");
    setShowFilter(false);
  };

  return (
    <div ref={filterRef} className="relative inline-block text-left">
      <button
        onClick={() => setShowFilter(!showFilter)}
        className={`p-2 rounded-full transition ${
          showFilter ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50 text-blue-500"
        }`}
        title="Toggle Filter"
        aria-label="Toggle date and time filter"
        aria-expanded={showFilter}
      >
        <FilterIcon className="w-5 h-5" />
      </button>

      {showFilter && (
        <div className="absolute z-50 mt-2 right-0 w-72 bg-white border border-gray-200 shadow-lg rounded-xl p-4 space-y-4">
          {/* DatePicker with outer size styling only */}
          {/* <div className="text-xs">
            <DatePicker
              id="filter-datepicker"
              label="Select Date"
              placeholder="Pick a date"
              defaultDate={selectedDate || undefined}
              onChange={([date]) => {
                if (date instanceof Date) {
                  const iso = date.toISOString().split("T")[0];
                  setSelectedDate(iso);
                }
              }}
            />
          </div> */}
          <div className="text-xs flatpickr-sm">
  <DatePicker
    id="filter-datepicker"
    label="Select Date"
    placeholder="Pick a date"
    defaultDate={selectedDate || undefined}
    onChange={([date]) => {
      if (date instanceof Date) {
        const iso = date.toISOString().split("T")[0];
        setSelectedDate(iso);
      }
    }}
  />
</div>


          {/* Time Picker */}
          <div className="relative text-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full h-9 border border-gray-300 rounded-md px-2 pr-9 text-xs"
            />
            <Clock className="absolute right-3 top-9 text-gray-500 w-4 h-4 pointer-events-none" />
          </div>

          {(selectedDate || selectedTime) && (
            <p className="text-xs text-gray-600">
              Selected: <span className="font-medium">{selectedDate} {selectedTime}</span>
            </p>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={handleClear}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 text-xs bg-blue-900 text-white rounded hover:bg-blue-800"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
