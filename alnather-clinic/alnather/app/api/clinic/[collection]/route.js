import { readCollection, writeCollection, upsertCollectionItem, deleteCollectionItem } from "@/lib/clinic-store";

export async function GET(request, { params }) {
  const { collection } = params;
  const rows = await readCollection(collection);
  return Response.json({ ok: true, data: rows });
}

export async function POST(request, { params }) {
  const { collection } = params;
  try {
    const body = await request.json();
    const listCollections = new Set([
      "patients",
      "exams",
      "examiners",
      "products",
      "invoices",
      "followups",
      "users",
    ]);

    if (Array.isArray(body)) {
      await writeCollection(collection, body);
      return Response.json({ ok: true, data: body });
    }

    if (body && typeof body === "object") {
      if (body.id !== undefined) {
        const item = await upsertCollectionItem(collection, body);
        return Response.json({ ok: true, data: item });
      }

      if (collection === "settings") {
        const db = await readCollection("settings");
        const next = body && typeof body === "object" ? body : db || {};
        await writeCollection("settings", next);
        return Response.json({ ok: true, data: next });
      }

      if (listCollections.has(collection)) {
        const current = await readCollection(collection);
        return Response.json({ ok: true, data: current });
      }

      const current = await readCollection(collection);
      return Response.json({ ok: true, data: current });
    }

    return Response.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  } catch {
    return Response.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { collection } = params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ ok: false, message: "Missing id" }, { status: 400 });
  }

  const next = await deleteCollectionItem(collection, id);
  return Response.json({ ok: true, data: next });
}
