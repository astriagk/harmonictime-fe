import { environment } from '@env/environment';

const baseUrl = environment.apiBaseUrl;

// auth
export const REGISTER_USER = `${baseUrl}/auth/register`;
export const LOGIN_USER = `${baseUrl}/auth/login`;
export const VERIFY_TOKEN = `${baseUrl}/auth/verify-token`;
export const CONFIRM_EMAIL = `${baseUrl}/auth/confirm-email`;
export const RESEND_VERIFICATION = `${baseUrl}/auth/resend-verification`;
export const UPDATE_UNVERIFIED_EMAIL = `${baseUrl}/auth/update-unverified-email`;
export const USER = `${baseUrl}/users/profile`;
// password reset — request an OTP by email, then submit the OTP + new password
export const VERIFY_EMAIL = `${baseUrl}/auth/verify-email`;
export const RESET_PASSWORD = `${baseUrl}/auth/reset-password`;
export const SEND_MOBILE_OTP = `${baseUrl}/auth/send-mobile-otp`;
export const VERIFY_MOBILE_OTP = `${baseUrl}/auth/verify-mobile-otp`;

// catalog lookups
export const GET_BRANDS = `${baseUrl}/brands`;
export const GET_CATEGORIES = `${baseUrl}/categories`;
export const GET_COLLECTIONS = `${baseUrl}/collections`;
export const GET_DIAL_COLORS = `${baseUrl}/dial-colors`;
export const GET_MOVEMENTS = `${baseUrl}/movements`;
export const GET_STRAP_MATERIALS = `${baseUrl}/strap-materials`;
export const GET_CASE_MATERIALS = `${baseUrl}/case-materials`;
export const GET_WATCH_MARKERS = `${baseUrl}/watch-markers`;
export const GET_DELIVERY_OPTIONS = `${baseUrl}/delivery-options`;
export const GET_RECIPIENTS = `${baseUrl}/recipients`;

// catalog lookups - create (POST to the same collection URL)
export const CREATE_BRAND = GET_BRANDS;
export const CREATE_CATEGORY = GET_CATEGORIES;
export const CREATE_COLLECTION = GET_COLLECTIONS;
export const CREATE_DIAL_COLOR = GET_DIAL_COLORS;
export const CREATE_MOVEMENT = GET_MOVEMENTS;
export const CREATE_STRAP_MATERIAL = GET_STRAP_MATERIALS;
export const CREATE_CASE_MATERIAL = GET_CASE_MATERIALS;
export const CREATE_WATCH_MARKER = GET_WATCH_MARKERS;
export const CREATE_DELIVERY_OPTION = GET_DELIVERY_OPTIONS;
export const CREATE_RECIPIENT = GET_RECIPIENTS;

// products
export const POST_PRODUCT = `${baseUrl}/products`;
export const PRODUCT = `${baseUrl}/products`;
// append the product id: `${GET_PRODUCT_BY_ID}${id}`
export const GET_PRODUCT_BY_ID = `${baseUrl}/products/`;
// update editable fields of a single product (append the product id)
export const UPDATE_PRODUCT_BY_ID = `${baseUrl}/products/`;

// only availability update exists in backend
export const UPDATE_PRODUCT_AVAILABILITY = `${baseUrl}/products/availability`;
export const UPDATE_PRODUCT = UPDATE_PRODUCT_AVAILABILITY;

// product details (append the product id)
export const POST_PRODUCT_DETAILS = `${baseUrl}/product-details`;
export const GET_PRODUCT_DETAILS = `${baseUrl}/product-details/`;
export const UPDATE_PRODUCT_DETAILS = `${baseUrl}/product-details/`;

// product descriptions (append the product id)
export const POST_PRODUCT_DESCRIPTION = `${baseUrl}/product-descriptions`;
export const GET_ALL_PRODUCT_DESCRIPTIONS = `${baseUrl}/product-descriptions`;
export const GET_PRODUCT_DESCRIPTION = `${baseUrl}/product-descriptions/`;
export const UPDATE_PRODUCT_DESCRIPTION = `${baseUrl}/product-descriptions/`;

// delivery returns (append the product id)
export const POST_PRODUCT_RETURN_POLICY = `${baseUrl}/delivery-returns`;
export const GET_PRODUCT_RETURN_POLICY = `${baseUrl}/delivery-returns/product/`;
export const UPDATE_PRODUCT_RETURN_POLICY = `${baseUrl}/delivery-returns/product/`;

// uploads
export const POST_UPLOAD_IMAGES = `${baseUrl}/upload/images`;
export const UPLOAD_SINGLE = `${baseUrl}/uploads/image`;

// user update
export const UPDATE_USER = (id: string) => `${baseUrl}/users/${id}`;
// S3 deletion is keyed by image URL sent in the request body
export const DELETE_IMAGE_S3 = `${baseUrl}/upload/images`;

// product images
export const POST_PRODUCT_IMAGES = `${baseUrl}/product-images`;
// append the product id
export const GET_PRODUCT_IMAGES = `${baseUrl}/product-images/product/`;
// append the image id
export const GET_PRODUCT_IMAGE_BY_ID = `${baseUrl}/product-images/`;
// update a single image (e.g. its IsPrimary flag); append the image id
export const UPDATE_PRODUCT_IMAGE = `${baseUrl}/product-images/`;
export const DELETE_IMAGE_DB = `${baseUrl}/product-images/`;

// reviews (append the product id to GET)
export const POST_REVIEW = `${baseUrl}/reviews`;
export const GET_PRODUCT_REVIEWS = `${baseUrl}/reviews/product/`;

// user (seller) reviews
export const POST_USER_REVIEW = `${baseUrl}/user-reviews`;
export const GET_USER_REVIEWS = `${baseUrl}/user-reviews/user/`; // append the seller userID

// cart
export const USER_CART = `${baseUrl}/cart/user/`; // append the user id
export const USER_CART_ITEM = (userId: string, productId: string) => `${baseUrl}/cart/user/${userId}/${productId}`;
export const ADD_TO_CART = `${baseUrl}/cart`;
export const DELETE_CART_ITEM = `${baseUrl}/cart/`; // append the cart id
export const UPDATE_CART = `${baseUrl}/cart/`; // append the cart item id (PUT)

// wishlist
export const USER_WISHLIST = `${baseUrl}/wishlist/user/`; // append the user id
export const ADD_TO_WISHLIST = `${baseUrl}/wishlist`;
export const DELETE_WISHLIST_ITEM = `${baseUrl}/wishlist/`; // append the wishlist id
export const WISHLIST_MOVE_TO_CART = (wishlistId: string) => `${baseUrl}/wishlist/${wishlistId}/move-to-cart`;

// payments
export const CREATE_PAYMENT_ORDER = `${baseUrl}/payments/create-order`;
export const VERIFY_PAYMENT_ORDER = `${baseUrl}/payments/verify`;

// contact / help — stores the message and emails the team
export const POST_CONTACT = `${baseUrl}/contact`;
import { companyDetails } from 'src/app/shared/constants/companyDetails';
export const SUPPORT_EMAIL = companyDetails.email;

// site content — CMS-managed blocks (hero slider, etc.) keyed by `type`
export const GET_SITE_CONTENT = `${baseUrl}/site-content`;

// address
export const CREATE_ADDRESS = `${baseUrl}/address`;
export const GET_ADDRESSES_BY_USER = `${baseUrl}/address/user/`; // append the user id
export const UPDATE_ADDRESS = `${baseUrl}/address/`; // append the address id
export const DELETE_ADDRESS = `${baseUrl}/address/`; // append the address id

// checkout
export const CHECKOUT_ITEM = `${baseUrl}/checkout`;
export const GET_ORDERS = `${baseUrl}/checkout/user/`; // append the user id
export const GET_SELLER_ORDERS = `${baseUrl}/checkout/seller/`; // append the seller id

// checkout items
export const CHECKOUT_ITEM_ORDER = `${baseUrl}/checkout-items`;
export const CHECKOUT_ITEMS = `${baseUrl}/checkout-items/checkout/`; // append the checkout id

// stock availability check (pre-checkout)
export const CHECK_AVAILABILITY = `${baseUrl}/products/check-availability`;

// shipments
export const CREATE_SHIPMENT = `${baseUrl}/shipments`;
export const UPDATE_SHIPMENT = `${baseUrl}/shipments/`; // append the shipment id

// seller order approval
export const SELLER_ORDER_APPROVAL = (sellerID: string, checkoutID: string) =>
  `${baseUrl}/checkout/seller/${sellerID}/order/${checkoutID}/approval`;

// seller wallet / settlement — seller identity comes from the JWT (no id in url).
// All of these REQUIRE a Bearer token (use the *Token GenericService methods).
export const GET_WALLET = `${baseUrl}/wallet`;
// itemized sold products; optional ?status=available|pending|requested|settled
export const GET_WALLET_ITEMS = `${baseUrl}/wallet/items`;

// bank accounts (payout destinations)
export const BANK_ACCOUNTS = `${baseUrl}/bank-accounts`; // GET list, POST add
export const BANK_ACCOUNT_BY_ID = `${baseUrl}/bank-accounts/`; // append id (PUT/DELETE)
// verify a bank account via Razorpay penny-drop: POST /bank-accounts/:id/verify
export const bankAccountVerify = (id: string) => `${baseUrl}/bank-accounts/${id}/verify`;

// withdrawals (seller side)
export const WITHDRAWALS = `${baseUrl}/withdrawals`; // GET history, POST request
// cancel a pending withdrawal: `${WITHDRAWAL_BY_ID}${id}/cancel`
export const WITHDRAWAL_BY_ID = `${baseUrl}/withdrawals/`;

// seller — bulk offer assignment / removal
export const BULK_OFFER = `${baseUrl}/products/bulk-offer`;

// admin — user management
export const ADMIN_USERS = `${baseUrl}/admin/users`;
export const ADMIN_USER_BY_ID = `${baseUrl}/admin/users/`; // append /:id
export const adminUserAction = (id: string, action: 'block' | 'unblock' | 'suspend') =>
  `${baseUrl}/admin/users/${id}/${action}`;

// admin — withdrawal management
export const ADMIN_WITHDRAWALS = `${baseUrl}/admin/withdrawals`;
export const adminWithdrawalAction = (id: string, action: 'pay' | 'reject') =>
  `${baseUrl}/admin/withdrawals/${id}/${action}`;

// admin — seller verification
export const ADMIN_SELLERS = `${baseUrl}/admin/sellers`;
export const ADMIN_SELLER_BY_ID = (id: string) => `${baseUrl}/admin/sellers/${id}`;
export const adminSellerAction = (id: string, action: 'approve' | 'reject' | 'request-info') =>
  `${baseUrl}/admin/sellers/${id}/${action}`;

// admin — product moderation
export const ADMIN_PRODUCTS = `${baseUrl}/admin/products`;
export const adminProductAction = (id: string, action: 'approve' | 'reject') =>
  `${baseUrl}/admin/products/${id}/${action}`;

// GST onboarding
export const GST_ONBOARDING = `${baseUrl}/gst`;
export const GST_CREATE_WITH_DOCS = `${baseUrl}/gst/with-documents`;
export const GST_UPDATE_WITH_DOCS = (id: string) => `${baseUrl}/gst/${id}/with-documents`;

// chat
export const CHAT_THREADS = `${baseUrl}/chat/threads`;
export const CHAT_THREAD_MSG = (id: string) => `${baseUrl}/chat/threads/${id}/messages`;
export const CHAT_CLOSE_THREAD = (id: string) => `${baseUrl}/chat/threads/${id}/close`;

// offers (admin)
export const OFFERS = `${baseUrl}/offers`; // GET active, POST create
export const OFFERS_ALL = `${baseUrl}/offers/all`; // GET all incl. disabled
export const OFFER_BY_ID = `${baseUrl}/offers/`; // append offerId (GET/PUT/DELETE)
export const OFFER_STATUS = (id: string) => `${baseUrl}/offers/${id}/status`; // PATCH

// order charges applied on top of the cart subtotal at checkout
export const ORDER_CHARGES = {
  gstPercent: environment.gstPercent, // % — configured per environment
  platformPercent: 2, // % baked into every displayed price (see withPlatformMarkup)
};

// The platform fee is baked directly into the price shown to buyers (lists,
// details, cart, checkout) rather than added as a separate line at checkout.
// The marked-up price is rounded up so buyers never see fractional amounts.
export const withPlatformMarkup = (price: number): number =>
  price
    ? Math.ceil(price + (price * ORDER_CHARGES.platformPercent) / 100)
    : price;
