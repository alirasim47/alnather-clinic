/**
 * طبقة البيانات الموحدة.
 * تستخدم API المحلية عندما يعمل التطبيق على جهاز مضيف، وتحتفظ بنسخة localStorage
 * كخطة بديلة عند العمل دون خادم أو أثناء انقطاع الشبكة.
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
const isBrowser = () => typeof window !== "undefined";

async function localApi(action, collection, value, id) {
  const response = await fetch(`/api/data?collection=${encodeURIComponent(collection)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, collection, value, id }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  const payload = await response.json();
  return payload.data;
}

function notify(collection) {
  if (isBrowser()) window.dispatchEvent(new CustomEvent("clinic-data-updated", { detail: { collection } }));
}

export async function fetchCollection(name, fallback) {
  const fb = getFallback(name, fallback);
  try {
    if (isBrowser()) {
      const response = await fetch(`/api/data?collection=${encodeURIComponent(name)}`, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        const data = name === "settings"
          ? { ...DEFAULT_CLINIC_SETTINGS, ...(payload.data || {}) }
          : Array.isArray(payload.data) ? payload.data : fb;
        writeStorage(getKey(name), data);
        return data;
      }
    }
  } catch {}

  const data = readStorage(getKey(name), fb);
  return name === "settings"
    ? data && typeof data === "object" ? { ...DEFAULT_CLINIC_SETTINGS, ...data } : fb
    : Array.isArray(data) ? data : fb;
}

export async function saveCollection(name, rows) {
  const safe = name === "settings"
    ? { ...DEFAULT_CLINIC_SETTINGS, ...(rows && typeof rows === "object" ? rows : {}) }
    : Array.isArray(rows) ? rows : [];
  try {
    const saved = await localApi("saveCollection", name, safe);
    writeStorage(getKey(name), saved);
    notify(name);
    return saved;
  } catch {
    writeStorage(getKey(name), safe);
    notify(name);
    return safe;
  }
}

export async function saveSingleItem(name, item) {
  try {
    const saved = await localApi("saveSingleItem", name, item);
    writeStorage(getKey(name), saved);
    notify(name);
    if (name === "settings") return saved;
    return Array.isArray(saved) ? saved.find((row) => String(row?.id) === String(item?.id)) || item : item;
  } catch {
    if (name === "settings") {
      const current = readStorage(getKey(name), DEFAULT_CLINIC_SETTINGS);
      const merged = { ...current, ...(item && typeof item === "object" ? item : {}) };
      writeStorage(getKey(name), merged);
      notify(name);
      return merged;
    }
    const list = await fetchCollection(name, []);
    const next = Array.isArray(list) ? [...list] : [];
    const index = next.findIndex((row) => String(row?.id) === String(item?.id));
    if (index >= 0) next[index] = item;
    else next.push(item);
    writeStorage(getKey(name), next);
    notify(name);
    return item;
  }
}

export async function deleteSingleItem(name, id) {
  try {
    const next = await localApi("deleteSingleItem", name, null, id);
    writeStorage(getKey(name), next);
    notify(name);
    return next;
  } catch {
    const list = await fetchCollection(name, []);
    const next = Array.isArray(list) ? list.filter((row) => String(row?.id) !== String(id)) : [];
    writeStorage(getKey(name), next);
    notify(name);
    return next;
  }
}
