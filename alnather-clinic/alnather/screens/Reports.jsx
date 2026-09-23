"use client";
import React, { useEffect, useState } from "react";
import { Card, Field, Input } from "@/components/ui";
import { seedInvoices, seedExams, seedPatients } from "@/lib/data";
import { readStorage, STORAGE_KEYS } from "@/lib/storage";
import { fmtMoney, fmtDate } from "@/lib/utils";

export default function Reports() {
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-08-12");
  const [patients, setPatients] = useState(seedPatients);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [exams, setExams] = useState(seedExams);

  useEffect(() => {
    setPatients(readStorage(STORAGE_KEYS.patients, seedPatients));
    setInvoices(readStorage(STORAGE_KEYS.invoices, seedInvoices));
    setExams(readStorage(STORAGE_KEYS.exams, seedExams));
  }, []);

  const inv = invoices.filter((i) => i.date >= from && i.date <= to);
  const ex = exams.filter((e) => e.date >= from && e.date <= to);
  const totalRev = inv.reduce((s, i) => s + i.total, 0) + ex.reduce((s, e) => s + e.price, 0);
  const totalPaid = inv.reduce((s, i) => s + i.paid, 0);

  const exportCsv = () => {
    const rows = [["رقم الفاتورة","التاريخ","الإجمالي","المدفوع"], ...inv.map((i) => [i.no, i.date, i.total, i.paid])];
    const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `report_${from}_${to}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-end gap-4 p-4">
        <Field label="من تاريخ"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="إلى تاريخ"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <div className="mr-auto flex gap-3">
          <button onClick={() => window.print()} className="btn-ghost"><i className="fa-solid fa-print" /> طباعة</button>
          <button onClick={() => window.print()} className="btn-blue"><i className="fa-solid fa-file-pdf" /> PDF</button>
          <button onClick={exportCsv} className="btn-green"><i className="fa-solid fa-file-excel" /> Excel</button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="p-5 text-center"><div className="text-3xl font-black text-primary">{fmtMoney(totalRev)}</div><div className="mt-1 text-sm font-bold text-gray-500">إجمالي الإيرادات</div></Card>
        <Card className="p-5 text-center"><div className="text-3xl font-black text-success">{fmtMoney(totalPaid)}</div><div className="mt-1 text-sm font-bold text-gray-500">المبالغ المحصلة</div></Card>
        <Card className="p-5 text-center"><div className="text-3xl font-black text-info">{ex.length}</div><div className="mt-1 text-sm font-bold text-gray-500">عدد الفحوصات</div></Card>
      </div>

      <Card>
        <div className="border-b border-gray-100 px-5 py-4"><h3 className="font-extrabold text-primary"><i className="fa-solid fa-table ml-2 text-accent" />تفاصيل الفترة</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="th">رقم الفاتورة</th><th className="th">التاريخ</th><th className="th">المريض</th><th className="th">الإجمالي</th><th className="th">المدفوع</th><th className="th">المتبقي</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {inv.map((i) => (
                <tr key={i.id} className="hover:bg-accent-soft/40">
                  <td className="td font-bold">{i.no}</td><td className="td">{fmtDate(i.date)}</td>
                  <td className="td">{patients.find((p) => p.id === i.patientId)?.name || "عميل نقدي"}</td>
                  <td className="td">{fmtMoney(i.total)}</td><td className="td text-success">{fmtMoney(i.paid)}</td>
                  <td className="td text-danger">{fmtMoney(i.total - i.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
