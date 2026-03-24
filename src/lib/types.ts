export type MemberStatus = "active" | "expired" | "frozen";

export interface Plan {
  id: string;
  name: string;
  pricePerMonth: number;
  description: string;
}

export interface Payment {
  id: string;
  memberId: string;
  planId: string;
  months: number;
  amount: number;
  date: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  status: MemberStatus;
  startDate: string;
  endDate: string;
  notes: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  buyingPrice: number;
  stock: number;
}

export interface POSSale {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  date: string;
}

export const DEFAULT_PLANS: Plan[] = [
  { id: "basic", name: "Basic", pricePerMonth: 29.99, description: "Gym floor access" },
  { id: "standard", name: "Standard", pricePerMonth: 49.99, description: "Gym + classes" },
  { id: "premium", name: "Premium", pricePerMonth: 79.99, description: "All access + personal trainer" },
];
