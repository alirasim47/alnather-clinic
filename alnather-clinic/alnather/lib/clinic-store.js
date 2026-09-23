import fs from "fs/promises";
import path from "path";
import {
  seedPatients,
  seedExams,
  seedExaminers,
  seedInvoices,
  seedProducts,
  seedFollowups,
  seedUsers,
} from "@/lib/data";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "clinic-db.json");

const defaultDb = {
  patients: [],
  exams: [],
  examiners: [],
  invoices: [],
  products: [],
  followups: [],
  users: [{ id: 1, name: "أبو حسين", username: "admin", role: "admin", active: true }],
  settings: {
    clinicName: "عيادة العلي",
    phone1: "",
    phone2: "",
    footerText: "",
    primaryColor: "#2c1b3d",
    waTemplate: "مرحباً {name} 👋\nنذكركم بموعد المراجعة في عيادة {clinic} بتاريخ {date} الساعة {time}.",
  },
};

function sanitizeDb(parsed) {
  const next = { ...defaultDb, ...(parsed && typeof parsed === "object" ? parsed : {}) };

  const collectionKeys = ["patients", "exams", "examiners", "invoices", "products", "followups"];
  collectionKeys.forEach((key) => {
    next[key] = Array.isArray(next[key]) ? next[key] : [];
  });

  const rawUsers = Array.isArray(next.users) ? next.users.filter(Boolean) : [];
  const admin = rawUsers.find((user) => String(user?.username || "").toLowerCase() === "admin") || defaultDb.users[0];
  next.users = [admin, ...rawUsers.filter((user) => String(user?.username || "").toLowerCase() !== "admin")];
  next.settings = { ...defaultDb.settings, ...(next.settings && typeof next.settings === "object" ? next.settings : {}) };

  return next;
}

async function ensureDbFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
    const raw = await fs.readFile(DATA_FILE, "utf8");
    if (!raw.trim()) {
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultDb, null, 2));
    }
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultDb, null, 2));
  }
}

export async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    const next = sanitizeDb(parsed);
    if (JSON.stringify(next) !== JSON.stringify(parsed)) {
      await writeDb(next);
    }
    return next;
  } catch {
    return { ...defaultDb };
  }
}

export async function writeDb(nextDb) {
  await ensureDbFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(nextDb, null, 2));
  return nextDb;
}

export async function readCollection(name) {
  const db = await readDb();
  return db[name] || [];
}

export async function writeCollection(name, value) {
  const db = await readDb();
  const nextDb = { ...db, [name]: value };
  await writeDb(nextDb);
  return value;
}

export async function upsertCollectionItem(name, item) {
  const list = await readCollection(name);
  const idx = list.findIndex((entry) => String(entry.id) === String(item.id));
  const next = [...list];
  if (idx >= 0) next[idx] = item;
  else next.push(item);
  await writeCollection(name, next);
  return item;
}

export async function deleteCollectionItem(name, id) {
  const list = await readCollection(name);
  const next = list.filter((entry) => String(entry.id) !== String(id));
  await writeCollection(name, next);
  return next;
}
