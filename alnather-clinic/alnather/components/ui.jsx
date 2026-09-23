"use client";
import React from "react";

export const Card = ({ className = "", children }) => (
  <div className={`card ${className}`}>{children}</div>
);

export const CardHeader = ({ icon, title, action }) => (
  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
    <div className="flex items-center gap-2.5">
      {icon && <span className="text-accent">{icon}</span>}
      <h3 className="text-base font-extrabold text-primary">{title}</h3>
    </div>
    {action}
  </div>
);

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`card relative w-full ${wide ? "max-w-4xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto shadow-pop`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 rounded-t-xl2">
          <h3 className="text-lg font-extrabold text-primary">{title}</h3>
          <button onClick={onClose} className="icon-btn text-gray-400 hover:text-danger">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export const Field = ({ label, required, children }) => (
  <div>
    <label className="field-label">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {children}
  </div>
);

export const Input = ({ icon, ...props }) =>
  icon ? (
    <div className="relative">
      <input {...props} className={`input ${icon ? "pr-10" : ""}`} />
      <i className={`fa-solid ${icon} absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400`} />
    </div>
  ) : (
    <input {...props} className="input" />
  );

export const Select = ({ children, ...props }) => (
  <select {...props} className="input appearance-none cursor-pointer">{children}</select>
);

export const Toggle = ({ on, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!on)}
    className={`relative h-6 w-11 rounded-full transition ${on ? "bg-success" : "bg-gray-300"}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "right-0.5" : "right-5"}`} />
  </button>
);

export const Badge = ({ color, children }) => {
  const map = {
    green:  "bg-emerald-50 text-success",
    red:    "bg-red-50 text-danger",
    orange: "bg-orange-50 text-orange-500",
    blue:   "bg-blue-50 text-info",
    gray:   "bg-gray-100 text-gray-600",
    yellow: "bg-accent-soft text-yellow-700",
  };
  return <span className={`chip ${map[color] || map.gray}`}>{children}</span>;
};

export const EmptyRow = ({ span, text = "لا توجد بيانات لعرضها" }) => (
  <tr><td colSpan={span} className="td py-10 text-center text-gray-400">
    <i className="fa-regular fa-folder-open ml-2 text-2xl align-middle" />{text}
  </td></tr>
);
