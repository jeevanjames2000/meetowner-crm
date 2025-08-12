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

export const filterNavItemsByUserType = (navItems: NavItem[]): NavItem[] => {
  return navItems
  
};