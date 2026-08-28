export interface OfferApplied {
  DiscountPercentage: number;
  DiscountAmount: number;
}

export interface Product {
  _id?: string;
  ProductID?: string;
  ProductName: string;
  Price: number;
  Quantity?: number;
  OfferApplied?: OfferApplied | null;
  EffectivePrice?: number;
  // GST collected from the buyer on tax-exclusive products, per unit. Already
  // inside DisplayPrice — 0 (or absent, on pre-pass-through orders) when the
  // seller's price was tax-inclusive.
  GSTAmount?: number;
  BuyerCommissionAmount?: number;
  DisplayPrice?: number;
  ImageURL: string;
  IsPriceInclusiveOfTax?: boolean;
}

export interface Shipment {
  _id: string;
  ShipmentStatus: string;
  ShippedAt: string | null;
  EstimatedDelivery: string | null;
  Courier: string;
  TrackingNumber: string;
}

export interface ShippingAddress {
  FirstName?: string;
  LastName?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
}

export interface SellerConfirmation {
  Status: 'Pending' | 'Approved' | 'Unavailable';
  Reason?: string | null;
  UpdatedAt?: string;
}

export interface Order {
  _id: string;
  OrderID?: string | null;
  OrderItems?: { ProductID: string; OrderItemID: string }[] | null;
  TotalAmount: number;
  PaymentStatus: string;
  CheckoutDate: string;
  DeliveryStatus: string;
  ProductIDs?: string[];
  Products: Product[];
  Shipments?: Shipment[];
  ShippingAddress?: ShippingAddress;
  SellerConfirmations?: SellerConfirmation[];
  SellerApprovalStatus?: 'Pending' | 'Approved' | 'Rejected';
}
