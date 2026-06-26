import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export interface CartLine {
  id: number;
  name: string;
  price: number;
  unit: string;
  img: string;
  qty: number;
}

type AddInput = Omit<CartLine, "qty">;

interface Flight {
  id: number;
  img: string;
  w: number;
  h: number;
  sx: number; sy: number; // start
  mx: number; my: number; // arc midpoint
  ex: number; ey: number; // end (cart icon)
}

interface CartValue {
  items: CartLine[];
  add: (line: AddInput) => void;
  inc: (id: number) => void;
  dec: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  /** Register the cart icon element so flights know where to land. */
  setCartTarget: (el: HTMLElement | null) => void;
  /** Spawn a "product flies into cart" animation from a source rect. */
  flyToCart: (origin: DOMRect, img: string) => void;
}

const CartContext = createContext<CartValue | null>(null);

const STORAGE_KEY = "cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);

  const cartTargetRef = useRef<HTMLElement | null>(null);
  const flightId = useRef(0);

  // Restore once on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const value = useMemo<CartValue>(() => {
    const add = (line: AddInput) =>
      setItems((prev) => {
        const found = prev.find((p) => p.id === line.id);
        if (found) return prev.map((p) => (p.id === line.id ? { ...p, qty: p.qty + 1 } : p));
        return [...prev, { ...line, qty: 1 }];
      });
    const inc = (id: number) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
    const dec = (id: number) =>
      setItems((prev) =>
        prev.flatMap((p) => (p.id === id ? (p.qty > 1 ? [{ ...p, qty: p.qty - 1 }] : []) : [p])),
      );
    const remove = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id));
    const clear = () => setItems([]);

    const setCartTarget = (el: HTMLElement | null) => { cartTargetRef.current = el; };

    const flyToCart = (origin: DOMRect, img: string) => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const target = cartTargetRef.current?.getBoundingClientRect();
      if (!target) return;

      const w = Math.min(origin.width, 110);
      const h = w * (origin.height / origin.width || 1.25);
      const sx = origin.left + (origin.width - w) / 2;
      const sy = origin.top + (origin.height - h) / 2;
      const ex = target.left + target.width / 2 - w / 2;
      const ey = target.top + target.height / 2 - h / 2;
      const mx = (sx + ex) / 2;
      const my = Math.min(sy, ey) - 140;

      const id = ++flightId.current;
      setFlights((f) => [...f, { id, img, w, h, sx, sy, mx, my, ex, ey }]);
    };

    const count = items.reduce((n, p) => n + p.qty, 0);
    const total = items.reduce((n, p) => n + p.qty * p.price, 0);
    return { items, add, inc, dec, remove, clear, count, total, open, setOpen, setCartTarget, flyToCart };
  }, [items, open]);

  const removeFlight = (id: number) => setFlights((f) => f.filter((x) => x.id !== id));

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Flight overlay: each in-flight clone animates independently, so
          rapid multi-clicks produce several arcs at once. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
        {flights.map((f) => (
          <motion.img
            key={f.id}
            src={f.img}
            initial={{ x: f.sx, y: f.sy, scale: 1, opacity: 1 }}
            animate={{ x: [f.sx, f.mx, f.ex], y: [f.sy, f.my, f.ey], scale: [1, 0.85, 0.18], opacity: [1, 1, 0.5] }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], times: [0, 0.55, 1] }}
            onAnimationComplete={() => removeFlight(f.id)}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: f.w,
              height: f.h,
              objectFit: "cover",
              borderRadius: 14,
              boxShadow: "var(--shadow-glow)",
            }}
          />
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
