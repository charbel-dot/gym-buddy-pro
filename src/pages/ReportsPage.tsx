import { useMemo } from "react";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ReportsPage() {
  const { members, plans, payments, posSales, products } = useGym();

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  /* -------------------------------------------------------------------------- */
  /*                             COMBINED ANALYTICS                            */
  /* -------------------------------------------------------------------------- */
  
  const totalMembershipRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalPOSRevenue = posSales.reduce((s, p) => s + p.totalPrice, 0);
  const combinedRevenue = totalMembershipRevenue + totalPOSRevenue;
  
  const revenueByMonth = useMemo(() => {
    const now = new Date();
    const months: { label: string; memberships: number; pos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const memberships = payments
        .filter((p) => p.date.startsWith(key))
        .reduce((sum, p) => sum + p.amount, 0);
      const pos = posSales
        .filter((p) => p.date.startsWith(key))
        .reduce((sum, p) => sum + p.totalPrice, 0);
      months.push({ label, memberships, pos });
    }
    return months;
  }, [payments, posSales]);

  /* -------------------------------------------------------------------------- */
  /*                            MEMBERSHIP ANALYTICS                            */
  /* -------------------------------------------------------------------------- */
  
  const statusBreakdown = useMemo(() => {
    const active = members.filter((m) => m.status === "active").length;
    const expired = members.filter((m) => m.status === "expired").length;
    const frozen = members.filter((m) => m.status === "frozen").length;
    return { active, expired, frozen };
  }, [members]);

  const membersByPlan = useMemo(() => {
    return plans.map((p) => ({
      name: p.name,
      value: members.filter((m) => m.planId === p.id).length,
    }));
  }, [plans, members]);

  const planRevenue = useMemo(() => {
    return plans.map((p) => {
      const total = payments.filter((pay) => pay.planId === p.id).reduce((sum, pay) => sum + pay.amount, 0);
      return { name: p.name, revenue: total };
    });
  }, [plans, payments]);

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map((p) => ({
        ...p,
        memberName: members.find((m) => m.id === p.memberId)?.name || "Unknown",
        planName: plans.find((pl) => pl.id === p.planId)?.name || "Unknown",
      }));
  }, [payments, members, plans]);

  /* -------------------------------------------------------------------------- */
  /*                                POS ANALYTICS                               */
  /* -------------------------------------------------------------------------- */

  const recentPOSSales = useMemo(() => {
    return [...posSales]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map((sale) => ({
        ...sale,
        productName: products.find((p) => p.id === sale.productId)?.name || "Unknown Product",
      }));
  }, [posSales, products]);


  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full transition-all duration-200 ease-linear">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Reports Dashboard</h1>
        <p className="text-sm text-muted-foreground">Comprehensive analytics for memberships and point of sale</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:inline-flex mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
          <TabsTrigger value="pos">Store & POS</TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/*                         OVERVIEW TAB                      */}
        {/* ========================================================= */}
        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Combined Revenue", value: `$${combinedRevenue.toFixed(0)}` },
              { label: "Total Active Members", value: String(statusBreakdown.active) },
              { label: "Total Membership $", value: `$${totalMembershipRevenue.toFixed(0)}` },
              { label: "Total POS $", value: `$${totalPOSRevenue.toFixed(0)}` },
            ].map((s, i) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">{s.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Monthly Revenue (Memberships vs POS)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMonth} margin={{ top: 12, right: 4, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `$${value.toFixed(2)}`,
                        name === "memberships" ? "Memberships" : "POS Sales"
                      ]}
                      cursor={{ fill: 'var(--muted)' }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))",
                        fontSize: 12,
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="pos" stackId="a" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="memberships" stackId="a" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/*                       MEMBERSHIPS TAB                     */}
        {/* ========================================================= */}
        <TabsContent value="memberships" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Membership Revenue", value: `$${totalMembershipRevenue.toFixed(0)}` },
              { label: "Active Subs", value: String(statusBreakdown.active) },
              { label: "Expired Subs", value: String(statusBreakdown.expired) },
              { label: "Total Memb. Payments", value: String(payments.length) },
            ].map((s, i) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Members by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex items-center justify-center">
                  {membersByPlan.every((p) => p.value === 0) ? (
                    <p className="text-sm text-muted-foreground">No members yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={membersByPlan.filter((p) => p.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, value }) => `${name} (${value})`}
                        >
                          {membersByPlan.filter((p) => p.value > 0).map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--card))",
                            color: "hsl(var(--card-foreground))",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={planRevenue} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={80} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                        cursor={{ fill: 'var(--muted)' }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          color: "hsl(var(--card-foreground))",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Membership Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentPayments.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No payments recorded yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold pl-6">Member</TableHead>
                      <TableHead className="font-semibold">Plan</TableHead>
                      <TableHead className="font-semibold tabular-nums">Months</TableHead>
                      <TableHead className="font-semibold tabular-nums">Amount</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell pr-6">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium pl-6">{p.memberName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs bg-muted/60">{p.planName}</Badge>
                        </TableCell>
                        <TableCell className="tabular-nums">{p.months}</TableCell>
                        <TableCell className="tabular-nums font-semibold">${p.amount.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground pr-6">
                          {new Date(p.date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/*                       STORE & POS TAB                     */}
        {/* ========================================================= */}
        <TabsContent value="pos" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">POS Revenue</p>
                <p className="text-2xl font-bold text-primary tabular-nums">${totalPOSRevenue.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Items Sold</p>
                <p className="text-2xl font-bold tabular-nums">
                  {posSales.reduce((acc, sale) => acc + sale.quantity, 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total POS Transactions</p>
                <p className="text-2xl font-bold tabular-nums">{posSales.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Items in Inventory</p>
                <p className="text-2xl font-bold tabular-nums">{products.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Point of Sale Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentPOSSales.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No POS sales logged yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold pl-6">Product</TableHead>
                      <TableHead className="font-semibold tabular-nums">Quantity</TableHead>
                      <TableHead className="font-semibold tabular-nums">Total Price</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell pr-6">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPOSSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium pl-6">{sale.productName}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{sale.quantity}x</TableCell>
                        <TableCell className="tabular-nums font-semibold">${sale.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground pr-6">
                          {new Date(sale.date).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
