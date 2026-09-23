/**
 * طبقة التخزين الموحدة — تستخدم localStorage (storage.js) لجميع العمليات
 * كل الشاشات الآن تقرأ وتكتب من نفس المكان
 */
import {
  readStorage,
  writeStorage,
  STORAGE_KEYS,
  DEFAULT_BASELINE,
  DEFAULT_CLINIC_SETTINGS,
  DEFAULT_ADMIN_USER,
  DEFAULT_EXAMINER,
} from "./storage";

const COLLECTION_KEYS = [
  "patients", "exams", "examiners", "products",
  "invoices", "followups", "users", "settings",
];

const FALLBACKS = {
  patients: DEFAULT_BASELINE.patients,
  exams: DEFAULT_BASELINE.exams,
  examiners: [DEFAULT_EXAMINER],
  products: DEFAULT_BASELINE.products,
  invoices: DEFAULT_BASELINE.invoices,
  followups: DEFAULT_BASELINE.followups,
  users: [DEFAULT_ADMIN_USER],
  settings: DEFAULT_CLINIC_SETTINGS,
};

const getKey = (name) => STORAGE_KEYS[name] || `clinic-${name}-v1`;
const getFallback = (name, fb) => fb ?? FALLBACKS[name] ?? [];

/**
 * قراءة قائمة كاملة
 */
export async function fetchCollection(name, fallback) {
  try {
    const fb = getFallback(name, fallback);
    const data = readStorage(getKey(name), fb);
    if (name === "settings") {
      return data && typeof data === "object" ? { ...DEFAULT_CLINIC_SETTINGS, ...data } : fb;
    }
    return Array.isArray(data) ? data : fb;
  } catch {
    return getFallback(name, fallback);
  }
}

/**
 * استبدال القائمة كاملة
 */
export async function saveCollection(name, rows) {
  try {
    if (name === "settings") {
      const merged = { ...DEFAULT_CLINIC_SETTINGS, ...(rows && typeof rows === "object" ? rows : {}) };
      writeStorage(getKey(name), merged);
      return merged;
    }
    const safe = Array.isArray(rows) ? rows : [];
    writeStorage(getKey(name), safe);
    // إطلاق حدث عشان الشاشات الأخرى تحدث نفسها
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinic-data-updated", { detail: { collection: name } }));
    }
    return safe;
  } catch {
    return Array.isArray(rows) ? rows : [];
  }
}

/**
 * حفظ عنصر واحد (إضافة أو تحديث)
 */
export async function saveSingleItem(name, item) {
  try {
    if (name === "settings") {
      const current = readStorage(getKey(name), DEFAULT_CLINIC_SETTINGS);
      const merged = { ...current, ...(item && typeof item === "object" ? item : {}) };
      writeStorage(getKey(name), merged);
      return merged;
    }
    const list = await fetchCollection(name, []);
    const next = Array.isArray(list) ? [...list] : [];
    const idx = next.findIndex((x) => String(x?.id) === String(item?.id));
    if (idx >= 0) next[idx] = item;
    else next.push(item);
    writeStorage(getKey(name), next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinic-data-updated", { detail: { collection: name } }));
    }
    return item;
  } catch {
    return item;
  }
}

/**
 * حذف عنصر واحد
 */
export async function deleteSingleItem(name, id) {
  try {
    const list = await fetchCollection(name, []);
    const next = Array.isArray(list) ? list.filter((x) => String(x?.id) !== String(id)) : [];
    writeStorage(getKey(name), next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinic-data-updated", { detail: { collection: name } }));
    }
    return next;
  } catch {
    return [];
  }
}
