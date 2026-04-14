"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RestaurantCard from "@/components/RestaurantCard";
import { Event, Restaurant, VoteSummary, PRICE_RANGE_LABELS } from "@/lib/types";

type EventDetail = Event & {
  decided_restaurant_name?: string;
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [voteSummary, setVoteSummary] = useState<VoteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // 投票フォーム
  const [voterName, setVoterName] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [voteComment, setVoteComment] = useState("");
  const [votingSubmitting, setVotingSubmitting] = useState(false);

  // 候補追加
  const [showAddCandidates, setShowAddCandidates] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);

  // 完了モーダル
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    visited_date: new Date().toISOString().split("T")[0],
    participant_count: "",
    rating: "",
    comment: "",
  });

  const fetchData = useCallback(async () => {
    const [eventRes, allRes, votesRes] = await Promise.all([
      fetch(`/api/events/${eventId}`),
      fetch("/api/restaurants"),
      fetch(`/api/events/${eventId}/votes`),
    ]);
    const eventData = await eventRes.json();
    const allData = await allRes.json();
    const votesData = await votesRes.json();

    setEvent(eventData);
    setAllRestaurants(allData);
    setVoteSummary(votesData.summary ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const candidateIds = new Set(event?.candidates?.map((r) => r.id) ?? []);
  const nonCandidates = allRestaurants.filter((r) => !candidateIds.has(r.id));

  const handleAddCandidates = async () => {
    if (selectedCandidateIds.length === 0) return;
    await fetch(`/api/events/${eventId}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_ids: selectedCandidateIds }),
    });
    setSelectedCandidateIds([]);
    setShowAddCandidates(false);
    fetchData();
  };

  const handleRemoveCandidate = async (restaurantId: number) => {
    await fetch(`/api/events/${eventId}/candidates`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: restaurantId }),
    });
    fetchData();
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName || !selectedRestaurantId) return;
    setVotingSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: selectedRestaurantId,
          voter_name: voterName,
          comment: voteComment || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setVoteComment("");
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "投票に失敗しました");
    } finally {
      setVotingSubmitting(false);
    }
  };

  const handleDecide = async (restaurantId: number) => {
    const restaurant = event?.candidates?.find((r) => r.id === restaurantId);
    if (!confirm(`「${restaurant?.name}」に決定しますか？`)) return;
    await fetch(`/api/events/${eventId}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: restaurantId }),
    });
    fetchData();
  };

  const handleDecideRandom = async () => {
    if (!event?.candidates?.length) return;
    const candidates = event.candidates;

    // weight by votes
    const voteMap = new Map(voteSummary.map((v) => [v.restaurant_id, v.vote_count]));
    const weighted = candidates.map((r) => ({
      r,
      w: (voteMap.get(r.id) ?? 0) + 1,
    }));
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let rand = Math.random() * total;
    let picked = weighted[0].r;
    for (const { r, w } of weighted) {
      rand -= w;
      if (rand <= 0) { picked = r; break; }
    }

    if (!confirm(`ランダム抽選の結果：「${picked.name}」に決定しますか？`)) return;
    await fetch(`/api/events/${eventId}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: picked.id }),
    });
    fetchData();
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/events/${eventId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...completeForm,
        participant_count: completeForm.participant_count ? Number(completeForm.participant_count) : undefined,
        rating: completeForm.rating ? Number(completeForm.rating) : undefined,
      }),
    });
    if (!res.ok) { alert((await res.json()).error); return; }
    setShowCompleteForm(false);
    fetchData();
  };

  if (loading) return <div className="text-center text-gray-400 py-12">読み込み中...</div>;
  if (!event) return <div className="text-center text-red-400 py-12">イベントが見つかりません</div>;

  const isVoting = event.status === "voting";
  const isDecided = event.status === "decided";
  const isDone = event.status === "done";
  const maxVotes = voteSummary[0]?.vote_count ?? 0;

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/events" className="text-sm text-gray-400 hover:text-gray-600">← イベント一覧</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{event.title}</h1>
          <div className="text-sm text-gray-500 flex flex-wrap gap-3 mt-1">
            <span>幹事: {event.organizer}</span>
            {event.scheduled_date && <span>予定日: {event.scheduled_date}</span>}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isVoting ? "bg-blue-100 text-blue-700" :
              isDecided ? "bg-green-100 text-green-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {isVoting ? "投票中" : isDecided ? "決定済み" : "完了"}
            </span>
          </div>
          {event.description && <p className="text-sm text-gray-500 mt-1">{event.description}</p>}
        </div>
      </div>

      {/* 決定・完了済み */}
      {(isDecided || isDone) && event.decided_restaurant_name && (
        <div className={`rounded-xl p-5 border-2 ${isDone ? "bg-gray-50 border-gray-200" : "bg-green-50 border-green-300"}`}>
          <h2 className="font-bold text-lg mb-1">
            🎉 決定したお店
          </h2>
          <p className="text-2xl font-bold text-green-700">{event.decided_restaurant_name}</p>
          {isDecided && (
            <button
              onClick={() => setShowCompleteForm(true)}
              className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              飲み会完了を記録する
            </button>
          )}
        </div>
      )}

      {/* 完了フォーム */}
      {showCompleteForm && (
        <div className="bg-white rounded-xl border border-green-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">飲み会完了を記録</h2>
          <form onSubmit={handleComplete} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">訪問日 *</label>
                <input
                  type="date"
                  value={completeForm.visited_date}
                  onChange={(e) => setCompleteForm({ ...completeForm, visited_date: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参加人数</label>
                <input
                  type="number"
                  value={completeForm.participant_count}
                  onChange={(e) => setCompleteForm({ ...completeForm, participant_count: e.target.value })}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="例：10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">満足度</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCompleteForm({ ...completeForm, rating: String(n) })}
                    className={`text-2xl transition-transform hover:scale-110 ${Number(completeForm.rating) >= n ? "opacity-100" : "opacity-30"}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">コメント</label>
              <textarea
                value={completeForm.comment}
                onChange={(e) => setCompleteForm({ ...completeForm, comment: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="料理の感想、次回もOKかどうか等"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg text-sm">
                記録する
              </button>
              <button type="button" onClick={() => setShowCompleteForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 候補店 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">🍽️ 候補店 ({event.candidates?.length ?? 0}件)</h2>
            {isVoting && (
              <button
                onClick={() => setShowAddCandidates(!showAddCandidates)}
                className="text-sm text-orange-600 hover:underline"
              >
                ＋ 候補を追加
              </button>
            )}
          </div>

          {showAddCandidates && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <p className="text-sm font-medium text-gray-700 mb-2">追加する店を選択</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nonCandidates.length === 0 ? (
                  <p className="text-sm text-gray-400">追加できるお店がありません</p>
                ) : nonCandidates.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCandidateIds.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCandidateIds([...selectedCandidateIds, r.id]);
                        else setSelectedCandidateIds(selectedCandidateIds.filter((x) => x !== r.id));
                      }}
                      className="accent-orange-500"
                    />
                    <span>{r.name}</span>
                    <span className="text-gray-400 text-xs">({r.genre} / {PRICE_RANGE_LABELS[r.price_range]})</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddCandidates}
                  disabled={selectedCandidateIds.length === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  追加 ({selectedCandidateIds.length}件)
                </button>
                <button
                  onClick={() => { setShowAddCandidates(false); setSelectedCandidateIds([]); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {event.candidates?.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">候補店を追加してください</p>
          ) : (
            event.candidates?.map((r) => {
              const voteInfo = voteSummary.find((v) => v.restaurant_id === r.id);
              const isDecidedRestaurant = event.decided_restaurant_id === r.id;
              return (
                <div
                  key={r.id}
                  className={`relative ${isDecidedRestaurant ? "ring-2 ring-green-400" : ""} rounded-xl`}
                >
                  {voteInfo && (
                    <div className="absolute -top-1 -right-1 z-10 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {voteInfo.vote_count}
                    </div>
                  )}
                  <RestaurantCard
                    restaurant={r}
                    showVisitInfo
                    onDelete={isVoting ? () => handleRemoveCandidate(r.id) : undefined}
                  />
                  {isVoting && (
                    <div className="flex gap-2 px-4 pb-3">
                      <button
                        onClick={() => setSelectedRestaurantId(r.id)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          selectedRestaurantId === r.id
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 hover:bg-orange-100 text-gray-600"
                        }`}
                      >
                        {selectedRestaurantId === r.id ? "✓ 選択中" : "投票する"}
                      </button>
                      <button
                        onClick={() => handleDecide(r.id)}
                        className="text-xs px-3 py-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 font-medium"
                      >
                        ここに決定
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isVoting && (event.candidates?.length ?? 0) >= 2 && (
            <button
              onClick={handleDecideRandom}
              className="w-full border-2 border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 rounded-xl py-3 text-sm font-medium"
            >
              🎲 ランダム抽選で決める（投票数を重み付き）
            </button>
          )}
        </div>

        {/* 投票 */}
        <div className="space-y-3">
          {/* 投票フォーム */}
          {isVoting && (event.candidates?.length ?? 0) > 0 && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <h2 className="font-bold text-gray-800 mb-3">🗳️ 投票する</h2>
              <form onSubmit={handleVote} className="space-y-2">
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  required
                  placeholder="あなたの名前 *"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500">
                  {selectedRestaurantId
                    ? `選択中: ${event.candidates?.find((r) => r.id === selectedRestaurantId)?.name}`
                    : "← 候補店の「投票する」ボタンを押してください"}
                </p>
                <textarea
                  value={voteComment}
                  onChange={(e) => setVoteComment(e.target.value)}
                  rows={2}
                  placeholder="コメント（任意）"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  disabled={!voterName || !selectedRestaurantId || votingSubmitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {votingSubmitting ? "投票中..." : "投票する"}
                </button>
              </form>
            </div>
          )}

          {/* 投票結果 */}
          <div>
            <h2 className="font-bold text-gray-800 mb-2">📊 投票結果</h2>
            {voteSummary.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">まだ投票がありません</p>
            ) : (
              <div className="space-y-2">
                {voteSummary.map((s, i) => (
                  <div key={s.restaurant_id} className="bg-white rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold w-6 text-center ${i === 0 ? "text-yellow-500" : "text-gray-400"}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{s.restaurant_name}</span>
                          <span className="font-bold text-orange-600">{s.vote_count}票</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-orange-400 h-1.5 rounded-full transition-all"
                            style={{ width: `${maxVotes > 0 ? (s.vote_count / maxVotes) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{s.voters.join("、")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
