import { useState, useCallback, useEffect } from "react";
import type { Member, MemberStatus } from "@/lib/types";
import { dbGet, dbSet } from "@/lib/db";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "gym-members";

/** Returns today as "YYYY-MM-DD" in local time — safe for timezone comparison */
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadFromLocalStorage(): Member[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Member[]) : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(members: Member[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

/**
 * Auto-expire members whose endDate has passed.
 * Compares ISO date STRINGS (no Date objects) to avoid timezone off-by-one.
 */
function autoExpire(members: Member[]): Member[] {
  const today = todayLocalISO();
  return members.map((m) => {
    if (m.status === "active" && m.endDate < today) {
      return { ...m, status: "expired" as MemberStatus };
    }
    return m;
  });
}

export function useMembers() {
  // Sync load from localStorage on first render
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = loadFromLocalStorage();
    if (saved) return autoExpire(saved);
    return [];
  });

  // On mount: if localStorage was empty, try to restore from IndexedDB backup
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      dbGet<Member[]>("members").then((backup) => {
        if (backup && backup.length > 0) {
          const expired = autoExpire(backup);
          setMembers(expired);
          saveToLocalStorage(expired);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage and mirror to IndexedDB on every change
  useEffect(() => {
    saveToLocalStorage(members);
    dbSet("members", members);
  }, [members]);

  // Re-run auto-expire when window regains focus (handles long-running sessions)
  useEffect(() => {
    const handleFocus = () => {
      setMembers((prev) => autoExpire(prev));
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const addMember = useCallback((member: Omit<Member, "id" | "createdAt">) => {
    const newMember: Member = {
      ...member,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [newMember, ...prev]);
    toast.success("Member Added", {
      description: "New member profile has been created successfully.",
    });
    return newMember;
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    toast.success("Member Updated", {
      description: "Member details were saved successfully.",
    });
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.error("Member Deleted", {
      description: "The member has been permanently removed.",
    });
  }, []);

  return { members, addMember, updateMember, deleteMember };
}
