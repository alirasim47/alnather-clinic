"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, Field, Input } from "@/components/ui";
import { resetStorage } from "@/lib/storage";

const TABS = [
  { id: "clinic", label: "إعدادات العيادة", icon: "fa-hospital" },
  { id: "wa", label: "قوالب واتساب", icon: "fa-brands fa-whatsapp" },
  { id: "backup", label: "النسخ الاحتياطي", icon: "fa-database" },
  { id: "updates", label: "التحديثات", icon: "fa-cloud-arrow-down" },
];

const DEFAULT_SETTINGS = {
  clinicName: "عيادة العلي",
  phone1: "0112345678",
  phone2: "",
  footerText: "شكراً لزيارتكم — نسعد بخدمتكم",
  primaryColor: "#2c1b3d",
  waTemplate: "مرحباً {name} 👋\nنذكركم بموعد المراجعة في عيادة {clinic} بتاريخ {date} الساعة {time}.",
};

export default function Settings() {
  const [tab, setTab] = useState("clinic");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [notice, setNotice] = useState("");
  const uploadRef = useRef(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("clinic-settings-v1") : null;
    if (!saved) return;
    try {
      setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      // ignore invalid backup state and keep defaults
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clinic-settings-v1", JSON.stringify(settings));
    }
  }, [settings]);

  const update = (field) => (e) => setSettings((prev) => ({ ...prev, [field]: e.target.value }));
  const persistSettings = async (nextSettings = settings) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("clinic-settings-v1", JSON.stringify(nextSettings));
    try {
      const res = await fetch("/api/clinic/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSettings),
      });
      if (!res.ok) console.warn("settings api not persisted");
    } catch {
      console.warn("settings api unavailable");
    }
  };
  const reset = () => {
    const next = DEFAULT_SETTINGS;
    setSettings(next);
    persistSettings(next);
    setNotice("تمت استعادة الإعدادات الافتراضية");
  };

  const saveClinic = async () => {
    await persistSettings(settings);
    setNotice("تم حفظ إعدادات العيادة بنجاح ✅");
  };

  const saveTemplate = async () => {
    await persistSettings(settings);
    setNotice("تم حفظ قالب واتساب بنجاح ✅");
  };

  const backupAction = () => {
    const data = JSON.stringify({ savedAt: new Date().toISOString(), settings }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clinic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("تم تنزيل نسخة احتياطية بنجاح ✅");
  };

  const handleBackupUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.settings) {
          setSettings((prev) => ({ ...prev, ...parsed.settings }));
          setNotice("تم استيراد نسخة الاحتياطية بنجاح ✅");
        } else {
          setNotice("ملف النسخة الاحتياطية غير صحيح");
        }
      } catch {
        setNotice("ملف النسخة الاحتياطية غير صالح");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const checkUpdates = () => {
    setNotice("النظام حديث ومحدث — آخر فحص: اليوم");
  };

  const resetData = () => {
    const ok = window.confirm("هل تريد إعادة تعيين البيانات التجريبية والعودة إلى القيم الأساسية؟");
    if (!ok) return;
    resetStorage();
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      {notice && (
        <div className="rounded-xl2 border border-success/20 bg-emerald-50 px-4 py-3 text-sm font-bold text-success">
          {notice}
        </div>
      )}

      <div className="flex gap-2 rounded-xl2 bg-white p-2 shadow-card">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition
              ${tab === t.id ? "bg-primary text-accent" : "text-gray-500 hover:bg-gray-100"}`}>
            <i className={`fa-solid ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "clinic" && (
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Field label="اسم العيادة"><Input value={settings.clinicName} onChange={update("clinicName")} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="رقم الهاتف 1"><Input dir="ltr" value={settings.phone1} onChange={update("phone1")} /></Field>
                <Field label="رقم الهاتف 2"><Input dir="ltr" value={settings.phone2} placeholder="اختياري" onChange={update("phone2")} /></Field>
              </div>
              <Field label="نص تذييل الفواتير"><textarea className="input min-h-16" value={settings.footerText} onChange={update("footerText")} /></Field>
              <Field label="اللون الأساسي للنظام">
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primaryColor} onChange={update("primaryColor")} className="h-11 w-16 cursor-pointer rounded-lg border border-gray-300" />
                  <Input dir="ltr" value={settings.primaryColor} onChange={update("primaryColor")} className="w-32" />
                  <span className="h-8 w-8 rounded-lg" style={{ background: settings.primaryColor }} />
                </div>
              </Field>
            </div>
            <div className="space-y-4">
              <Field label="شعار العيادة">
                <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-accent hover:text-accent">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl" /><span className="text-xs font-bold">اضغط لرفع الشعار</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </Field>
              <div className="rounded-xl2 border border-gray-100 p-4 text-center">
                <div className="mx-auto grid h-32 w-32 grid-cols-8 gap-0.5 rounded-lg border border-gray-200 p-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <span key={i} className={`rounded-[1px] ${i % 3 === 0 ? "bg-primary" : "bg-white"}`} />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">رمز QR للعيادة (توليد تلقائي)</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={reset} className="btn-outline-danger">إلغاء</button>
            <button type="button" onClick={saveClinic} className="btn-accent"><i className="fa-solid fa-floppy-disk" /> حفظ الإعدادات</button>
            <button type="button" onClick={resetData} className="btn-outline-danger">إعادة تعيين البيانات</button>
          </div>
        </Card>
      )}

      {tab === "wa" && (
        <Card className="p-6">
          <Field label="قالب تذكير المراجعة — المتغيرات: {name} {date} {time} {clinic}">
            <textarea className="input min-h-32" value={settings.waTemplate} onChange={update("waTemplate")} />
          </Field>
          <div className="mt-4 flex justify-end"><button type="button" onClick={saveTemplate} className="btn-accent"><i className="fa-solid fa-floppy-disk" /> حفظ القالب</button></div>
        </Card>
      )}

      {tab === "backup" && (
        <Card className="p-6">
          <div className="flex items-center justify-between rounded-xl2 border border-gray-100 p-4">
            <div><div className="font-extrabold text-primary">آخر نسخة احتياطية</div><div className="text-sm text-gray-500">اليوم — 03:00 صباحاً (تلقائي)</div></div>
            <div className="flex gap-3">
              <button type="button" onClick={backupAction} className="btn-blue"><i className="fa-solid fa-download" /> تنزيل نسخة</button>
              <button type="button" onClick={() => uploadRef.current?.click()} className="btn-accent"><i className="fa-solid fa-upload" /> رفع نسخة</button>
              <input ref={uploadRef} type="file" accept="application/json" className="hidden" onChange={handleBackupUpload} />
            </div>
          </div>
        </Card>
      )}

      {tab === "updates" && (
        <Card className="p-6 text-center">
          <i className="fa-solid fa-circle-check mb-3 text-4xl text-success" />
          <div className="text-lg font-extrabold text-primary">النظام محدّث — الإصدار 1.0.0</div>
          <p className="mt-1 text-sm text-gray-500">آخر تحقق من التحديثات: اليوم</p>
          <button type="button" onClick={checkUpdates} className="btn-accent mt-4"><i className="fa-solid fa-rotate" /> التحقق من التحديثات</button>
        </Card>
      )}
    </div>
  );
}
