"use client";

import { useEffect, useState } from "react";
import useCurrentUser from "@/lib/useCurrentUser";
import ProductAdminForm from "@/components/ProductAdminForm";

export default function AdminPage() {
  const { role, loading } = useCurrentUser();

  if (loading) return <p className="text-ink/50">Ачааллаж байна...</p>;
  if (role !== "admin") {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-2 animate-fade-in">
        <p className="text-2xl">🔒</p>
        <p className="text-ink/70">Танд энэ хуудсанд хандах эрх байхгүй байна.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <h1 className="page-title">🛠️ Админ самбар</h1>
      <UserManagement />
      <OrderManagement />
      <ProductManagement />
    </div>
  );
}

const ROLE_BADGE = {
  admin: "bg-accent/15 text-accent-dark",
  teacher: "bg-brand-100 text-brand-darker",
  student: "bg-surface text-ink/60",
};

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
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-surface text-ink/40">
              <th className="py-3 px-5 font-medium">Nickname</th>
              <th className="font-medium">И-мэйл</th>
              <th className="font-medium px-5">Эрх</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-surface/60 last:border-0">
                <td className="py-3 px-5 font-medium text-ink/90">{u.nickname}</td>
                <td className="text-ink/50">{u.email || "—"}</td>
                <td className="px-5 py-2.5">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    disabled={saving === u._id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer disabled:opacity-50 ${
                      ROLE_BADGE[u.role] || "bg-surface text-ink/60"
                    }`}
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
        {users.length === 0 && (
          <p className="text-ink/50 text-sm p-6 text-center">Хэрэглэгч олдсонгүй.</p>
        )}
      </div>
    </section>
  );
}

const ORDER_STATUS_BADGE = {
  new: "bg-accent/15 text-accent-dark",
  confirmed: "bg-brand-100 text-brand-darker",
  done: "bg-surface text-ink/60",
  cancelled: "bg-red-50 text-red-600",
};

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(null);

  async function loadOrders() {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function changeStatus(orderId, status) {
    setSaving(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(null);
    loadOrders();
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-brand-darker">Захиалгууд</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-surface text-ink/40">
              <th className="py-3 px-5 font-medium">Бүтээгдэхүүн</th>
              <th className="font-medium">Захиалагч</th>
              <th className="font-medium">Утас</th>
              <th className="font-medium">Тоо</th>
              <th className="font-medium">Дүн</th>
              <th className="font-medium px-5">Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-surface/60 last:border-0">
                <td className="py-3 px-5 font-medium text-ink/90">{o.productName}</td>
                <td className="text-ink/70">{o.customerName}</td>
                <td className="text-ink/50">{o.customerPhone}</td>
                <td className="text-ink/50">{o.quantity}</td>
                <td className="text-ink/70">{(o.price * o.quantity).toLocaleString()}₮</td>
                <td className="px-5 py-2.5">
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                    disabled={saving === o._id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer disabled:opacity-50 ${
                      ORDER_STATUS_BADGE[o.status] || "bg-surface text-ink/60"
                    }`}
                  >
                    <option value="new">new</option>
                    <option value="confirmed">confirmed</option>
                    <option value="done">done</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-ink/50 text-sm p-6 text-center">Захиалга одоогоор алга байна.</p>
        )}
      </div>
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
          <div key={p._id} className="card p-5">
            {editId === p._id ? (
              <form onSubmit={saveEdit} className="space-y-2.5">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input"
                  placeholder="Нэр"
                  required
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="input"
                    placeholder="Үнэ"
                  />
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="input"
                    placeholder="Үлдэгдэл"
                  />
                </div>
                <input
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  className="input"
                  placeholder="Зурагны URL"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input"
                  placeholder="Тайлбар"
                  rows={2}
                />
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Хадгалах</button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="btn-secondary !px-4 !py-2 text-sm"
                  >
                    Цуцлах
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink/90">{p.name}</p>
                  <p className="text-sm text-ink/50">
                    {p.price.toLocaleString()}₮ · Үлдэгдэл: {p.stock}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="btn-ghost text-sm"
                  >
                    Засах
                  </button>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Устгах
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {products.length === 0 && (
          <div className="card p-10 text-center text-ink/50 text-sm">
            Бүтээгдэхүүн одоогоор алга байна.
          </div>
        )}
      </div>
    </section>
  );
}
