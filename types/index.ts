// types/index.ts
export interface Order {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  products: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  referralCode?: string;
  deliveryAddress: Address;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size?: number;
  color?: string;
  image?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  hostel: string;
  roomNumber: string;
  landmark?: string;
}