export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export interface OrderPayload {
  customer: { name: string; phone: string; address: string; note?: string };
  items: OrderItem[];
  total: number;
}

/**
 * Sends the order to a relay Web App (e.g. a Google Apps Script) that holds
 * the Telegram bot token server-side. The bot token is never in this bundle,
 * only the public relay URL is. This keeps the site fully static - no Node
 * server to deploy - while keeping the token secret.
 *
 * Uses a CORS-safelisted text/plain body + no-cors so the browser allows the
 * cross-origin POST to script.google.com without a preflight. The response is
 * opaque, so a resolved fetch is treated as success; a network failure throws.
 */
export async function sendOrder(payload: OrderPayload): Promise<{ ok: true }> {
  const url = import.meta.env.VITE_ORDER_WEBHOOK_URL as string | undefined;
  if (!url) {
    throw new Error("Chưa cấu hình VITE_ORDER_WEBHOOK_URL trong .env");
  }
  if (payload.items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      ...payload,
      secret: (import.meta.env.VITE_ORDER_SECRET as string | undefined) ?? "",
    }),
  });

  return { ok: true };
}
