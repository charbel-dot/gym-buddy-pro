import { useMembers } from "@/hooks/useMembers";
import { usePlans } from "@/hooks/usePlans";
import { usePayments } from "@/hooks/usePayments";
import { useProducts } from "@/hooks/useProducts";
import { usePOSSales } from "@/hooks/usePOSSales";
import { createContext, useContext, type ReactNode } from "react";
import type { Member, Plan, Payment, Product, POSSale } from "@/lib/types";

interface GymContextType {
  members: Member[];
  addMember: (m: Omit<Member, "id" | "createdAt">) => Member;
  updateMember: (id: string, u: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  plans: Plan[];
  addPlan: (p: Omit<Plan, "id">) => void;
  updatePlan: (id: string, u: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  payments: Payment[];
  addPayment: (p: Omit<Payment, "id">) => Payment;
  getPaymentsForMember: (id: string) => Payment[];
  products: Product[];
  addProduct: (p: Omit<Product, "id">) => Product;
  updateProduct: (id: string, u: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  posSales: POSSale[];
  addPOSSale: (s: Omit<POSSale, "id" | "totalPrice">) => POSSale | undefined;
}

const GymContext = createContext<GymContextType | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const { members, addMember, updateMember, deleteMember } = useMembers();
  const { plans, addPlan, updatePlan, deletePlan } = usePlans();
  const { payments, addPayment, getPaymentsForMember } = usePayments();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { posSales, addPOSSale } = usePOSSales(products, updateProduct);

  return (
    <GymContext.Provider
      value={{
        members, addMember, updateMember, deleteMember,
        plans, addPlan, updatePlan, deletePlan,
        payments, addPayment, getPaymentsForMember,
        products, addProduct, updateProduct, deleteProduct,
        posSales, addPOSSale,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
}
