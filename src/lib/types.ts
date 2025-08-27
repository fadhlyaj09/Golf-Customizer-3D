export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  customizable: boolean;
  colors?: { name: string; hex: string }[];
}

export interface Customization {
  color?: { name: string; hex: string };
  printSides?: 0 | 1 | 2;
  logo?: string; // data URL of the logo
  text?: string;
  font?: string;
  textColor?: string;
}

export interface CartItem {
  id: string; // combination of product id and customization options
  product: Product;
  customization: Customization;
  quantity: number;
  price: number; // final price per item including customization
}
