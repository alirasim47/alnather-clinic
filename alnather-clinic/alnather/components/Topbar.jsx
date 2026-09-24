"use client";

import React from "react";
import { longDate } from "@/lib/utils";

export default function Topbar({ title, onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {/* زر القائمة: يظهر فقط في الشاشات الصغيرة (أقل من lg) */}
        <button
          type="button"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 lg:hidden"
          aria-label="فتح القائمة"
        >
          <i className="fa-solid fa-bars text-xl" />
        </button>
        
        <h1 className="truncate text-lg font-extrabold text-[#2c1b3d] sm:text-xl">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden items-center gap-2 text-sm font-medium text-gray-500 md:flex" dir="ltr">
          <i className="fa-regular fa-calendar-days text-[#eab308]" />
          {/* dir="auto" تحل مشكلة قلب أحرف الشهر واليوم */}
          <span dir="auto">{longDate()}</span> 
        </span>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-extrabold leading-none text-gray-800">أبو حسين</div>
            <div className="mt-1 text-[11px] font-bold text-[#eab308]">مدير العيادة</div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2c1b3d] to-purple-700 font-black text-[#eab308] ring-2 ring-[#eab308]/50">
            أح
          </div>
        </div>
      </div>
    </header>
  );
}
