"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Event } from "@/lib/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  voting: { label: "投票中", color: "bg-blue-100 text-blue-700" },
  decided: { label: "決定済み", color: "bg-green-100 text-green-700" },
  done: { label: "完了", color: "bg-gray-100 text-gray-600" },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", organizer: "", scheduled_date: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    setEvents(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setShowForm(false);
      setForm({ title: "", description: "", organizer: "", scheduled_date: "" });
      window.location.href = `/events/${created.id}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このイベントを削除してよいですか？")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📅 イベント</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          ＋ イベントを作成
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">イベントを作成</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                イベント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="例：2024年忘年会"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  幹事名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="例：田中"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">予定日</label>
                <input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="人数の目安や予算など"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {submitting ? "作成中..." : "作成する"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">読み込み中...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">📅</p>
          <p>イベントがまだありません</p>
          <p className="text-sm">「イベントを作成」ボタンから始めてください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const status = STATUS_LABELS[event.status] ?? STATUS_LABELS.voting;
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/events/${event.id}`}
                        className="font-bold text-gray-800 hover:text-orange-600 hover:underline"
                      >
                        {event.title}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-3">
                      <span>幹事: {event.organizer}</span>
                      {event.scheduled_date && <span>予定日: {event.scheduled_date}</span>}
                      <span>投票数: {event.vote_count ?? 0}票</span>
                    </div>
                    {event.status !== "voting" && (event as Event & { decided_restaurant_name?: string }).decided_restaurant_name && (
                      <p className="text-sm text-green-700 mt-1 font-medium">
                        🎉 決定: {(event as Event & { decided_restaurant_name?: string }).decided_restaurant_name}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link
                      href={`/events/${event.id}`}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg text-sm"
                      title="詳細を開く"
                    >
                      👁️
                    </Link>
                    {event.status === "voting" && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg text-sm"
                        title="削除"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
