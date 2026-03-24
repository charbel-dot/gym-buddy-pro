import { useGym } from "@/contexts/GymContext";
import { PlansManager } from "@/components/PlansManager";

export default function PlansPage() {
  const { plans, members, addPlan, updatePlan, deletePlan } = useGym();

  const membersUsingPlan = (planId: string) =>
    members.filter((m) => m.planId === planId).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full transition-all duration-200 ease-linear">
      <PlansManager
        plans={plans}
        onAdd={addPlan}
        onUpdate={updatePlan}
        onDelete={deletePlan}
        membersUsingPlan={membersUsingPlan}
      />
    </div>
  );
}
