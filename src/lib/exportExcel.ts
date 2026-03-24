import * as XLSX from "xlsx";
import type { Member, Plan, Payment } from "./types";

export function exportMembersToExcel(members: Member[], plans: Plan[], payments: Payment[]) {
  const getPlanName = (planId: string) => plans.find((p) => p.id === planId)?.name || "Unknown";
  const getPlanPrice = (planId: string) => plans.find((p) => p.id === planId)?.pricePerMonth || 0;

  // Members sheet
  const memberData = members.map((m) => ({
    Name: m.name,
    Email: m.email,
    Phone: m.phone,
    Plan: getPlanName(m.planId),
    "Price/Month": getPlanPrice(m.planId),
    Status: m.status.charAt(0).toUpperCase() + m.status.slice(1),
    "Start Date": m.startDate,
    "End Date": m.endDate,
    Notes: m.notes,
  }));

  // Payments sheet
  const paymentData = payments.map((p) => ({
    Member: members.find((m) => m.id === p.memberId)?.name || "Unknown",
    Plan: getPlanName(p.planId),
    Months: p.months,
    Amount: p.amount,
    Date: p.date,
  }));

  // Plans sheet
  const planData = plans.map((p) => ({
    "Plan Name": p.name,
    "Price/Month": p.pricePerMonth,
    Description: p.description,
    "Active Members": members.filter((m) => m.planId === p.id && m.status === "active").length,
  }));

  const wb = XLSX.utils.book_new();

  const wsMember = XLSX.utils.json_to_sheet(memberData);
  wsMember["!cols"] = [
    { wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 14 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMember, "Members");

  const wsPayment = XLSX.utils.json_to_sheet(paymentData);
  wsPayment["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsPayment, "Payments");

  const wsPlan = XLSX.utils.json_to_sheet(planData);
  wsPlan["!cols"] = [{ wch: 16 }, { wch: 12 }, { wch: 30 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsPlan, "Plans");

  XLSX.writeFile(wb, `gym-data-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
