const API_BASE = "/api/clinic";

export async function fetchCollection(name, fallback = []) {
  try {
    const res = await fetch(`${API_BASE}/${name}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    const json = await res.json();
    return json?.data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function saveCollection(name, rows) {
  try {
    const res = await fetch(`${API_BASE}/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? rows;
  } catch {
    return null;
  }
}

export async function saveSingleItem(name, item) {
  try {
    const res = await fetch(`${API_BASE}/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? item;
  } catch {
    return null;
  }
}

export async function deleteSingleItem(name, id) {
  try {
    const res = await fetch(`${API_BASE}/${name}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return null;
  }
}
