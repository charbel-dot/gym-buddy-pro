import { useState, useCallback, useEffect } from "react";
import type { POSSale, Product } from "@/lib/types";
import { dbGet, dbSet } from "@/lib/db";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";

const POS_SALES_KEY = "gym-pos-sales";

function loadFromLocalStorage(): POSSale[] | null {
  try {
    const raw = localStorage.getItem(POS_SALES_KEY);
    return raw ? (JSON.parse(raw) as POSSale[]) : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(sales: POSSale[]) {
  localStorage.setItem(POS_SALES_KEY, JSON.stringify(sales));
}

export function usePOSSales(
  products: Product[],
  updateProduct: (id: string, updates: Partial<Product>) => void
) {
  const [posSales, setPOSSales] = useState<POSSale[]>(() => {
    return loadFromLocalStorage() ?? [];
  });

  // On mount: if localStorage was empty, try IndexedDB backup
  useEffect(() => {
    const raw = localStorage.getItem(POS_SALES_KEY);
    if (!raw) {
      dbGet<POSSale[]>("posSales").then((backup) => {
        if (backup && backup.length > 0) {
          setPOSSales(backup);
          saveToLocalStorage(backup);
        }
      });
    }
  }, []);

  // Persist to localStorage and mirror to IndexedDB on every change
  useEffect(() => {
    saveToLocalStorage(posSales);
    dbSet("posSales", posSales);
  }, [posSales]);

  const addPOSSale = useCallback((saleDetails: Omit<POSSale, "id" | "totalPrice">) => {
    const product = products.find(p => p.id === saleDetails.productId);
    if (!product) {
      toast.error("Sale Failed", { description: "Product not found." });
      return;
    }
    
    if (product.stock < saleDetails.quantity) {
      toast.error("Sale Failed", { description: `Not enough stock. Only ${product.stock} available.` });
      return;
    }

    const newSale: POSSale = { 
      ...saleDetails, 
      id: generateId(),
      totalPrice: product.price * saleDetails.quantity
    };
    
    setPOSSales((prev) => [newSale, ...prev]); // Add at the beginning (newest first)
    
    // Deduct stock
    updateProduct(product.id, { stock: product.stock - saleDetails.quantity });

    toast.success("Checkout Successful", {
      description: `Sold ${saleDetails.quantity}x ${product.name} for $${newSale.totalPrice.toFixed(2)}.`,
    });
    
    return newSale;
  }, [products, updateProduct]);

  return { posSales, addPOSSale };
}
