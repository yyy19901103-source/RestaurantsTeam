"use client";

import { useEffect, useState } from "react";
import { VisitHistory, Restaurant } from "@/lib/types";

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-xs">未評価</span>;
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-200"}>⭐</span>
      ))}
    </span>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<VisitHistory[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    restaurant_id: "",
    visited_date: new Date().toISOString().split("T")[0],
    participant_count: "",
    rating: "",
    comment: "",
  });

  const fetchData = async () => {
    const [hRes, rRes] = await Promise.all([
      fetch("/api/history"),
      fetch("/api/restaurants"),
    ]);
    setHistory(await hRes.json());
    setRestaurants(await rRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurant_id: Number(form.restaurant_id),
        visited_date: form.visited_date,
        participant_count: form.participant_count ? Number(form.participant_count) : undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        comment: form.comment || undefined,
      }),
    });
    if (!res.ok) { alert((await res.json()).error); return; }
    setShowAddForm(false);
    setForm({ restaurant_id: "", visited_date: new Date().toISOString().split("T")[0], participant_count: "", rating: "", comment: "" });
    fetchData();
  };

  // 統計計算
  const stats = (() => {
    const countMap = new Map<string, number>();
    for (const h of history) {
      countMap.set(h.restaurant_name ?? "", (countMap.get(h.restaurant_name ?? "") ?? 0) + 1);
    }
    const topRestaurant = [...countMap.entries()].sort((a, b) => b[1] - a[1])[0];
    const totalParticipants = history.reduce((s, h) => s + (h.participant_count ?? 0), 0);
    const avgRating = history.filter((h) => h.rating).reduce((s, h) => s + (h.rating ?? 0), 0) / Math.max(history.filter((h) => h.rating).length, 1);
    return { topRestaurant, totalParticipants, avgRating: avgRating.toFixed(1), count: history.length };
  })();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📖 訪問履歴</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          ＋ 履歴を追加
        </button>
      </div>

      {/* 統計 */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.count}</div>
            <div className="text-xs text-gray-500 mt-1">総訪問回数</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.totalParticipants}</div>
            <div className="text-xs text-gray-500 mt-1">総参加人数</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.avgRating}</div>
            <div className="text-xs text-gray-500 mt-1">平均満足度</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-sm font-bold text-green-600 truncate">{stats.topRestaurant?.[0] ?? "-"}</div>
            <div className="text-xs text-gray-500 mt-1">最多訪問店 ({stats.topRestaurant?.[1] ?? 0}回)</div>
          </div>
        </div>
      )}

      {/* 手動追加フォーム */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">訪問履歴を手動追加</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お店 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.restaurant_id}
                  onChange={(e) => setForm({ ...form, restaurant_id: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">選択してください</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  訪問日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.visited_date}
                  onChange={(e) => setForm({ ...form, visited_date: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参加人数</label>
                <input
                  type="number"
                  value={form.participant_count}
                  onChange={(e) => setForm({ ...form, participant_count: e.target.value })}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="例：10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">満足度</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: String(n) })}
                      className={`text-xl transition-transform hover:scale-110 ${Number(form.rating) >= n ? "opacity-100" : "opacity-30"}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">コメント</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="料理の感想など"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg text-sm">
                追加する
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 履歴一覧 */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">読み込み中...</div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">📖</p>
          <p>訪問履歴がまだありません</p>
          <p className="text-sm">イベントを完了するか、手動で追加してください</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{h.restaurant_name}</span>
                    {h.event_title && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {h.event_title}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-3">
                    <span>📅 {h.visited_date}</span>
                    {h.participant_count && <span>👥 {h.participant_count}名</span>}
                    <StarRating rating={h.rating} />
                  </div>
                  {h.comment && (
                    <p className="text-sm text-gray-500 mt-1 italic">「{h.comment}」</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
