import { IMenuType, IMobileMenu } from '../types/menu-d-t';

const menuData: IMenuType[] = [
  {
    link: '/buyer/products',
    title: 'Shop',
    hasDropdown: false,
  },
  {
    link: '/seller/product-list',
    title: 'Seller',
    seller: true,
    hasDropdown: true,
    megamenu: false,
    dropdownItems: [
      { link: '/seller/product-list', title: 'Product List' },
      { link: '/seller/order-list', title: 'Order List' },
      { link: '/seller/add-product', title: 'Add Product' },
    ],
  },
  {
    link: '/pages/contact',
    title: 'Contact',
  },
];

export default menuData;

// mobile menus
export const mobile_menus: IMobileMenu[] = [
  {
    title: 'Shop',
    link: '/buyer/products',
  },
  {
    title: 'Seller',
    seller: true,
    dropdownMenu: [
      { link: '/seller/product-list', title: 'Product List' },
      { link: '/seller/order-list', title: 'Order List' },
      { link: '/seller/add-product', title: 'Add Product' },
    ],
  },
  {
    title: 'Contact',
    link: '/pages/contact',
  },
];
