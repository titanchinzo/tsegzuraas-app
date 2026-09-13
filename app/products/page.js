"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts(data.products || []));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">🛍️ Бүтээгдэхүүн</h1>
        <p className="page-subtitle">Телеграфын түлхүүр болон холбогдох дагалдах хэрэгсэл.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} onClick={() => setActive(p)} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="card p-10 text-center text-ink/50 text-sm">
          Одоогоор бүтээгдэхүүн алга байна.
        </div>
      )}

      {active && (
        <ProductModal product={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function ProductModal({ product, onClose }) {
  const [ordering, setOrdering] = useState(false);
  const [form, setForm] = useState({ quantity: 1, customerName: "", customerPhone: "", note: "" });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const outOfStock = product.stock <= 0;

  async function submitOrder(e) {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim()) return;
    setSaving(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product._id, ...form }),
    });
    setSaving(false);
    setStatus(
      res.ok
        ? { ok: true, text: "Захиалга амжилттай илгээгдлээ! Тантай удахгүй холбогдоно." }
        : { ok: false, text: "Алдаа гарлаа. Дахин оролдоно уу." }
    );
    if (res.ok) {
      setForm({ quantity: 1, customerName: "", customerPhone: "", note: "" });
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-brand-darker">{product.name}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-ink/40 hover:bg-surface hover:text-ink transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-xl" />
        )}
        <p className="text-accent-dark font-bold text-xl">{product.price.toLocaleString()}₮</p>
        <p className="text-ink/70 text-sm leading-relaxed">{product.description}</p>
        <p className={outOfStock ? "badge bg-red-50 text-red-600 w-fit" : "badge-brand w-fit"}>
          {outOfStock ? "Дууссан" : `Үлдэгдэл: ${product.stock}`}
        </p>

        {status ? (
          <p
            className={`text-sm px-3 py-2.5 rounded-lg ${
              status.ok ? "bg-brand-50 text-brand-darker" : "bg-red-50 text-red-700"
            }`}
          >
            {status.ok ? "✓ " : "✕ "}
            {status.text}
          </p>
        ) : ordering ? (
          <form onSubmit={submitOrder} className="space-y-2.5 pt-1">
            <input
              placeholder="Таны нэр"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="input"
              required
            />
            <input
              placeholder="Утасны дугаар"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="input"
              required
            />
            <input
              type="number"
              min={1}
              max={outOfStock ? undefined : product.stock}
              placeholder="Тоо ширхэг"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="input"
            />
            <textarea
              placeholder="Тэмдэглэл (заавал биш)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input"
              rows={2}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-accent flex-1" disabled={saving}>
                {saving ? "Илгээж байна..." : "Захиалга баталгаажуулах"}
              </button>
              <button
                type="button"
                onClick={() => setOrdering(false)}
                className="btn-secondary !px-4"
              >
                Болих
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setOrdering(true)}
            disabled={outOfStock}
            className="btn-accent w-full disabled:opacity-40 disabled:pointer-events-none"
          >
            {outOfStock ? "Дууссан" : "Захиалах"}
          </button>
        )}
      </div>
    </div>
  );
}
