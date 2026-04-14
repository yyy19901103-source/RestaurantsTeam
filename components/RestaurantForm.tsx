"use client";

import { useState } from "react";
import { Restaurant, GENRE_OPTIONS, PRICE_RANGE_LABELS, PriceRange } from "@/lib/types";

interface Props {
  initial?: Partial<Restaurant>;
  onSubmit: (data: Partial<Restaurant>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function RestaurantForm({ initial, onSubmit, onCancel, submitLabel = "保存" }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    genre: initial?.genre ?? "居酒屋",
    price_range: initial?.price_range ?? "2000~4000",
    location: initial?.location ?? "",
    capacity: initial?.capacity ?? "",
    url: initial?.url ?? "",
    notes: initial?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        url: form.url || undefined,
        notes: form.notes || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          店名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="例：鳥貴族 渋谷店"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ジャンル <span className="text-red-500">*</span>
          </label>
          <select
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {GENRE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            価格帯 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.price_range}
            onChange={(e) => setForm({ ...form, price_range: e.target.value as PriceRange })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {Object.entries(PRICE_RANGE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            場所・最寄り駅 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="例：渋谷駅3分"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">収容人数</label>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            min={1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="例：20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL（食べログ・ホットペッパーなど）</label>
        <input
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="個室あり、コース料理のみ、など"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {loading ? "保存中..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
