import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { DEFAULT_BASELINE, DEFAULT_CLINIC_SETTINGS, DEFAULT_ADMIN_USER, DEFAULT_EXAMINER } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "clinic-data.json");
const COLLECTIONS = ["patients", "exams", "examiners", "products", "invoices", "followups", "users", "settings"];
let queue = Promise.resolve();

function baseline() {
  return {
    patients: [...DEFAULT_BASELINE.patients],
    exams: [...DEFAULT_BASELINE.exams],
    examiners: [{ ...DEFAULT_EXAMINER }],
    products: [...DEFAULT_BASELINE.products],
    invoices: [...DEFAULT_BASELINE.invoices],
    followups: [...DEFAULT_BASELINE.followups],
    users: [{ ...DEFAULT_ADMIN_USER }],
    settings: { ...DEFAULT_CLINIC_SETTINGS },
  };
}

async function readDb() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return { ...baseline(), ...parsed, settings: { ...DEFAULT_CLINIC_SETTINGS, ...(parsed.settings || {}) } };
  } catch {
    const db = baseline();
    await writeDb(db);
    return db;
  }
}

async function writeDb(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temp = `${DATA_FILE}.tmp`;
  await fs.writeFile(temp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(temp, DATA_FILE);
}

function withLock(task) {
  const next = queue.then(task, task);
  queue = next.then(() => undefined, () => undefined);
  return next;
}

function validCollection(name) {
  return COLLECTIONS.includes(name);
}

export async function GET(request) {
  const collection = new URL(request.url).searchParams.get("collection");
  if (!validCollection(collection)) return NextResponse.json({ error: "مجموعة غير صالحة" }, { status: 400 });
  const db = await readDb();
  return NextResponse.json({ collection, data: db[collection] });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { collection, action = "saveSingleItem", value, id } = body || {};
    if (!validCollection(collection)) return NextResponse.json({ error: "مجموعة غير صالحة" }, { status: 400 });

    const result = await withLock(async () => {
      const db = await readDb();
      if (action === "saveCollection") {
        db[collection] = collection === "settings"
          ? { ...DEFAULT_CLINIC_SETTINGS, ...(value && typeof value === "object" ? value : {}) }
          : Array.isArray(value) ? value : [];
      } else if (action === "deleteSingleItem") {
        db[collection] = Array.isArray(db[collection])
          ? db[collection].filter((item) => String(item?.id) !== String(id))
          : [];
      } else {
        if (collection === "settings") {
          db.settings = { ...DEFAULT_CLINIC_SETTINGS, ...(value && typeof value === "object" ? value : {}) };
        } else {
          const rows = Array.isArray(db[collection]) ? db[collection] : [];
          const index = rows.findIndex((item) => String(item?.id) === String(value?.id));
          if (index >= 0) rows[index] = value;
          else rows.push(value);
          db[collection] = rows;
        }
      }
      await writeDb(db);
      return db[collection];
    });

    return NextResponse.json({ collection, data: result });
  } catch (error) {
    return NextResponse.json({ error: error.message || "تعذر حفظ البيانات" }, { status: 500 });
  }
}
