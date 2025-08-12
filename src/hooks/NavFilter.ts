export type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path?: string;
    pro?: boolean;
    new?: boolean; 
    count?: number;
    data?: { lead_in: string; status: number };
    nestedItems?: {
      name: string;
      path?: string;
      nestedItems?: {
        name: string;
        path: string;
        data?: { property_in: string; property_for: string; status: number };
      }[];
    }[];
  }[];
};

export const filterNavItemsByUserType = (navItems: NavItem[], userType: number | undefined): NavItem[] => {
  const filterAccountsSubItems = (subItems: NavItem["subItems"]) => {
    if (!subItems) return subItems;
    return subItems.filter(subItem => {
      if (subItem.name === "Add New Lead") {
        return userType === 2 || userType === 3; 
      }
      if (subItem.name === "Add Projects") {
        return userType === 2; 
      }
      return true;
    });
  };

  return navItems
    .filter((item) => {
      if (userType == 1) return !["Employee Management", "Bookings", "Partners","Lead Management","Project Management","Dashboard"].includes(item.name); // admin
      if(userType == 2) return !["Builders","Queries"].includes(item.name); // builders
      if (userType === 3) return !["Employee Management", "Partners","Builders","Queries"].includes(item.name); // channel partner
      if (userType === 4) return !["Employee Management", "Bookings", "Partners","Builders","Queries"].includes(item.name); // sales Manager
      if (userType === 5) return !["Employee Management", "Bookings", "Partners","Builders","Queries"].includes(item.name); // Telecallers 
      if (userType === 6) return !["Employee Management", "Bookings", "Partners","Builders","Queries"].includes(item.name); // Marketing agent
      if (userType === 7) return !["Employee Management", "Bookings", "Partners","Builders","Queries"].includes(item.name); // Receptionists
      return true; 
    })
    .map((item) => {
     
      if (item.name === "Lead Management") {
        return {
          ...item,
          subItems: filterAccountsSubItems(item.subItems),
        };
      }
      if (item.name === "Project Management"){
        return {
            ...item,
            subItems: filterAccountsSubItems(item.subItems)
        }
      }
      return item;
    });
};