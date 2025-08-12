import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router";
import { Building2, ChevronDown, ChevronRight, GridIcon } from "lucide-react";
import { FaUserTie } from "react-icons/fa";
import { CalenderIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { filterNavItemsByUserType, NavItem } from "../hooks/NavFilter";

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CalenderIcon />,
    name: "Lead Management",
    subItems: [
      {
        name: "Today Leads",
        path: "/leads/new/0",
        data: { lead_in: "Today", status: 0 },
      },
      {
        name: "Open Leads",
        path: "/leads/open/1",
        data: { lead_in: "Open", status: 1 },
      },
      {
        name: "Today Folow Ups",
        path: "/leads/today/2",
        data: { lead_in: "Today", status: 2 },
      },
      {
        name: "In Progress",
        path: "/leads/InProgress/3",
        data: { lead_in: "In Progress", status: 3 },
      },
      {
        name: "Site Visit Scheduled",
        path: "/leads/SiteVisitScheduled/4",
        data: { lead_in: "Site Visit Scheduled", status: 4 },
      },
      {
        name: "Site Visit Done",
        path: "/leads/SiteVisitDone/5",
        data: { lead_in: "Site Visit done", status: 5 },
      },
      {
        name: "Won Leads",
        path: "/leads/WonLeads/6",
        data: { lead_in: "Won Leads", status: 6 },
      },
      {
        name: "Lost Leads",
        path: "/leads/LostLeads/7",
        data: { lead_in: "Lost Leads", status: 7 },
      },
      { name: "Add New Lead", path: "/leads/addlead" },
    ],
  },

  {
    name: "Employee Management",
    icon: <FaUserTie />,
    subItems: [
      { name: "Sales Manager", path: "/employee/4", pro: false },
      { name: "Telecallers", path: "/employee/5", pro: false },
      { name: "Marketing Executors", path: "/employee/6", pro: false },
      { name: "Receptionists", path: "/employee/7", pro: false },
      { name: "Add Employee", path: "/create-employee" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const userType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [openNestedSubmenu, setOpenNestedSubmenu] = useState<{
    type: "main";
    index: number;
    subIndex: number;
  } | null>(null);
  const [openDeepNestedSubmenu, setOpenDeepNestedSubmenu] = useState<{
    type: "main";
    index: number;
    subIndex: number;
    nestedIndex: number;
  } | null>(null);

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nestedSubMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const deepNestedSubMenuRefs = useRef<Record<string, HTMLDivElement | null>>(
    {}
  );
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const [deepNestedSubMenuHeight, setDeepNestedSubMenuHeight] = useState<
    Record<string, number>
  >({});

  const filteredNavItems = filterNavItemsByUserType(navItems, userType);

  const isActive = useCallback(
    (path?: string) => !!path && location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem, subIndex) => {
          if (subItem.path && isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
          if (subItem.nestedItems) {
            subItem.nestedItems.forEach((nestedItem, nestedIndex) => {
              if (nestedItem.path && isActive(nestedItem.path)) {
                setOpenSubmenu({ type: "main", index });
                setOpenNestedSubmenu({ type: "main", index, subIndex });
                submenuMatched = true;
              }
              if (nestedItem.nestedItems) {
                nestedItem.nestedItems.forEach((deepNestedItem) => {
                  if (isActive(deepNestedItem.path)) {
                    setOpenSubmenu({ type: "main", index });
                    setOpenNestedSubmenu({ type: "main", index, subIndex });
                    setOpenDeepNestedSubmenu({
                      type: "main",
                      index,
                      subIndex,
                      nestedIndex,
                    });
                    submenuMatched = true;
                  }
                });
              }
            });
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
      setOpenNestedSubmenu(null);
      setOpenDeepNestedSubmenu(null);
    }
  }, [location.pathname, isActive]);

  useLayoutEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
    if (openNestedSubmenu) {
      const key = `${openNestedSubmenu.type}-${openNestedSubmenu.index}-${openNestedSubmenu.subIndex}`;
      if (nestedSubMenuRefs.current[key]) {
        setDeepNestedSubMenuHeight((prev) => ({
          ...prev,
          [key]: nestedSubMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
    if (openDeepNestedSubmenu) {
      const key = `${openDeepNestedSubmenu.type}-${openDeepNestedSubmenu.index}-${openDeepNestedSubmenu.subIndex}-${openDeepNestedSubmenu.nestedIndex}`;
      if (deepNestedSubMenuRefs.current[key]) {
        setDeepNestedSubMenuHeight((prev) => ({
          ...prev,
          [key]: deepNestedSubMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu, openNestedSubmenu, openDeepNestedSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) =>
      prev?.type === "main" && prev.index === index
        ? null
        : { type: "main", index }
    );
  };

  const handleNestedSubmenuToggle = (index: number, subIndex: number) => {
    setOpenNestedSubmenu((prev) =>
      prev?.type === "main" &&
      prev.index === index &&
      prev.subIndex === subIndex
        ? null
        : { type: "main", index, subIndex }
    );
  };

  const handleDeepNestedSubmenuToggle = (
    index: number,
    subIndex: number,
    nestedIndex: number
  ) => {
    setOpenDeepNestedSubmenu((prev) =>
      prev?.type === "main" &&
      prev.index === index &&
      prev.subIndex === subIndex &&
      prev.nestedIndex === nestedIndex
        ? null
        : { type: "main", index, subIndex, nestedIndex }
    );
  };

  const shouldShowText = isExpanded || isHovered || isMobileOpen;

  const renderMenuItems = (items: NavItem[]) => (
    <div className="space-y-1">
      {items.map((nav, index) => {
        const isItemActive = nav.path && isActive(nav.path);
        const isSubmenuOpen =
          openSubmenu?.type === "main" && openSubmenu?.index === index;
        const hasActiveChild = nav.subItems?.some(
          (subItem) => subItem.path && isActive(subItem.path)
        );

        return (
          <div key={nav.name} className="group">
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`flex items-center w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isSubmenuOpen || hasActiveChild
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                } ${!shouldShowText ? "lg:justify-center lg:px-2" : ""}`}
              >
                <div
                  className={`flex items-center justify-center ${
                    shouldShowText ? "mr-3" : ""
                  }`}
                >
                  {nav.icon}
                </div>
                {shouldShowText && (
                  <>
                    <span className="flex-1 text-left font-medium">
                      {nav.name}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                        isSubmenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`flex items-center w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isItemActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  } ${!shouldShowText ? "lg:justify-center lg:px-2" : ""}`}
                >
                  <div
                    className={`flex items-center justify-center ${
                      shouldShowText ? "mr-3" : ""
                    }`}
                  >
                    {nav.icon}
                  </div>
                  {shouldShowText && (
                    <span className="flex-1 text-left font-medium">
                      {nav.name}
                    </span>
                  )}
                </Link>
              )
            )}

            {nav.subItems && shouldShowText && (
              <div
                ref={(el: HTMLDivElement | null) => {
                  subMenuRefs.current[`main-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  height: isSubmenuOpen
                    ? `${subMenuHeight[`main-${index}`] || 0}px`
                    : "0px",
                }}
              >
                <div className="mt-1 ml-6 space-y-1 border-l border-gray-100 pl-4">
                  {nav.subItems.map((subItem, subIndex) => {
                    const isSubItemActive =
                      subItem.path && isActive(subItem.path);
                    return (
                      <div key={subItem.name}>
                        {subItem.nestedItems ? (
                          <div>
                            <button
                              onClick={() =>
                                handleNestedSubmenuToggle(index, subIndex)
                              }
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                openNestedSubmenu?.type === "main" &&
                                openNestedSubmenu?.index === index &&
                                openNestedSubmenu?.subIndex === subIndex
                                  ? "bg-gray-50 text-blue-600"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <span className="font-medium">
                                {subItem.name}
                              </span>
                              <ChevronRight
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  openNestedSubmenu?.type === "main" &&
                                  openNestedSubmenu?.index === index &&
                                  openNestedSubmenu?.subIndex === subIndex
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>
                        ) : (
                          subItem.path && (
                            <Link
                              to={subItem.path}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                                isSubItemActive
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <span className="font-medium">
                                {subItem.name}
                              </span>
                              <div className="flex items-center gap-2">
                                {subItem.count && (
                                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                    {subItem.count}
                                  </span>
                                )}
                                {subItem.new && (
                                  <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                    New
                                  </span>
                                )}
                                {subItem.pro && (
                                  <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                                    Pro
                                  </span>
                                )}
                              </div>
                            </Link>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-lg ${
        isExpanded || isMobileOpen ? "w-72" : isHovered ? "w-72" : "w-16"
      } ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`px-6 py-6 border-b border-gray-100 ${
          !shouldShowText ? "lg:px-4" : ""
        }`}
      >
        <Link to="/" className="flex items-center">
          {shouldShowText ? (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                {user?.company_logo ? (
                  <img
                    src={user.company_logo}
                    alt={`${user.company_name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/32";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.company_name?.charAt(0) || "C"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">
                  {user?.company_name}{" "}
                </span>
                <span className="text-xs text-gray-500">Real Estate CRM</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav>
          {shouldShowText && (
            <h2 className="mb-4 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              MENU
            </h2>
          )}
          {renderMenuItems(filteredNavItems)}
        </nav>
      </div>

      {/* Footer */}
      {shouldShowText && (
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            System Online
          </div>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
