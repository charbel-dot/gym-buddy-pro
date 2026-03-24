import { Users, UserCheck, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Member, Payment } from "@/lib/types";
import { todayLocalISO } from "@/hooks/useMembers";

interface StatsCardsProps {
  members: Member[];
  payments: Payment[];
}

export function StatsCards({ members, payments }: StatsCardsProps) {
  const active = members.filter((m) => m.status === "active").length;

  // Timezone-safe: compare date strings to avoid off-by-one for UTC+ users
  const todayStr = todayLocalISO();
  const in7Days = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  })();

  const expiringSoon = members.filter((m) => {
    if (m.status !== "active") return false;
    return m.endDate > todayStr && m.endDate <= in7Days;
  }).length;

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: "Total Members", value: String(members.length), icon: Users, accent: false },
    { label: "Active", value: String(active), icon: UserCheck, accent: true },
    { label: "Expiring Soon", value: String(expiringSoon), icon: AlertTriangle, accent: false },
    { label: "Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, accent: false },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <Card
          key={s.label}
          className="shadow-none animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {s.label}
              </span>
              <s.icon className={`w-4 h-4 ${s.accent ? "text-accent" : "text-muted-foreground"}`} />
            </div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
