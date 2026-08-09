"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

export default function ProductAdminForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", price: "", description: "", imageUrl: "", stock: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Алдаа гарлаа");
      return;
    }
    setForm({ name: "", price: "", description: "", imageUrl: "", stock: "" });
    onCreated?.(data.product);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-3 max-w-lg">
      <h3 className="font-bold text-brand-darker">Шинэ бүтээгдэхүүн нэмэх (Admin)</h3>
      {error && <p className="text-red-700 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <input
        placeholder="Нэр"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        className="input"
        required
      />
      <input
        placeholder="Үнэ (₮)"
        type="number"
        value={form.price}
        onChange={(e) => update("price", e.target.value)}
        className="input"
        required
      />
      <FileUpload
        accept="image/*"
        label="Зураг хуулах"
        onBusyChange={setUploading}
        onUploaded={(url) => update("imageUrl", url)}
      />
      <input
        placeholder="Зурагны URL (эсвэл дээр хуулна уу)"
        value={form.imageUrl}
        onChange={(e) => update("imageUrl", e.target.value)}
        className="input"
      />
      <input
        placeholder="Үлдэгдэл"
        type="number"
        value={form.stock}
        onChange={(e) => update("stock", e.target.value)}
        className="input"
      />
      <textarea
        placeholder="Дэлгэрэнгүй тайлбар"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        className="input"
        rows={3}
      />

      <button type="submit" disabled={saving || uploading} className="btn-primary">
        {uploading ? "Зураг хуулж байна..." : saving ? "Хадгалж байна..." : "Нэмэх"}
      </button>
    </form>
  );
}
