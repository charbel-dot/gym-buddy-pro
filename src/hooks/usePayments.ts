import { useState, useCallback, useEffect } from "react";
import type { Payment } from "@/lib/types";
import { dbGet, dbSet } from "@/lib/db";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";

const PAYMENTS_KEY = "gym-payments";

function loadFromLocalStorage(): Payment[] | null {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    return raw ? (JSON.parse(raw) as Payment[]) : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(payments: Payment[]) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>(() => {
    return loadFromLocalStorage() ?? [];
  });

  // On mount: if localStorage was empty, try IndexedDB backup
  useEffect(() => {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (!raw) {
      dbGet<Payment[]>("payments").then((backup) => {
        if (backup && backup.length > 0) {
          setPayments(backup);
          saveToLocalStorage(backup);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage and mirror to IndexedDB on every change
  useEffect(() => {
    saveToLocalStorage(payments);
    dbSet("payments", payments);
  }, [payments]);

  const addPayment = useCallback((payment: Omit<Payment, "id">) => {
    const newPayment: Payment = { ...payment, id: generateId() };
    setPayments((prev) => [newPayment, ...prev]);
    toast.success("Payment Logged", {
      description: "Revenue transaction completed successfully.",
    });
    return newPayment;
  }, []);

  const getPaymentsForMember = useCallback(
    (memberId: string) => payments.filter((p) => p.memberId === memberId),
    [payments]
  );

  return { payments, addPayment, getPaymentsForMember };
}
