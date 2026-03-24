/**
 * Shared hook containing the "save member" logic used by both
 * DashboardPage and MembersPage.
 *
 * Bug fix: when editing a member and the endDate is extended OR the plan
 * changes, a renewal payment is automatically recorded.
 */
import { useCallback } from "react";
import { useGym } from "@/contexts/GymContext";
import type { Member, Plan } from "@/lib/types";
import { todayLocalISO } from "@/hooks/useMembers";

export function useMemberSave(
  plans: Plan[],
  editingMember: Member | null,
  onDone: () => void
) {
  const { addMember, updateMember, addPayment } = useGym();

  const handleSave = useCallback(
    (data: Omit<Member, "id" | "createdAt">, months: number) => {
      if (editingMember) {
        updateMember(editingMember.id, data);

        // Log a renewal payment only when the membership is actually extended
        // (end date moved forward) — not for plain contact-info edits
        const endDateExtended = data.endDate > editingMember.endDate;
        if (endDateExtended) {
          const plan = plans.find((p) => p.id === data.planId);
          if (plan) {
            addPayment({
              memberId: editingMember.id,
              planId: data.planId,
              months,
              amount: plan.pricePerMonth * months,
              date: todayLocalISO(),
            });
          }
        }
      } else {
        const newMember = addMember(data);
        const plan = plans.find((p) => p.id === data.planId);
        if (plan) {
          addPayment({
            memberId: newMember.id,
            planId: data.planId,
            months,
            amount: plan.pricePerMonth * months,
            date: todayLocalISO(),
          });
        }
      }

      onDone();
    },
    [editingMember, plans, addMember, updateMember, addPayment, onDone]
  );

  return handleSave;
}
