"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, Badge } from "@/components/ui";
import { seedExams, seedInvoices, seedPatients, seedProducts } from "@/lib/data";
import { readStorage, STORAGE_KEYS } from "@/lib/storage";
import { fmtMoney, fmtDate } from "@/lib/utils";

export default function Dashboard({ go }) {
  const [patients, setPatients] = useState(seedPatients);
  const [exams, setExams] = useState(seedExams);
  const [products, setProducts] = useState(seedProducts);
  const [invoices, setInvoices] = useState(seedInvoices);

  useEffect(() => {
    setPatients(readStorage(STORAGE_KEYS.patients, seedPatients));
    setExams(readStorage(STORAGE_KEYS.exams, seedExams));
    setProducts(readStorage(STORAGE_KEYS.products, seedProducts));
    setInvoices(readStorage(STORAGE_KEYS.invoices, seedInvoices));
  }, []);

  const pName = (id) => patients.find((p) => p.id === id)?.name || "—";
  const todayExams = exams.filter((e) => e.date === "2026-08-12");
  const lowStock = products.filter((p) => p.qty <= p.min);
  const todaySales = invoices.filter((i) => i.date === "2026-08-12").reduce((s, i) => s + i.paid, 0);
  const todayIncome = todaySales + todayExams.reduce((s, e) => s + e.price, 0);

  const stats = [
    { label: "فحوصات اليوم",          value: todayExams.length, icon: "fa-file-medical",      bg: "bg-purple-100", fg: "text-purple-600" },
    { label: "تنبيهات نقص المخزون",    value: lowStock.length,   icon: "fa-box-open",          bg: "bg-blue-100",   fg: "text-info" },
    { label: "مبيعات اليوم",          value: fmtMoney(todaySales), icon: "fa-cart-shopping",  bg: "bg-teal-100",   fg: "text-teal" },
    { label: "إجمالي دخل اليوم",       value: fmtMoney(todayIncome), icon: "fa-sack-dollar",  bg: "bg-emerald-100",fg: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl2 ${s.bg} ${s.fg}`}>
              <i className={`fa-solid ${s.icon} text-2xl`} />
            </span>
            <div>
              <div className="text-2xl font-black text-primary">{s.value}</div>
              <div className="mt-0.5 text-sm font-bold text-gray-500">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            icon={<i className="fa-solid fa-stethoscope" />}
            title="آخر الفحوصات"
            action={<button onClick={() => go("patients")} className="text-xs font-bold text-info hover:underline">عرض الكل</button>}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">اسم المريض</th><th className="th">الفاحص</th>
                  <th className="th">التاريخ</th><th className="th">السعر</th><th className="th">رقم الفاتورة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {seedExams.map((e) => (
                  <tr key={e.id} className="transition hover:bg-accent-soft/40">
                    <td className="td font-bold text-gray-800">{pName(e.patientId)}</td>
                    <td className="td">{e.examinerId === 1 ? "د. سارة الحربي" : "د. خالد العتيبي"}</td>
                    <td className="td text-gray-500">{fmtDate(e.date)}</td>
                    <td className="td font-bold text-success">{fmtMoney(e.price)}</td>
                    <td className="td"><Badge color="yellow">{e.invoiceNo}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={<i className="fa-solid fa-receipt" />}
            title="آخر الفواتير"
            action={<button onClick={() => go("invoices")} className="text-xs font-bold text-info hover:underline">عرض الكل</button>}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">اسم المريض</th><th className="th">الإجمالي</th>
                  <th className="th">المتبقي</th><th className="th">حالة الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {seedInvoices.slice(0, 4).map((i) => {
                  const rem = i.total - i.paid;
                  const st = i.status === "paid" ? ["green", "مدفوعة"] : i.status === "partial" ? ["orange", "جزئي"] : ["red", "غير مدفوعة"];
                  return (
                    <tr key={i.id} className="transition hover:bg-accent-soft/40">
                      <td className="td font-bold text-gray-800">{pName(i.patientId)}</td>
                      <td className="td">{fmtMoney(i.total)}</td>
                      <td className={`td font-bold ${rem > 0 ? "text-danger" : "text-gray-400"}`}>{fmtMoney(rem)}</td>
                      <td className="td"><Badge color={st[0]}>{st[1]}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
