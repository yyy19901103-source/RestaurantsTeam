"use client";

import { useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import { Restaurant, GENRE_OPTIONS, PRICE_RANGE_LABELS, PriceRange } from "@/lib/types";

export default function PickPage() {
  const [filters, setFilters] = useState({
    genre: "",
    price_range: "",
    exclude_recent_days: "30",
    count: "3",
  });
  const [picked, setPicked] = useState<Restaurant[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handlePick = async () => {
    setLoading(true);
    setSpinning(true);
    setPicked([]);
    setMessage("");

    // アニメーション演出
    setTimeout(async () => {
      try {
        const res = await fetch("/api/pick", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            genre: filters.genre || undefined,
            price_range: filters.price_range || undefined,
            exclude_recent_days: Number(filters.exclude_recent_days),
            count: Number(filters.count),
          }),
        });
        const data = await res.json();
        setPicked(data.picked ?? []);
        setMessage(data.message ?? "");
      } catch {
        setMessage("エラーが発生しました");
      } finally {
        setLoading(false);
        setSpinning(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">🎲 ランダム抽選</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-gray-700">絞り込み条件</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ジャンル</label>
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">全ジャンル</option>
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">価格帯</label>
            <select
              value={filters.price_range}
              onChange={(e) => setFilters({ ...filters, price_range: e.target.value as PriceRange })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">全価格帯</option>
              {Object.entries(PRICE_RANGE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              最近訪問を除外
            </label>
            <select
              value={filters.exclude_recent_days}
              onChange={(e) => setFilters({ ...filters, exclude_recent_days: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="0">除外しない</option>
              <option value="14">2週間以内を除外</option>
              <option value="30">1ヶ月以内を除外</option>
              <option value="60">2ヶ月以内を除外</option>
              <option value="90">3ヶ月以内を除外</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">提案件数</label>
            <select
              value={filters.count}
              onChange={(e) => setFilters({ ...filters, count: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="1">1件</option>
              <option value="3">3件</option>
              <option value="5">5件</option>
            </select>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
          💡 <strong>重み付き抽選</strong>: 訪問回数が少ないお店ほど選ばれやすくなります。
          最近行ったお店を除外することで、マンネリ防止になります。
        </div>

        <button
          onClick={handlePick}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white text-lg transition-all
            ${loading ? "bg-gray-400" : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg active:scale-95"}`}
        >
          {spinning ? (
            <span className="inline-flex items-center gap-2">
              <span className="animate-spin">🎲</span> 抽選中...
            </span>
          ) : (
            "🎲 お店を抽選する！"
          )}
        </button>
      </div>

      {/* 結果 */}
      {message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
          ⚠️ {message}
        </div>
      )}

      {picked.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800">
            ✨ 抽選結果 ({picked.length}件)
          </h2>
          <p className="text-sm text-gray-500">
            これらのお店が候補として選ばれました！
            イベントを作成して投票に使うこともできます。
          </p>
          {picked.map((r, i) => (
            <div key={r.id} className="relative">
              {i === 0 && (
                <div className="absolute -top-2 -left-2 z-10 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  イチオシ
                </div>
              )}
              <RestaurantCard restaurant={r} showVisitInfo />
            </div>
          ))}
          <button
            onClick={handlePick}
            className="w-full border-2 border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-xl py-3 text-sm font-medium"
          >
            🔄 もう一度抽選する
          </button>
        </div>
      )}
    </div>
  );
}
