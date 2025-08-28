export type HistoryItem = { id: string; name: string; text: string; createdAt?: number };

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ocr-history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushHistory(item: HistoryItem) {
  if (typeof window === "undefined") return;
  const list = getHistory();
  list.unshift({ ...item, createdAt: Date.now() });
  localStorage.setItem("ocr-history", JSON.stringify(list.slice(0, 200)));
}
