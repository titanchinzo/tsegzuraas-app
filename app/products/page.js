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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-darker">Бүтээгдэхүүн</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} onClick={() => setActive(p)} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-ink/60 text-sm">Одоогоор бүтээгдэхүүн алга байна.</p>
      )}

      {active && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">{active.name}</h2>
              <button onClick={() => setActive(null)} className="text-ink/50">
                ✕
              </button>
            </div>
            {active.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.imageUrl} alt={active.name} className="w-full rounded-md" />
            )}
            <p className="text-brand-darker font-bold text-lg">
              {active.price.toLocaleString()}₮
            </p>
            <p className="text-ink/70 text-sm">{active.description}</p>
            <p className="text-xs text-ink/50">Үлдэгдэл: {active.stock}</p>
          </div>
        </div>
      )}
    </div>
  );
}
