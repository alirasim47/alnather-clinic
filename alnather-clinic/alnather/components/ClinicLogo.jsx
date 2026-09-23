import React from "react";

export default function ClinicLogo({ compact = false, className = "" }) {
  return (
    <div className={`flex items-center ${compact ? "gap-2" : "flex-col gap-2"} ${className}`}>
      <img
        src="/clinic-logo.png"
        alt="شعار عيادة العلي"
        className={compact ? "h-12 w-12 object-contain" : "h-32 w-auto object-contain"}
      />
    </div>
  );
}
