"use client";

import { useEffect, useState } from "react";
import useCurrentUser from "@/lib/useCurrentUser";
import ProductAdminForm from "@/components/ProductAdminForm";

export default function AdminPage() {
  const { role, loading } = useCurrentUser();

  if (loading) return <p>Ачааллаж байна...</p>;
  if (role !== "admin") {
    return <p className="text-red-700">Танд энэ хуудсанд хандах эрх байхгүй байна.</p>;
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-brand-darker">Админ самбар</h1>
      <UserManagement />
      <ProductManagement />
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(null);

  async function loadUsers() {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function changeRole(userId, newRole) {
    setSaving(userId);
    await fetch("/api/users/role", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setSaving(null);
    loadUsers();
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-brand-darker">Хэрэглэгчид</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-surface text-ink/50">
              <th className="py-2">Nickname</th>
              <th>И-мэйл</th>
              <th>Эрх</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-surface/60">
                <td className="py-2 font-medium">{u.nickname}</td>
                <td className="text-ink/60">{u.email || "—"}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    disabled={saving === u._id}
                    className="border border-surface rounded px-2 py-1 text-sm"
                  >
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <p className="text-ink/60 text-sm">Хэрэглэгч олдсонгүй.</p>
      )}
    </section>
  );
}

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  async function loadProducts() {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products || []);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function startEdit(product) {
    setEditId(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      stock: product.stock || 0,
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    await fetch(`/api/products/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        price: Number(editForm.price) || 0,
        stock: Number(editForm.stock) || 0,
      }),
    });
    setEditId(null);
    loadProducts();
  }

  async function deleteProduct(id) {
    if (!confirm("Энэ бүтээгдэхүүнийг устгах уу?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-brand-darker">Бүтээгдэхүүн удирдлага</h2>

      <ProductAdminForm onCreated={loadProducts} />

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p._id} className="card p-4">
            {editId === p._id ? (
              <form onSubmit={saveEdit} className="space-y-2">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-surface rounded-md px-3 py-2"
                  placeholder="Нэр"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="border border-surface rounded-md px-3 py-2"
                    placeholder="Үнэ"
                  />
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="border border-surface rounded-md px-3 py-2"
                    placeholder="Үлдэгдэл"
                  />
                </div>
                <input
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  className="w-full border border-surface rounded-md px-3 py-2"
                  placeholder="Зурагны URL"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-surface rounded-md px-3 py-2"
                  placeholder="Тайлбар"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm">Хадгалах</button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="text-sm text-ink/50 hover:text-ink"
                  >
                    Цуцлах
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-ink/60">
                    {p.price.toLocaleString()}₮ · Үлдэгдэл: {p.stock}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-sm text-brand-darker hover:underline"
                  >
                    Засах
                  </button>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Устгах
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-ink/60 text-sm">Бүтээгдэхүүн одоогоор алга байна.</p>
        )}
      </div>
    </section>
  );
}
