"use client";

import React, { useState, useEffect } from "react";
import { longDate } from "@/lib/utils";

const STORAGE_KEY = "clinic-notifications-v1";
const initialNotifications = [];

export default function Topbar({ title, onMenu }) {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window === "undefined") return initialNotifications;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialNotifications;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (notifications.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("clinic-notifications-updated"));
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("clinic-notifications-updated"));
  }, [notifications]);

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (id) => setNotifications((prev) => prev.filter((item) => item.id !== id));

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3.5 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 lg:hidden"
          aria-label="فتح القائمة"
        >
          <i className="fa-solid fa-bars text-lg" />
        </button>
        <h1 className="truncate text-base font-extrabold text-primary sm:text-lg">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <span className="hidden items-center gap-2 text-sm text-gray-500 md:flex">
          <i className="fa-regular fa-calendar-days text-accent" />
          {longDate()}
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
            aria-label="التنبيهات"
          >
            <i className="fa-regular fa-bell text-lg" />
            {notifications.length > 0 && (
              <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[10px] font-black text-white">
                {notifications.length}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute left-0 top-12 w-[92vw] max-w-[360px] rounded-[20px] border border-gray-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <i className="fa-solid fa-bell text-sm" />
                  </span>
                  <span className="text-sm font-black text-primary">التنبيهات</span>
                </div>
                {notifications.length > 0 && (
                  <button type="button" onClick={clearNotifications} className="text-[11px] font-bold text-danger hover:underline">
                    حذف الكل
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <i className="fa-regular fa-bell-slash text-lg" />
                  </span>
                  <div className="text-sm font-bold text-gray-400">لا توجد تنبيهات</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-2.5 text-sm text-gray-700">
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">{item.text}</div>
                        <div className="mt-1 text-[10px] text-gray-400">{item.time}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNotification(item.id)}
                        className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-danger"
                        aria-label="حذف التنبيه"
                      >
                        <i className="fa-solid fa-xmark text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <span className="hidden h-8 w-px bg-gray-200 sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden text-left sm:block">
            <div className="text-sm font-extrabold leading-none text-gray-800">أبو حسين</div>
            <div className="mt-1 text-[11px] font-bold text-accent">مدير العيادة</div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-700 font-black text-accent ring-2 ring-accent/80">
            أح
          </div>
        </div>
      </div>
    </header>
  );
}
