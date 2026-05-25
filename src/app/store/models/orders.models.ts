export interface OfferApplied {
  DiscountPercentage: number;
  DiscountAmount: number;
}

export interface Product {
  ProductName: string;
  Price: number;
  OfferApplied?: OfferApplied | null;
  EffectivePrice?: number;
  BuyerCommissionAmount?: number;
  DisplayPrice?: number;
  ImageURL: string;
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

export interface Order {
  _id: string;
  TotalAmount: number;
  PaymentStatus: string;
  CheckoutDate: string;
  DeliveryStatus: string;
  Products: Product[];
  Shipments?: Shipment[];
  ShippingAddress?: ShippingAddress;
}
