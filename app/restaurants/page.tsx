"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantForm from "@/components/RestaurantForm";
import { Restaurant, GENRE_OPTIONS, PRICE_RANGE_LABELS, PriceRange } from "@/lib/types";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Restaurant | null>(null);
  const [filterGenre, setFilterGenre] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [searchText, setSearchText] = useState("");

  const fetchRestaurants = async () => {
    const params = new URLSearchParams();
    if (filterGenre) params.set("genre", filterGenre);
    if (filterPrice) params.set("price_range", filterPrice);
    const res = await fetch(`/api/restaurants?${params}`);
    setRestaurants(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filterGenre, filterPrice]);

  const handleAdd = async (data: Partial<Restaurant>) => {
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    setShowForm(false);
    fetchRestaurants();
  };

  const handleEdit = async (data: Partial<Restaurant>) => {
    const res = await fetch(`/api/restaurants/${editTarget!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    setEditTarget(null);
    fetchRestaurants();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このお店を削除してよいですか？")) return;
    await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
    fetchRestaurants();
  };

  const filtered = restaurants.filter((r) =>
    searchText
      ? r.name.includes(searchText) ||
        r.location.includes(searchText) ||
        r.notes?.includes(searchText)
      : true
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🍽️ お店管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          ＋ お店を追加
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="店名・場所で検索..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">全ジャンル</option>
          {GENRE_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={filterPrice}
          onChange={(e) => setFilterPrice(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">全価格帯</option>
          {Object.entries(PRICE_RANGE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* 追加フォーム */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">お店を追加</h2>
          <RestaurantForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
            submitLabel="追加する"
          />
        </div>
      )}

      {/* 編集フォーム */}
      {editTarget && (
        <div className="bg-white rounded-xl border border-orange-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">お店を編集</h2>
          <RestaurantForm
            initial={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            submitLabel="更新する"
          />
        </div>
      )}

      {/* 一覧 */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">🍽️</p>
          <p>お店がまだ登録されていません</p>
          <p className="text-sm">「お店を追加」ボタンから追加してください</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{filtered.length}件のお店</p>
          {filtered.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onEdit={() => setEditTarget(r)}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
