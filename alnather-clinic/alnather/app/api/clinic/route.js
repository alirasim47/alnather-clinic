import { readDb, writeDb } from "@/lib/clinic-store";

export async function GET() {
  const db = await readDb();
  return Response.json({ ok: true, data: db });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await readDb();
    const nextDb = { ...db, ...body };
    await writeDb(nextDb);
    return Response.json({ ok: true, data: nextDb });
  } catch (error) {
    return Response.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }
}
