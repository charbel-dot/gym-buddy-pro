import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Plan } from "@/lib/types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PlansManagerProps {
  plans: Plan[];
  onAdd: (plan: Omit<Plan, "id">) => void;
  onUpdate: (id: string, updates: Partial<Plan>) => void;
  onDelete: (id: string) => void;
  membersUsingPlan: (planId: string) => number;
}

const emptyPlan = { name: "", pricePerMonth: 0, description: "" };

export function PlansManager({ plans, onAdd, onUpdate, onDelete, membersUsingPlan }: PlansManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingPlan(null);
    setForm(emptyPlan);
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({ name: plan.name, pricePerMonth: plan.pricePerMonth, description: plan.description });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingPlan) {
      onUpdate(editingPlan.id, form);
    } else {
      onAdd(form);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Membership Plans</h2>
          <p className="text-sm text-muted-foreground">Manage your gym's pricing and plans.</p>
        </div>
        <Button size="sm" onClick={openAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Plan
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Plan Name</TableHead>
              <TableHead className="font-semibold">Price / Month</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Description</TableHead>
              <TableHead className="font-semibold tabular-nums">Members</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => {
              const count = membersUsingPlan(plan.id);
              return (
                <TableRow key={plan.id} className="group">
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="tabular-nums">${plan.pricePerMonth.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{plan.description || "—"}</TableCell>
                  <TableCell className="tabular-nums">{count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 active:scale-95" onClick={() => openEdit(plan)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive active:scale-95"
                        onClick={() => setDeleteId(plan.id)}
                        disabled={count > 0}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No plans yet. Add your first plan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Update the plan details." : "Create a new membership plan."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="planName">Plan Name *</Label>
              <Input id="planName" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="planPrice">Price per Month ($)</Label>
              <Input
                id="planPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerMonth}
                onChange={(e) => setForm((f) => ({ ...f, pricePerMonth: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="planDesc">Description</Label>
              <Input id="planDesc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]">
                {editingPlan ? "Save" : "Add Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
