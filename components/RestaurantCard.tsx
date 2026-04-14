"use client";

import { Restaurant, PRICE_RANGE_LABELS } from "@/lib/types";

interface Props {
  restaurant: Restaurant;
  onEdit?: () => void;
  onDelete?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  showVisitInfo?: boolean;
}

const GENRE_COLORS: Record<string, string> = {
  居酒屋: "bg-amber-100 text-amber-800",
  和食: "bg-red-100 text-red-800",
  洋食: "bg-blue-100 text-blue-800",
  イタリアン: "bg-green-100 text-green-800",
  フレンチ: "bg-purple-100 text-purple-800",
  中華: "bg-yellow-100 text-yellow-800",
  焼肉: "bg-rose-100 text-rose-800",
  "焼き鳥": "bg-orange-100 text-orange-800",
  鍋: "bg-teal-100 text-teal-800",
  寿司: "bg-pink-100 text-pink-800",
  海鮮: "bg-cyan-100 text-cyan-800",
};

export default function RestaurantCard({
  restaurant: r,
  onEdit,
  onDelete,
  selectable,
  selected,
  onSelect,
  showVisitInfo = true,
}: Props) {
  const genreColor = GENRE_COLORS[r.genre] ?? "bg-gray-100 text-gray-700";

  return (
    <div
      className={`bg-white rounded-xl border-2 p-4 transition-all ${
        selectable
          ? selected
            ? "border-orange-500 shadow-md cursor-pointer"
            : "border-gray-200 hover:border-orange-300 cursor-pointer"
          : "border-gray-200"
      }`}
      onClick={selectable ? onSelect : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-800 truncate">{r.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genreColor}`}>
              {r.genre}
            </span>
            {selectable && selected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-medium">
                選択中
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>💰 {PRICE_RANGE_LABELS[r.price_range]}</span>
            <span>📍 {r.location}</span>
            {r.capacity && <span>👥 〜{r.capacity}名</span>}
          </div>
          {r.notes && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">📝 {r.notes}</p>
          )}
          {showVisitInfo && (
            <div className="text-xs text-gray-400 mt-1 flex gap-3">
              {r.visit_count ? (
                <>
                  <span>訪問: {r.visit_count}回</span>
                  {r.last_visited && <span>最終: {r.last_visited}</span>}
                </>
              ) : (
                <span>まだ訪問なし</span>
              )}
            </div>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-1 shrink-0">
            {r.url && (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg text-sm"
                onClick={(e) => e.stopPropagation()}
                title="URLを開く"
              >
                🔗
              </a>
            )}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                title="編集"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg text-sm"
                title="削除"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
