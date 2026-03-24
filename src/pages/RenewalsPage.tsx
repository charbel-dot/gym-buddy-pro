import { useMemo, useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, AlertTriangle, MessageCircle, Phone, Mail, Search } from "lucide-react";
import { isBefore, addDays, differenceInDays } from "date-fns";

export default function RenewalsPage() {
  const { members, plans } = useGym();
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date();
  const expiryThreshold = addDays(today, 7); // Looking 7 days ahead

  // Process and sort members by urgency
  const renewalData = useMemo(() => {
    return members
      .filter((m) => {
        const endDate = new Date(m.endDate);
        // We care about members who are expiring within 7 days OR recently expired
        return isBefore(endDate, expiryThreshold) && m.status !== "frozen";
      })
      .map((m) => {
        const endDate = new Date(m.endDate);
        const daysRemaining = differenceInDays(endDate, today);
        const plan = plans.find(p => p.id === m.planId);
        
        return {
          ...m,
          daysRemaining,
          planName: plan?.name || "Unknown Plan",
          isExpired: daysRemaining < 0
        };
      })
      // Sort by urgency: Expired first (most negative), then closest to 0
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [members, plans, today, expiryThreshold]);

  const filteredRenewals = renewalData.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.phone.includes(searchQuery)
  );

  const expiredCount = renewalData.filter(m => m.isExpired).length;
  const upcomingCount = renewalData.filter(m => !m.isExpired).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full transition-all duration-200 ease-linear">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6" /> Renewals Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Follow up with members whose subscriptions are ending soon.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive mb-1 uppercase tracking-wide">Action Required</p>
              <p className="text-3xl font-bold text-destructive tabular-nums">{expiredCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Recently Expired Members</p>
            </div>
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warning mb-1 uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-warning tabular-nums">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Expiring within 7 days</p>
            </div>
            <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Priority Follow-Ups</CardTitle>
              <CardDescription>Members to contact for renewal and retention.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRenewals.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>You're all caught up!</p>
              <p className="text-sm">No members are expiring within the next 7 days.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-[250px]">Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">End Date</TableHead>
                  <TableHead className="hidden md:table-cell">Plan</TableHead>
                  <TableHead className="text-right pr-6">Contact Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRenewals.map((m) => (
                  <TableRow key={m.id} className={m.isExpired ? "bg-destructive/5" : ""}>
                    <TableCell className="pl-6 font-medium">
                      {m.name}
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">{m.phone}</div>
                    </TableCell>
                    <TableCell>
                      {m.isExpired ? (
                        <Badge variant="destructive" className="font-semibold px-2 py-0.5">
                          Expired {Math.abs(m.daysRemaining)} days ago
                        </Badge>
                      ) : (
                        <Badge className="bg-warning text-warning-foreground hover:bg-warning/90 font-semibold px-2 py-0.5">
                          Expiring in {m.daysRemaining} {m.daysRemaining === 1 ? 'day' : 'days'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm tabular-nums">
                      {new Date(m.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs text-muted-foreground bg-muted/30">{m.planName}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {m.phone && (
                          <>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" asChild title="WhatsApp">
                              <a href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(m.name)}!%20This%20is%20MY%20GYM.%20We%20noticed%20your%20subscription%20${m.isExpired ? 'expired recently' : 'is expiring soon'}.%20Would%20you%20like%20to%20renew%3F`} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild title="Call">
                              <a href={`tel:${m.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          </>
                        )}
                        {m.email && (
                          <Button variant="outline" size="icon" className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50" asChild title="Email">
                            <a href={`mailto:${m.email}?subject=Your%20MY%20GYM%20Subscription&body=Hi%20${encodeURIComponent(m.name)},%0A%0AWe%20hope%20you're%20enjoying%20your%20workouts!%20Just%20a%20reminder%20that%20your%20subscription%20${m.isExpired ? 'has expired' : 'is about to expire'}.`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
