"use client";

import React from "react";
import ClinicLogo from "./ClinicLogo";

const NAV = [
  { id: "dashboard", label: "الرئيسية", icon: "fa-house" },
  { id: "patients", label: "المرضى", icon: "fa-users" },
  { id: "followups", label: "تنبيهات المراجعات", icon: "fa-bell" },
  { id: "examiners", label: "الفاحصون", icon: "fa-user-doctor" },
  { id: "invoices", label: "الفواتير", icon: "fa-file-invoice-dollar" },
  { id: "products", label: "المنتجات", icon: "fa-boxes-stacked" },
  { id: "reports", label: "التقارير", icon: "fa-chart-column" },
  { id: "users", label: "المستخدمون", icon: "fa-user-shield" },
  { id: "settings", label: "الإعدادات", icon: "fa-gear" },
];

export default function Sidebar({ page, setPage, onLogout, open, onClose }) {
  return (
    <>
      {/* الخلفية المعتمة - تظهر فقط على الموبايل عند فتح القائمة */}
      {open && (
        <div
          className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 
        القائمة الجانبية
        - على الموبايل: fixed + translate (تنزلق فوق المحتوى)
        - على اللابتوب: static (تعود للتدفق الطبيعي، المحتوى بجانبها)
        - lg:z-auto يلغي z-index العالي حتى لا تغطي النوافذ
      */}
      <aside
        aria-label="القائمة الرئيسية"
        className={`fixed inset-y-0 right-0 z-[60] flex h-[100dvh] w-[min(86vw,18rem)] shrink-0 flex-col bg-[#2c1b3d] text-white shadow-2xl transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
          lg:static lg:z-auto lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <ClinicLogo compact={false} className="justify-start text-white" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition
                  ${active
                    ? "bg-[#eab308] text-[#2c1b3d] shadow-lg"
                    : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <i className={`fa-solid ${item.icon} w-6 text-center text-lg`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-white/70 transition hover:bg-red-500/20 hover:text-red-400"
          >
            <i className="fa-solid fa-right-from-bracket w-6 text-center text-lg" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
