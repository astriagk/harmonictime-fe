export interface Product {
  ProductName: string;
  Price: number;
  ImageURL: string;
  Tracking: string;
}

export interface Order {
  _id: string;
  TotalAmount: number;
  PaymentStatus: string;
  CheckoutDate: string;
  DeliveryStatus: string;
  Products: Product[];
}
