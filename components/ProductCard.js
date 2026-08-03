"use client";

export default function ProductCard({ product, onClick }) {
  return (
    <button onClick={onClick} className="card card-hover overflow-hidden text-left group">
      <div className="aspect-square bg-surface-light flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-ink/25 text-sm">Зураггүй</span>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold truncate text-ink/90">{product.name}</p>
        <p className="text-accent-dark font-bold mt-1">{product.price.toLocaleString()}₮</p>
      </div>
    </button>
  );
}
