import { useState, useMemo } from "react";
import { useGym } from "@/contexts/GymContext";
import { StatsCards } from "@/components/StatsCards";
import { MemberTable } from "@/components/MemberTable";
import { MemberDialog } from "@/components/MemberDialog";
import { exportMembersToExcel } from "@/lib/exportExcel";
import { useMemberSave } from "@/hooks/useMemberSave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Search } from "lucide-react";
import type { Member } from "@/lib/types";

export default function DashboardPage() {
  const { members, plans, payments, deleteMember } = useGym();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = members;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((m) => m.status === statusFilter);
    }
    return list;
  }, [members, search, statusFilter]);

  const clearEditing = () => setEditingMember(null);
  const handleSave = useMemberSave(plans, editingMember, clearEditing);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full transition-all duration-200 ease-linear">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your gym operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMembersToExcel(filtered, plans, payments)}
            disabled={filtered.length === 0}
            className="active:scale-[0.97]"
            title={filtered.length < members.length ? `Export ${filtered.length} visible members` : "Export all members"}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            size="sm"
            onClick={() => { setEditingMember(null); setDialogOpen(true); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Add Member</span>
          </Button>
        </div>
      </div>

      <StatsCards members={members} payments={payments} />

      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <MemberTable
        members={filtered}
        plans={plans}
        onEdit={(m) => { setEditingMember(m); setDialogOpen(true); }}
        onDelete={deleteMember}
      />

      <p className="text-xs text-muted-foreground text-center tabular-nums">
        Showing {filtered.length} of {members.length} members
      </p>

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        plans={plans}
        onSave={handleSave}
      />
    </div>
  );
}
