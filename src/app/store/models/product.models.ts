export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt?: Date;
  specifications?: {
    [key: string]: string;
  };
}
