import { useState, useCallback, useEffect } from "react";
import type { Product } from "@/lib/types";
import { dbGet, dbSet } from "@/lib/db";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";

const PRODUCTS_KEY = "gym-products";

function loadFromLocalStorage(): Product[] | null {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    return loadFromLocalStorage() ?? [];
  });

  // On mount: if localStorage was empty, try IndexedDB backup
  useEffect(() => {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      dbGet<Product[]>("products").then((backup) => {
        if (backup && backup.length > 0) {
          setProducts(backup);
          saveToLocalStorage(backup);
        }
      });
    }
  }, []);

  // Persist to localStorage and mirror to IndexedDB on every change
  useEffect(() => {
    saveToLocalStorage(products);
    dbSet("products", products);
  }, [products]);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct: Product = { ...product, id: generateId() };
    setProducts((prev) => [...prev, newProduct]);
    toast.success("Product Added", {
      description: "Inventory item has been successfully added.",
    });
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    toast.success("Product Updated", {
      description: "Inventory details saved successfully.",
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.error("Product Deleted", {
      description: "Product removed from inventory.",
    });
  }, []);

  return { products, addProduct, updateProduct, deleteProduct };
}
