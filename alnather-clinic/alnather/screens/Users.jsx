"use client";
import React, { useState, useEffect } from "react";
import { Card, Toggle, Badge, EmptyRow, Modal, Field, Input, Select } from "@/components/ui";
import { seedUsers, roleAr } from "@/lib/data";
import { fetchCollection, saveSingleItem, deleteSingleItem } from "@/lib/api";

const EMPTY_FORM = { name: "", username: "", role: "receptionist", active: true };

export default function Users() {
  const [list, setList] = useState(seedUsers);

  useEffect(() => {
    let ignore = false;
    fetchCollection("users", seedUsers).then((rows) => {
      if (!ignore) setList(rows);
    });
    return () => { ignore = true; };
  }, []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (user) => { setEditing(user); setForm({ name: user.name, username: user.username, role: user.role, active: user.active }); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const cleaned = { ...form, name: form.name.trim(), username: form.username.trim() };
    if (!cleaned.name || !cleaned.username) return;

    if (editing) {
      const payload = { ...editing, ...cleaned };
      const result = await saveSingleItem("users", payload);
      if (result) setList((current) => current.map((u) => u.id === editing.id ? payload : u));
    } else {
      const payload = { id: Date.now(), ...cleaned };
      const result = await saveSingleItem("users", payload);
      if (result) setList((current) => [...current, payload]);
    }
    setOpen(false); setEditing(null); setForm(EMPTY_FORM);
  };

  const roleBadge = (r) => r === "admin" ? <Badge color="yellow">{roleAr[r]}</Badge>
    : r === "accountant" ? <Badge color="blue">{roleAr[r]}</Badge> : <Badge color="gray">{roleAr[r]}</Badge>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-primary">المستخدمون والصلاحيات</h2>
        <button onClick={openAdd} className="btn-accent"><i className="fa-solid fa-plus" /> إضافة مستخدم</button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="th">الاسم الكامل</th><th className="th">اسم المستخدم</th><th className="th">الصلاحية</th><th className="th">الحالة</th><th className="th">إجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length === 0 && <EmptyRow span={5} />}
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-accent-soft/40">
                  <td className="td font-bold text-gray-800">{u.name}</td>
                  <td className="td text-gray-500" dir="ltr">{u.username}</td>
                  <td className="td">{roleBadge(u.role)}</td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <Toggle on={u.active} onChange={(v) => setList((current) => current.map((i) => i.id === u.id ? { ...i, active: v } : i))} />
                      <span className={`text-xs font-bold ${u.active ? "text-success" : "text-gray-400"}`}>{u.active ? "نشط" : "موقوف"}</span>
                    </div>
                  </td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="icon-btn text-info hover:bg-info hover:text-white"><i className="fa-solid fa-pen" /></button>
                      <button onClick={async () => {
                        const result = await deleteSingleItem("users", u.id);
                        if (result !== null) setList((current) => current.filter((i) => i.id !== u.id));
                      }} className="icon-btn text-danger hover:bg-danger hover:text-white"><i className="fa-solid fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal open onClose={() => { setOpen(false); setEditing(null); setForm(EMPTY_FORM); }} title={editing ? "تعديل مستخدم" : "إضافة مستخدم جديد"}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="الاسم الكامل" required>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="اسم المستخدم" required>
              <Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Field>
            <Field label="الصلاحية">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">مدير النظام</option>
                <option value="accountant">محاسب</option>
                <option value="receptionist">موظف استقبال</option>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
              <span className="font-bold text-gray-700">الحالة</span>
              <Toggle on={form.active} onChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button type="button" onClick={() => { setOpen(false); setEditing(null); setForm(EMPTY_FORM); }} className="btn-outline-danger">إلغاء</button>
              <button type="submit" className="btn-accent"><i className="fa-solid fa-floppy-disk" /> {editing ? "حفظ التعديلات" : "حفظ"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
