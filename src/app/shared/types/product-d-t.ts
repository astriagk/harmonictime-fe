export interface Brand {
  _id: string;
  BrandName: string;
}

export interface Category {
  _id: string;
  CategoryName: string;
}

export interface Collection {
  _id: string;
  CollectionName: string;
}

export interface DialColor {
  _id: string;
  DialColorName: string;
}

export interface Movement {
  _id: string;
  MovementName: string;
}

export interface StrapMaterial {
  _id: string;
  StrapMaterialName: string;
}

export interface CaseMaterial {
  _id: string;
  CaseMaterialName: string;
}

export interface WatchMarker {
  _id: string;
  WatchMarkerName: string;
}

export interface DeliveryOption {
  _id: string;
  DeliveryOptionName: string;
}

export interface Recipient {
  _id: string;
  RecipientName: string;
}

export interface IProduct {
  id: number;
  img: string;
  trending?: boolean;
  topRated?: boolean;
  bestSeller?: boolean;
  new?: boolean;
  banner?: boolean;
  price: number;
  old_price?: number;
  discount?: number;
  rating?: number;
  status?: string;
  quantity: number;
  related_images: string[];
  orderQuantity?: number;
  sizes: string[];
  weight?: number;
  dimension?: string;
  big_img?: string;
  colors: string[];
  thumb_img: string;
  sm_desc: string;
  banner_img?: string;
  parentCategory: string;
  category: string;
  brand: string;
  title: string;
  details: {
    details_text: string;
    details_list: string[];
    details_text_2: string;
  };
  reviews: {
    img: string;
    name: string;
    time: string;
    rating: number;
    review_desc: string;
  }[];
}

export interface Product {
  _id: string;
  UserID: string;
  ProductName: string;
  Price: number;
  IsAvailable: boolean;
  DateListed: string;
  Description: Description;
  Details: Details;
  Images: Image[];
  DeliveryAndReturns: DeliveryAndReturns;
}

export interface Description {
  _id: string;
  Title: string;
  Content: string;
  AdditionalDetails: string;
  CreatedAt: string;
}

export interface Details {
  Diameter: string;
  WaterResistant: string;
  ManufacturerProductNumber: string;
  Guarantee: string;
  _id: string;
  CollectionName: string;
  CollectionId: string;
  CategoryName: string;
  CategoryId: string;
  RecipientName: string;
  RecipientId: string;
  DialColorName: string;
  DialColorId: string;
  MovementName: string;
  MovementId: string;
  StrapMaterialName: string;
  StrapMaterialId: string;
  CaseMaterialName: string;
  CaseMaterialId: string;
  WatchMarkerName: string;
  WatchMarkerId: string;
  DeliveryOptionID: string;
  BrandName: string;
  BrandId: string;
}

export interface Image {
  _id: string;
  ProductID: string;
  ImageURL: string;
  IsPrimary: boolean;
  AltText: string;
}

export interface DeliveryAndReturns {
  _id: string;
  ProductID: string;
  DeliveryInformation: string;
  ReturnsPolicy: string;
  CreatedAt: string;
}
