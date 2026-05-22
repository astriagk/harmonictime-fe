export interface Product {
  ProductName: string;
  Price: number;
  ImageURL: string;
  Tracking?: string;
}

export interface Shipment {
  _id: string;
  ShipmentStatus: string;
  ShippedAt: string | null;
  EstimatedDelivery: string | null;
  Courier: string;
  TrackingNumber: string;
}

export interface Order {
  _id: string;
  TotalAmount: number;
  PaymentStatus: string;
  CheckoutDate: string;
  DeliveryStatus: string;
  Products: Product[];
  Shipments?: Shipment[];
}
