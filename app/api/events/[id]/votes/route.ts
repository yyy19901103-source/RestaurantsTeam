import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { Vote, VoteSummary } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const eventId = parseInt(id);

  const votes = db
    .prepare(
      `SELECT v.*, r.name as restaurant_name
       FROM votes v
       JOIN restaurants r ON v.restaurant_id = r.id
       WHERE v.event_id = ?
       ORDER BY v.created_at DESC`
    )
    .all(eventId) as Vote[];

  // aggregate by restaurant
  const summaryMap = new Map<number, VoteSummary>();
  for (const vote of votes) {
    if (!summaryMap.has(vote.restaurant_id)) {
      summaryMap.set(vote.restaurant_id, {
        restaurant_id: vote.restaurant_id,
        restaurant_name: vote.restaurant_name ?? "",
        vote_count: 0,
        voters: [],
      });
    }
    const s = summaryMap.get(vote.restaurant_id)!;
    s.vote_count++;
    s.voters.push(vote.voter_name);
  }

  const summary = Array.from(summaryMap.values()).sort(
    (a, b) => b.vote_count - a.vote_count
  );

  return NextResponse.json({ votes, summary });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const eventId = parseInt(id);
  const body = await request.json();
  const { restaurant_id, voter_name, comment } = body;

  if (!restaurant_id || !voter_name) {
    return NextResponse.json(
      { error: "restaurant_id と voter_name は必須です" },
      { status: 400 }
    );
  }

  // check candidate exists
  const candidate = db
    .prepare(
      `SELECT id FROM event_candidates WHERE event_id = ? AND restaurant_id = ?`
    )
    .get(eventId, restaurant_id);

  if (!candidate) {
    return NextResponse.json(
      { error: "その店舗はこのイベントの候補に含まれていません" },
      { status: 400 }
    );
  }

  try {
    const result = db
      .prepare(
        `INSERT OR REPLACE INTO votes (event_id, restaurant_id, voter_name, comment)
         VALUES (?, ?, ?, ?)`
      )
      .run(eventId, restaurant_id, voter_name, comment ?? null);

    const vote = db
      .prepare(`SELECT * FROM votes WHERE id = ?`)
      .get(result.lastInsertRowid) as Vote;

    return NextResponse.json(vote, { status: 201 });
  } catch {
    return NextResponse.json({ error: "投票に失敗しました" }, { status: 500 });
  }
}
