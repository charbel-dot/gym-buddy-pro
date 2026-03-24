import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { Member, Plan } from "@/lib/types";

interface MemberTableProps {
  members: Member[];
  plans: Plan[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

const statusVariant: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
  frozen: "bg-muted text-muted-foreground border-border",
};

export function MemberTable({ members, plans, onEdit, onDelete }: MemberTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getPlanName = (planId: string) => {
    const p = plans.find((pl) => pl.id === planId);
    return p ? p.name : "Unknown";
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-fade-in">
        <p className="text-lg font-medium">No members yet</p>
        <p className="text-sm mt-1">Add your first member to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden animate-fade-in" style={{ animationDelay: "150ms" }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Phone</TableHead>
              <TableHead className="font-semibold">Plan</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">End Date</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="group">
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{member.email || "—"}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground tabular-nums">{member.phone || "—"}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium uppercase tracking-wide">{getPlanName(member.planId)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusVariant[member.status]}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell tabular-nums text-muted-foreground">{member.endDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8 active:scale-95" onClick={() => onEdit(member)}>
                          <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 sm:h-8 sm:w-8 text-destructive hover:text-destructive active:scale-95"
                          onClick={() => setDeleteId(member.id)}
                        >
                          <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this member and cannot be undone.</AlertDialogDescription>
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
    </>
  );
}
