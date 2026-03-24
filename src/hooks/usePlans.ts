import { useState, useCallback, useEffect } from "react";
import type { Plan } from "@/lib/types";
import { DEFAULT_PLANS } from "@/lib/types";
import { dbGet, dbSet } from "@/lib/db";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";

const PLANS_KEY = "gym-plans";

function loadFromLocalStorage(): Plan[] | null {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    return raw ? (JSON.parse(raw) as Plan[]) : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(plans: Plan[]) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(() => {
    return loadFromLocalStorage() ?? DEFAULT_PLANS;
  });

  // On mount: if localStorage was empty, try IndexedDB backup
  useEffect(() => {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) {
      dbGet<Plan[]>("plans").then((backup) => {
        if (backup && backup.length > 0) {
          setPlans(backup);
          saveToLocalStorage(backup);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage and mirror to IndexedDB on every change
  useEffect(() => {
    saveToLocalStorage(plans);
    dbSet("plans", plans);
  }, [plans]);

  const addPlan = useCallback((plan: Omit<Plan, "id">) => {
    const newPlan: Plan = { ...plan, id: generateId() };
    setPlans((prev) => [...prev, newPlan]);
    toast.success("Plan Created", {
      description: "A new membership plan has been added.",
    });
  }, []);

  const updatePlan = useCallback((id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    toast.success("Plan Updated", {
      description: "Plan configuration saved successfully.",
    });
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toast.error("Plan Deleted", {
      description: "Membership plan removed from the system.",
    });
  }, []);

  return { plans, addPlan, updatePlan, deletePlan };
}
