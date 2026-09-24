"use client";
import React from "react";

export const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>{children}</div>
);

export const CardHeader = ({ icon, title, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
    <div className="flex items-center gap-2.5">
      {icon && <span className="text-[#eab308]">{icon}</span>}
      <h3 className="text-base font-extrabold text-[#2c1b3d]">{title}</h3>
    </div>
    {action}
  </div>
);

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;

  return (
    // z-[9999] يضمن ظهور النافذة فوق كل شيء (بما فيه القائمة الجانبية)
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-3 sm:items-center sm:p-4" dir="rtl">
      <div className="absolute inset-0 bg-[#2c1b3d]/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 flex w-full max-h-[95vh] flex-col rounded-2xl bg-white shadow-2xl
          ${wide ? "sm:max-w-4xl" : "sm:max-w-lg"}`}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 rounded-t-2xl sm:px-6 sm:py-4">
          <h3 className="truncate pr-2 text-base font-extrabold text-[#2c1b3d] sm:text-lg">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500">
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Field = ({ label, required, children }) => (
  <div className="min-w-0">
    <label className="mb-1.5 block text-sm font-bold text-gray-700">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export const Input = ({ icon, className = "", ...props }) =>
  icon ? (
    <div className="relative">
      <input {...props} className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition focus:border-[#eab308] focus:outline-none focus:ring-2 focus:ring-[#eab308]/30 min-h-[44px] ${icon ? "pr-10" : ""} ${className}`} />
      <i className={`fa-solid ${icon} absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400`} />
    </div>
  ) : (
    <input {...props} className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition focus:border-[#eab308] focus:outline-none focus:ring-2 focus:ring-[#eab308]/30 min-h-[44px] ${className}`} />
  );

export const Select = ({ children, className = "", ...props }) => (
  <select {...props} className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition focus:border-[#eab308] focus:outline-none focus:ring-2 focus:ring-[#eab308]/30 min-h-[44px] appearance-none cursor-pointer ${className}`}>
    {children}
  </select>
);

export const Badge = ({ color, children }) => {
  const map = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    gray: "bg-gray-100 text-gray-600",
    yellow: "bg-yellow-50 text-yellow-700",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${map[color] || map.gray}`}>{children}</span>;
};

export const EmptyRow = ({ span, text = "لا توجد بيانات لعرضها" }) => (
  <tr>
    <td colSpan={span} className="py-10 text-center text-sm text-gray-400">
      <i className="fa-regular fa-folder-open ml-2 text-2xl align-middle" />{text}
    </td>
  </tr>
);
