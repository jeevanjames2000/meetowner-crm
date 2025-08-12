import React, { useState, useEffect, useRef } from "react";
import Label from "./Label";
interface Option {
  value: string;
  text: string;
}
interface DropdownProps {
  id: string;
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string, text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}
export default function Dropdown({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  error,
}: DropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption?.text || placeholder;
  useEffect(() => {
    setSearchTerm("");
  }, [value]);
  const filteredOptions = options.filter((option) =>
    option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };
  const handleClearSearch = () => {
    setSearchTerm("");
  };
  const toggleDropdown = () => {
    if (!disabled) {
      setIsDropdownOpen((prev) => !prev);
    }
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const handleSelect = (option: Option) => {
    onChange(option.value, option.text);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };
  return (
    <div className="w-full max-w-2xl" id={`${id}-dropdown`} ref={dropdownRef}>
      {label && <Label htmlFor={`${id}-select`}>{label}</Label>}
      <div className="relative">
        <div
          onClick={toggleDropdown}
          className={`flex items-center w-full p-2 pr-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76] ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${
            !selectedOption && !disabled
              ? "text-gray-500"
              : "text-gray-900 dark:text-white"
          }`}
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-controls={`${id}-dropdown-menu`}
        >
          <span className="truncate flex-1">{displayText}</span>
          <button
            type="button"
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          >
            <svg
              className={`w-4 h-4 transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        {isDropdownOpen && (
          <div
            id={`${id}-dropdown-menu`}
            className="absolute z-10 w-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
          >
            <div className="relative p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Filter options..."
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <ul>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer truncate"
                  >
                    {option.text}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No {label?.toLowerCase() || "options"} found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
