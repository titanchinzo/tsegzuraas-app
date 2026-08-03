"use client";

export default function ProductCard({ product, onClick }) {
  return (
    <button onClick={onClick} className="card overflow-hidden text-left hover:shadow-md transition-shadow">
      <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-ink/30 text-sm">Зураггүй</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold truncate">{product.name}</p>
        <p className="text-brand-darker font-bold">{product.price.toLocaleString()}₮</p>
      </div>
    </button>
  );
}
