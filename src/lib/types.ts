export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  gallery?: string[];
  customizable: boolean;
  colors?: { name: string; hex: string }[];
}

export interface SideCustomization {
  type: 'logo' | 'text' | 'none';
  content: string; // data URL for logo, or the text content
  font?: string;
  color?: string;
}

export interface Customization {
  color?: { name: string; hex: string };
  printSides: 0 | 1 | 2;
  side1: SideCustomization;
  side2: SideCustomization;
}

export interface CartItem {
  id: string; // combination of product id and customization options
  product: Product;
  customization: Customization;
  quantity: number;
  price: number; // final price per item including customization
  selected?: boolean; // For checkout selection
}

export interface Address {
    id: string;
    name: string;
    phone: string;
    fullAddress: string;
    province: string;
    city: string;
    zip: string;
    isDefault?: boolean;
}
