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
      // { link: '/seller/chat', title: 'Chat Inbox' },
    ],
  },
  {
    link: '/admin/manage-users',
    title: 'Admin',
    admin: true,
    hasDropdown: true,
    megamenu: false,
    dropdownItems: [
      { link: '/admin/approve-payments', title: 'Approve Payments' },
      { link: '/admin/manage-users', title: 'Manage Users' },
      { link: '/admin/products', title: 'Products' },
      { link: '/admin/offers', title: 'Offers' },
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
      // { link: '/seller/chat', title: 'Chat Inbox' },
    ],
  },
  {
    title: 'Admin',
    admin: true,
    dropdownMenu: [
      { link: '/admin/approve-payments', title: 'Approve Payments' },
      { link: '/admin/manage-users', title: 'Manage Users' },
      { link: '/admin/products', title: 'Products' },
      { link: '/admin/offers', title: 'Offers' },
    ],
  },
  {
    title: 'Contact',
    link: '/pages/contact',
  },
];
