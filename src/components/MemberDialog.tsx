import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Member, MemberStatus, Plan } from "@/lib/types";

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
  plans: Plan[];
  onSave: (data: Omit<Member, "id" | "createdAt">, months: number) => void;
}

export function MemberDialog({ open, onOpenChange, member, plans, onSave }: MemberDialogProps) {
  const defaultPlanId = plans[0]?.id || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState(defaultPlanId);
  const [status, setStatus] = useState<MemberStatus>("active");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [months, setMonths] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setPhone(member.phone);
      setPlanId(member.planId);
      setStatus(member.status);
      setStartDate(member.startDate);
      setNotes(member.notes);
      // Calculate months from dates
      const start = new Date(member.startDate);
      const end = new Date(member.endDate);
      const diffMonths = Math.max(1, Math.round((end.getTime() - start.getTime()) / (30 * 86400000)));
      setMonths(diffMonths);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setPlanId(defaultPlanId);
      setStatus("active");
      setStartDate(new Date().toISOString().slice(0, 10));
      setMonths(1);
      setNotes("");
    }
  }, [member, open, defaultPlanId]);

  const endDate = useMemo(() => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  }, [startDate, months]);

  const selectedPlan = plans.find((p) => p.id === planId);
  const totalCost = selectedPlan ? selectedPlan.pricePerMonth * months : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !planId) return;
    onSave(
      { name, email, phone, planId, status, startDate, endDate, notes },
      months
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update member details below." : "Fill in the details for the new member."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-5 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@email.com" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} placeholder="15550123" />
            </div>
          </div>

          <Separator />

          <div className="grid gap-1.5">
            <Label>Plan Selection</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ${p.pricePerMonth}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="months">Duration</Label>
              <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 6, 12].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} {m === 1 ? "month" : "months"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col justify-end">
              {selectedPlan ? (
                <div className="bg-muted rounded-md px-4 py-2 h-10 flex items-center justify-between text-sm w-full border border-border/50">
                  <span className="text-muted-foreground mr-2">Total Due</span>
                  <span className="font-bold tabular-nums text-primary">${totalCost.toFixed(2)}</span>
                </div>
              ) : (
                <div className="h-10" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>End Date</Label>
              <Input type="date" value={endDate} disabled className="text-muted-foreground bg-muted/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="notes">Internal Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional..." />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]">
              {member ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
