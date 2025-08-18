// components/UserDropdown.tsx
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Button from "../ui/button/Button";
import { AppDispatch, RootState } from "../../store/store";
import { isTokenExpired, logout } from "../../store/slices/authSlice";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = () => {
    dispatch(logout());
    closeDropdown();
    navigate("/signin");
  };
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      dispatch(logout());
      navigate("/signin");
    }
  }, [token, dispatch, navigate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center px-3 py-2 text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="flex items-center justify-center w-10 h-10 mr-3 text-lg font-semibold text-white bg-blue-900 rounded-full shadow-md">
          {getInitials(user!.name)}
        </div>
        <span className="mr-2 font-medium text-gray-900">
          {user?.name || "Person"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 p-2 text-lg font-semibold text-white bg-blue-900 rounded-full shadow-md">
                {getInitials(user!.name)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.name || "John Doe"}
                </p>
                <p className="text-sm text-gray-600">
                  {user?.email || "john.doe@gmail.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <ul className="space-y-1">
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  to="/profile"
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-3 text-gray-500 bg-gray-100 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                      />
                    </svg>
                  </div>
                  profile
                </DropdownItem>
              </li>
            </ul>
          </div>

          <div className="px-2 pb-2 border-t border-gray-100 bg-gray-50">
            <Button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-900 transition-all duration-200"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
