"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Dashboard from "@/screens/Dashboard";
import Patients from "@/screens/Patients";
import Followups from "@/screens/Followups";
import Examiners from "@/screens/Examiners";
import Invoices from "@/screens/Invoices";
import Products from "@/screens/Products";
import Reports from "@/screens/Reports";
import Users from "@/screens/Users";
import Settings from "@/screens/Settings";

const TITLES = {
  dashboard: "لوحة التحكم",
  patients: "إدارة المرضى",
  followups: "تنبيهات المراجعات",
  examiners: "الفاحصون والكادر",
  invoices: "الفواتير والمبيعات",
  products: "المنتجات والمخزون",
  reports: "التقارير",
  users: "المستخدمون والصلاحيات",
  settings: "الإعدادات",
};

export default function Shell({ onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (next) => {
    setPage(next);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        page={page}
        setPage={go}
        onLogout={onLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar title={TITLES[page]} onMenu={() => setSidebarOpen(true)} />
        <main className="relative z-10 flex-1 p-4 sm:p-6">
          {page === "dashboard" && <Dashboard go={go} />}
          {page === "patients" && <Patients />}
          {page === "followups" && <Followups />}
          {page === "examiners" && <Examiners />}
          {page === "invoices" && <Invoices />}
          {page === "products" && <Products />}
          {page === "reports" && <Reports />}
          {page === "users" && <Users />}
          {page === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}
