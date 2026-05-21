export interface IMenuType {
  link: string;
  title: string;
  seller?: boolean;
  hasDropdown?: boolean;
  megamenu?: boolean;
  dropdownItems?: {
    link: string;
    title: string;
    dropdownMenu?: {
      link: string;
      title: string;
    }[];
  }[];
}

// Define the menu data type
export interface IMobileMenu {
  title: string;
  link?: string;
  seller?: boolean;
  dropdownMenu?: {
    link: string;
    title: string;
  }[];
}
