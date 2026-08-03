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
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div className="modal-panel max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-brand-darker">{active.name}</h2>
              <button
                onClick={() => setActive(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full text-ink/40 hover:bg-surface hover:text-ink transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
            {active.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.imageUrl} alt={active.name} className="w-full rounded-xl" />
            )}
            <p className="text-accent-dark font-bold text-xl">
              {active.price.toLocaleString()}₮
            </p>
            <p className="text-ink/70 text-sm leading-relaxed">{active.description}</p>
            <p className="badge-brand w-fit">Үлдэгдэл: {active.stock}</p>
          </div>
        </div>
      )}
    </div>
  );
}
