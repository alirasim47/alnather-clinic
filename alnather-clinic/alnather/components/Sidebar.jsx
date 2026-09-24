"use client";

import React, { useEffect, useState } from "react";
import ClinicLogo from "./ClinicLogo";

const NAV = [
  { id: "dashboard", label: "الرئيسية", icon: "fa-house" },
  { id: "patients", label: "المرضى", icon: "fa-users" },
  { id: "followups", label: "تنبيهات المراجعات", icon: "fa-bell" },
  { id: "examiners", label: "الفاحصون", icon: "fa-user-doctor" },
  { id: "invoices", label: "الفواتير والمبيعات", icon: "fa-file-invoice-dollar" },
  { id: "products", label: "المنتجات", icon: "fa-boxes-stacked" },
  { id: "reports", label: "التقارير", icon: "fa-chart-column" },
  { id: "users", label: "المستخدمون", icon: "fa-user-shield" },
  { id: "settings", label: "الإعدادات", icon: "fa-gear" },
];

export default function Sidebar({ page, setPage, onLogout, open, onClose }) {
  const [followupCount, setFollowupCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateCount = () => {
      try {
        const raw = window.localStorage.getItem("clinic-notifications-v1");
        const items = raw ? JSON.parse(raw) : [];
        setFollowupCount(Array.isArray(items) ? items.length : 0);
      } catch {
        setFollowupCount(0);
      }
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("clinic-notifications-updated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("clinic-notifications-updated", updateCount);
    };
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-primary text-white transition-transform duration-200
          ${open ? "translate-x-0" : "translate-x-full"}
          lg:sticky lg:top-0 lg:z-40 lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <ClinicLogo compact={false} className="justify-start text-white" />
          <button
            type="button"
            onClick={onClose}
            className="icon-btn text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <i className="fa-solid fa-xmark" />
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
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition
                  ${active
                    ? "bg-accent text-primary shadow-md"
                    : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`} />
                {item.label}
                {item.id === "followups" && followupCount > 0 && (
                  <span className="mr-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black text-white">
                    {followupCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-danger hover:text-white"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
