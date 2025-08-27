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

interface SideCustomization {
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
  // Legacy fields for cart summary, can be removed if cart is updated
  logo?: string;
  text?: string;
}

export interface CartItem {
  id: string; // combination of product id and customization options
  product: Product;
  customization: Customization;
  quantity: number;
  price: number; // final price per item including customization
}
