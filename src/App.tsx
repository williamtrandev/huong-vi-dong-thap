import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode, type ChangeEvent, type FormEvent } from "react";
import { ShoppingBag, Search, ArrowUpRight, Shield, Leaf, Sparkles, Sun, Moon, Plus, Minus, Trash2, X, Loader2, Check } from "lucide-react";

import { CartProvider, useCart } from "@/lib/cart";
import { sendOrder } from "@/lib/orders";
import hero from "@/assets/hero-product.jpg";
import nemChua from "@/assets/nem-chua.jpg";
import nemBi from "@/assets/nem-bi.jpg";
import cha from "@/assets/cha-lua.jpg";

type Category = "dac-san";

interface Variant {
  label: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  unit: string;
  category: Category;
  tag?: string;
  img: string;
  // Đặc sản come in two packagings. Prices default to the base price - edit
  // the "Hộp" price here if it differs.
  variants?: Variant[];
}

const products: Product[] = [
  { id: 1, name: "Nem chua Lai Vung", desc: "Chua dịu, thơm lá chuối, gói thủ công", price: 35000, unit: "chục", category: "dac-san", tag: "Bán chạy", img: nemChua, variants: [{ label: "Lá", price: 35000 }, { label: "Hộp", price: 35000 }] },
  { id: 2, name: "Nem bì Lai Vung", desc: "Bì giòn sần sật, vị truyền thống", price: 35000, unit: "chục", category: "dac-san", tag: "Đặc sản", img: nemBi, variants: [{ label: "Lá", price: 35000 }, { label: "Hộp", price: 35000 }] },
  { id: 5, name: "Chả lụa Lai Vung", desc: "Chả dai mịn, thơm tiêu, đòn 500g gói lá chuối", price: 100000, unit: "đòn", category: "dac-san", tag: "Mới", img: cha },
];

const categories: { id: Category; label: string; count: number }[] = [
  { id: "dac-san", label: "Đặc sản Đồng Tháp", count: 3 },
];

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const EASE = [0.22, 1, 0.36, 1] as const;

const ZALO_CONTACTS = [
  { name: "Tấn Thành", phone: "0907640698" },
  { name: "Yến Nhi", phone: "0855063988" },
];
const zaloUrl = (phone: string) => `https://zalo.me/${phone}`;

export default function Home() {
  const [cat, setCat] = useState<Category>("dac-san");
  return (
    <CartProvider>
      <div className="min-h-screen overflow-x-clip">
        <ScrollProgress />
        <Nav />
        <Hero />
        <Marquee />
        <Shop cat={cat} setCat={setCat} />
        <Manifesto />
        <Features />
        <Footer />
        <ZaloButton />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

/* Floating Zalo button - tap to choose one of two Zalo profiles.
   Brand logo from Simple Icons (official Zalo wordmark). */
function ZaloButton() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-foreground/10"
        />
      )}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-64 rounded-2xl border border-border bg-card p-2 shadow-glow"
            >
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Chọn Zalo để liên hệ</div>
              {ZALO_CONTACTS.map((c) => (
                <a
                  key={c.phone}
                  href={zaloUrl(c.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0068FF]">
                    <img src="https://cdn.simpleicons.org/zalo/ffffff" alt="" aria-hidden width={22} height={22} className="h-4 w-auto" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">{c.phone}</span>
                  </span>
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Liên hệ Zalo"
          aria-expanded={open}
          initial={reduce ? false : { opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.3, type: "spring", stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-2 rounded-full bg-white pl-3 pr-4 py-2.5 shadow-glow ring-1 ring-black/5"
        >
          {!reduce && !open && (
            <span className="absolute inset-0 rounded-full bg-[#0068FF] -z-10 animate-ping opacity-25" aria-hidden />
          )}
          <span className="flex size-9 items-center justify-center rounded-full bg-[#0068FF]">
            <img src="https://cdn.simpleicons.org/zalo/ffffff" alt="" aria-hidden width={20} height={20} className="h-4 w-auto" />
          </span>
          <span className="text-sm font-semibold text-[#0068FF]">Liên hệ Zalo</span>
        </motion.button>
      </div>
    </>
  );
}

/* Thin terracotta progress bar that fills as the page scrolls. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-primary"
    />
  );
}

/* Light/dark toggle. Defaults to the OS preference, then remembers the
   user's explicit choice in localStorage and overrides via data-theme. */
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* ignore */ }
  };

  // Until mounted, render a same-sized placeholder so SSR and client match.
  return (
    <button
      onClick={toggle}
      aria-label="Đổi giao diện sáng/tối"
      className="p-2 hover:bg-muted rounded-full transition"
    >
      {theme === null ? (
        <span className="block size-5" />
      ) : theme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}

function Nav() {
  const reduce = useReducedMotion();
  const { count, setOpen, setCartTarget } = useCart();
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="sticky top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-3 md:pt-4">
        <div className="flex items-center justify-between gap-2 rounded-full border border-border/60 bg-background/70 px-4 md:px-6 h-14 md:h-16 shadow-soft backdrop-blur-xl">
          <a href="#" className="font-display text-[15px] sm:text-lg md:text-2xl tracking-tight leading-none whitespace-nowrap">
            Hương Vị <span className="italic text-primary">Đồng Tháp</span>
          </a>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <a href="#shop" aria-label="Tìm kiếm sản phẩm" className="p-2 hover:bg-muted rounded-full transition"><Search className="size-5" /></a>
            <button ref={setCartTarget} onClick={() => setOpen(true)} aria-label="Mở giỏ hàng" className="relative p-2 hover:bg-muted rounded-full transition">
              <motion.span
                animate={reduce || count === 0 ? undefined : { rotate: [0, -12, 10, 0] }}
                transition={{ duration: 0.45 }}
                key={`bag-${count}`}
                className="block"
              >
                <ShoppingBag className="size-5" />
              </motion.span>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={reduce ? false : { scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 16 }}
                  className="absolute top-0 right-0 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  const headline = ["Nem", "Lai", "Vung", "chính", "gốc,", "gói", "tay", "mỗi", "ngày."];

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Living aurora + grain backdrop */}
      <div className="absolute inset-0 -z-10 aurora" aria-hidden />
      <div className="absolute inset-0 -z-10 grain opacity-[0.04] mix-blend-multiply" aria-hidden />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div style={{ opacity: fade }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/80 border border-border text-xs uppercase tracking-widest backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Đặc sản Lai Vung, Đồng Tháp
          </motion.span>

          <h1 className="mt-6 max-w-5xl text-[clamp(2.7rem,6vw,5.2rem)] font-medium leading-[0.95] text-balance">
            {headline.map((w, i) => (
              <motion.span
                key={i}
                initial={reduce ? false : { opacity: 0, y: "0.5em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
                transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE }}
                className="inline-block mr-[0.25em]"
              >
                {w === "chính" || w === "gốc," ? (
                  <em className="italic text-aurora not-italic font-display">{w}</em>
                ) : (
                  w
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-6 max-w-md text-muted-foreground text-lg"
          >
            Hương Vị Đồng Tháp mang đến nem chua, nem bì và chả lụa truyền thống Lai Vung, gói tay mỗi ngày, giao tận nhà toàn quốc.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <MagneticCTA href="#shop" className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-full font-medium shadow-glow">
              Đặt nem ngay <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
            </MagneticCTA>
          </motion.div>

        </motion.div>

        <motion.div style={{ y }} className="relative aspect-square">
          <motion.div
            style={{ y: imgY }}
            initial={{ scale: 0.85, opacity: 0, rotate: -3 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-glow"
          >
            <img src={hero} alt="Nem chua Lai Vung" className="w-full h-full object-cover" width={1536} height={1536} />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 0.7 }}
            className="absolute -bottom-6 -left-6 bg-card/90 backdrop-blur rounded-2xl p-4 shadow-soft border border-border max-w-[220px] float-slow"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Hôm nay</div>
            <div className="font-display text-lg mt-1">Nem chua Lai Vung</div>
            <div className="text-primary font-medium mt-1">35.000₫ / chục</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* Button that gently leans toward the cursor, then springs back. */
function MagneticCTA({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });
  return (
    <motion.a
      href={href}
      style={reduce ? undefined : { x: sx, y: sy }}
      onMouseMove={reduce ? undefined : (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onMouseLeave={reduce ? undefined : () => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

function Marquee() {
  const items = ["Gói thủ công mỗi ngày", "Đặc sản Lai Vung, Đồng Tháp", "Giao hàng toàn quốc", "35.000₫ / chục", "Đặt nhanh qua Zalo"];
  const row = (cls: string) => (
    <div className={`flex gap-16 whitespace-nowrap ${cls}`}>
      {[...items, ...items, ...items, ...items].map((t, i) => (
        <div key={i} className="flex items-center gap-16 text-sm uppercase tracking-[0.2em] text-muted-foreground">
          {t} <span className="text-primary">✦</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="border-y border-border bg-card overflow-hidden py-5 space-y-3">
      {row("marquee")}
      <div className="hidden md:block opacity-60">{row("marquee-reverse")}</div>
    </div>
  );
}

function Shop({ cat, setCat }: { cat: Category; setCat: (c: Category) => void }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const base = products.filter(p => p.category === cat);
    const q = query.trim().toLowerCase();
    return q ? base.filter(p => `${p.name} ${p.desc}`.toLowerCase().includes(q)) : base;
  }, [cat, query]);
  const catLabel = "đặc sản";
  // Reset the query when the category changes.
  useEffect(() => { setQuery(""); }, [cat]);

  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="text-sm uppercase tracking-widest text-primary">Cửa hàng</span>
        </motion.div>
        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Tìm trong ${catLabel}...`}
            aria-label={`Tìm trong ${catLabel}`}
            className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
          />
        </div>
      </div>

      <div className={`flex-wrap gap-2 mb-10 border-b border-border pb-4 ${categories.length > 1 ? "flex" : "hidden"}`}>
        {categories.map(c => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${active ? "text-primary-foreground" : "text-foreground hover:bg-muted"}`}
            >
              {active && (
                <motion.span
                  layoutId="cat-pill"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {c.label}
                {c.count !== null && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-primary-foreground/20" : "bg-muted-foreground/15"}`}>{c.count}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl">Không tìm thấy sản phẩm nào.</p>
          <p className="mt-2 text-muted-foreground">Thử từ khoá khác, hoặc nhắn Zalo để được tư vấn.</p>
          <button
            onClick={() => setQuery("")}
            className="mt-6 inline-flex items-center rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            Xoá tìm kiếm
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div key={cat} layout className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((p, i) => (
              <TiltCard key={p.id} index={i} product={p} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}

/* Product card: 3D tilt toward cursor + a soft light that follows the pointer. */
function TiltCard({ product: p, index }: { product: Product; index: number }) {
  const reduce = useReducedMotion();
  const { add, flyToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [vIdx, setVIdx] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const variant = p.variants?.[vIdx];
  const price = variant ? variant.price : p.price;

  const handleAdd = () => {
    if (imgRef.current) flyToCart(imgRef.current.getBoundingClientRect(), p.img);
    add({
      // Distinct cart line per variant so "Lá chuối" and "Hộp" don't merge.
      id: variant ? p.id * 10 + vIdx : p.id,
      name: variant ? `${p.name} - ${variant.label}` : p.name,
      price,
      unit: p.unit,
      img: p.img,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mx}% ${my}%, oklch(1 0 0 / 0.25), transparent 65%)`;

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
      onMouseMove={reduce ? undefined : (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 10);
        rx.set((0.5 - py) * 10);
        mx.set(px * 100);
        my.set(py * 100);
      }}
      onMouseLeave={reduce ? undefined : () => { rx.set(0); ry.set(0); }}
      style={reduce ? undefined : { rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      className="group h-full flex flex-col [transform-style:preserve-3d]"
    >
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
        <img
          ref={imgRef}
          src={p.img} alt={p.name} loading="lazy" width={800} height={1000}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <motion.div style={{ background: spotlight }} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {p.tag && (
          <span className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest">{p.tag}</span>
        )}
        <button
          onClick={handleAdd}
          className={`absolute bottom-3 left-3 right-3 py-3 rounded-full text-sm font-medium text-center transition-all duration-500 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 ${added ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            {added ? (<><Check className="size-4" /> Đã thêm</>) : "Thêm vào giỏ"}
          </span>
        </button>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h3 className="font-medium">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5" title={p.desc}>{p.desc}</p>
          </div>
          <div className="flex items-baseline gap-1 shrink-0 sm:flex-col sm:items-end sm:gap-0">
            <div className="text-primary font-medium">{fmt(price)}</div>
            <div className="text-[11px] text-muted-foreground">/ {p.unit}</div>
          </div>
        </div>

        {p.variants && (
          <div className="mt-auto pt-3 flex gap-2">
            {p.variants.map((v, idx) => {
              const active = idx === vIdx;
              return (
                <button
                  key={v.label}
                  onClick={() => setVIdx(idx)}
                  aria-pressed={active}
                  className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/40"}`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}

/* Scroll-scrubbed statement: each word lights up as it crosses the viewport. */
function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const text = "Từ căn bếp nhỏ ở Lai Vung, mỗi gói nem được lên men tự nhiên trong lá chuối tươi, giữ trọn vị chua dịu, thơm và sạch.";
  const words = text.split(" ");

  return (
    <section ref={ref} className="mx-auto max-w-5xl px-6 py-24 md:py-40">
      <p className="font-display text-3xl md:text-5xl lg:text-[3.5rem] leading-[1.15] text-balance flex flex-wrap">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ))}
      </p>
    </section>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, range, [0.15, 1]);
  if (reduce) return <span className="mr-[0.25em]">{children}</span>;
  return (
    <span className="relative mr-[0.25em]">
      <span className="absolute opacity-10">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

/* Reusable spring reveal so every section lifts in with the same feel. */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 90, damping: 18, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Features() {
  return (
    <section className="relative bg-foreground text-background py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 grain opacity-[0.06]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="max-w-2xl mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-balance">Làm tử tế, từ tay đến nhà bạn.</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[minmax(0,1fr)] gap-4 md:gap-5 [grid-auto-flow:dense]">
          {/* Large image-led cell */}
          <Reveal className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl min-h-[22rem]">
            <img src={nemChua} alt="Nem gói tay" loading="lazy" width={1000} height={1200}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8">
              <Leaf className="size-7 mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-3xl">Gói thủ công mỗi ngày</h3>
              <p className="mt-2 text-white/75 max-w-sm">Lên men tự nhiên trong lá chuối tươi, không chất bảo quản.</p>
            </div>
          </Reveal>

          {/* Wide tinted feature cell */}
          <Reveal delay={0.08} className="md:col-span-2 relative overflow-hidden rounded-3xl p-8 bg-primary text-primary-foreground">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
            <Sparkles className="size-7 mb-4" strokeWidth={1.5} />
            <h3 className="font-display text-2xl">Trọn vị Lai Vung</h3>
            <p className="mt-2 text-primary-foreground/80 max-w-md">Nem chua, nem bì và chả lụa truyền thống Đồng Tháp - gói lá hoặc đóng hộp.</p>
          </Reveal>

          {/* Compact icon cell */}
          <Reveal delay={0.16} className="md:col-span-2 group rounded-3xl border border-background/10 p-7 transition-colors hover:bg-background/[0.05]">
            <Shield className="size-7 mb-4 transition-transform duration-500 group-hover:rotate-6" strokeWidth={1.5} />
            <h3 className="font-display text-xl">Đổi mới 100%</h3>
            <p className="mt-1 text-sm text-background/65">Không như mong đợi, đổi ngay.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Slide-over cart: review the order, fill contact info, then the order is
   sent to Telegram through the server function (token stays server-side). */
function CartDrawer() {
  const reduce = useReducedMotion();
  const { items, open, setOpen, inc, dec, remove, total, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [payment, setPayment] = useState<"qr" | "cod">("cod");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  // SĐT VN: 10 số bắt đầu bằng 0, hoặc +84 + 9 số. Bỏ qua khoảng trắng / dấu chấm.
  const validatePhone = (raw: string) => /^(0\d{9}|\+84\d{9})$/.test(raw.replace(/[\s.]/g, ""));
  const phoneDigits = form.phone.replace(/[\s.+]/g, "");
  const phoneValid = validatePhone(form.phone);
  // Hiện lỗi ngay khi gõ - nhưng chỉ sau khi đã đủ độ dài hoặc rời ô, để
  // không nhấp nháy đỏ lúc đang gõ dở.
  const phoneShowErr = form.phone !== "" && !phoneValid && (phoneTouched || phoneDigits.length >= 10);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phoneValid) {
      setPhoneTouched(true);
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await sendOrder({
        customer: form,
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, unit: i.unit })),
        total,
        payment,
      });
      setStatus("sent");
      clear();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau.");
    }
  };

  const resetAndContinue = () => {
    setStatus("idle");
    setForm({ name: "", phone: "", note: "" });
    setPayment("cod");
    setOpen(false);
  };

  const inputCls = "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring/40";
  // VietQR động: VCB (acquirer 970436), STK 1023770862, số tiền = tổng đơn.
  const qrUrl = `https://img.vietqr.io/image/970436-1023770862-compact2.png?amount=${total}&addInfo=${encodeURIComponent("thanh toan tien don hang")}&accountName=${encodeURIComponent("TRAN TAN THANH")}`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-glow flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
              <div className="font-display text-xl">Giỏ hàng</div>
              <button onClick={() => setOpen(false)} aria-label="Đóng giỏ hàng" className="p-2 hover:bg-muted rounded-full transition">
                <X className="size-5" />
              </button>
            </div>

            {status === "sent" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-6">
                  <Check className="size-8" />
                </div>
                <h3 className="font-display text-2xl">Đã nhận đơn!</h3>
                <p className="mt-2 text-muted-foreground">Đơn hàng đã gửi tới cửa hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                <button onClick={resetAndContinue} className="mt-8 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:scale-[1.02] transition-transform">
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1.5} />
                <p className="mt-4 font-display text-xl">Giỏ hàng trống</p>
                <p className="mt-1 text-sm text-muted-foreground">Thêm vài món nem, bì hoặc chả để bắt đầu.</p>
                <button onClick={() => setOpen(false)} className="mt-6 rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium hover:bg-foreground hover:text-background transition-colors">
                  Xem cửa hàng
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  <div className="space-y-4">
                  {items.map((it) => (
                    <div key={it.id} className="flex gap-4">
                      <img src={it.img} alt={it.name} width={80} height={80} className="size-20 rounded-xl object-cover bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium leading-tight">{it.name}</h4>
                          <button onClick={() => remove(it.id)} aria-label="Xoá" className="p-1 text-muted-foreground hover:text-destructive transition">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="text-sm text-primary font-medium mt-0.5">{fmt(it.price)} <span className="text-muted-foreground font-normal">/ {it.unit}</span></div>
                        <div className="mt-2 inline-flex items-center rounded-full border border-border">
                          <button onClick={() => dec(it.id)} aria-label="Giảm" className="p-1.5 hover:bg-muted rounded-l-full transition"><Minus className="size-3.5" /></button>
                          <span className="w-8 text-center text-sm tabular-nums">{it.qty}</span>
                          <button onClick={() => inc(it.id)} aria-label="Tăng" className="p-1.5 hover:bg-muted rounded-r-full transition"><Plus className="size-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>

                  <div className="grid gap-2 border-t border-border pt-5">
                    <input required value={form.name} onChange={set("name")} placeholder="Họ và tên" aria-label="Họ và tên" className={inputCls} />
                    <div>
                      <input
                        required
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[^\d+]/g, "") }))}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder="Số điện thoại"
                        aria-label="Số điện thoại"
                        aria-invalid={phoneShowErr || undefined}
                        className={`${inputCls} ${phoneShowErr ? "border-destructive focus:ring-destructive/40" : ""}`}
                      />
                      {phoneShowErr && <p className="mt-1 text-xs text-destructive">Số điện thoại không hợp lệ. Nhập 10 số bắt đầu bằng 0 (vd 0907640698).</p>}
                    </div>
                    <textarea value={form.note} onChange={set("note")} placeholder="Ghi chú: ăn liền hay chưa? (mặc định lấy nem mới, 1-2 ngày sau sẽ chua)" aria-label="Ghi chú" rows={2} className={inputCls} />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Phương thức thanh toán</div>
                    <div className="grid grid-cols-2 gap-2">
                      {([["cod", "Khi nhận hàng"], ["qr", "Quét mã QR"]] as const).map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPayment(val)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${payment === val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/40"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {payment === "qr" && (
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-center">
                      <img src={qrUrl} alt="Mã VietQR thanh toán" width={220} height={220} className="mx-auto size-52 rounded-lg bg-white object-contain" />
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        VCB • <span className="font-medium text-foreground tabular-nums">1023770862</span><br />
                        Chủ TK: <span className="font-medium text-foreground">TRAN TAN THANH</span><br />
                        Nội dung: <span className="font-medium text-foreground">thanh toan tien don hang</span><br />
                        Số tiền: <span className="font-medium text-primary">{fmt(total)}</span>
                      </div>
                    </div>
                  )}

                  {status === "error" && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>

                <div className="border-t border-border px-6 py-4 space-y-3 shrink-0 bg-background">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">Tổng cộng</span>
                    <span className="font-display text-primary">{fmt(total)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium shadow-glow hover:scale-[1.01] transition-transform disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {status === "sending" ? (<><Loader2 className="size-4 animate-spin" /> Đang gửi đơn...</>) : "Đặt hàng"}
                  </button>
                </div>
              </form>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-2xl">Hương Vị <span className="italic text-primary">Đồng Tháp</span></div>
          <p className="mt-4 text-muted-foreground max-w-sm">Nem chua, nem bì, chả lụa đặc sản Đồng Tháp. Gói tay mỗi ngày tại Lai Vung.</p>
        </div>
        <div>
          <div className="font-medium mb-4">Phân loại</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#shop" className="hover:text-foreground transition">Nem chua Lai Vung</a></li>
            <li><a href="#shop" className="hover:text-foreground transition">Nem bì Lai Vung</a></li>
            <li><a href="#shop" className="hover:text-foreground transition">Chả lụa Lai Vung</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-4">Hỗ trợ</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {ZALO_CONTACTS.map((c) => (
              <li key={c.phone}><a href={zaloUrl(c.phone)} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Zalo {c.name} - {c.phone}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 pb-28 md:pb-6 text-center text-xs text-muted-foreground">
        © 2026 Hương Vị Đồng Tháp. Lai Vung, Đồng Tháp.
      </div>
    </footer>
  );
}
