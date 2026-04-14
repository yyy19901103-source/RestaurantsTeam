import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const eventId = parseInt(id);
  const body = await request.json();
  const { visited_date, participant_count, rating, comment } = body;

  const event = db
    .prepare(`SELECT * FROM events WHERE id = ?`)
    .get(eventId) as { decided_restaurant_id: number | null; status: string } | undefined;

  if (!event) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }
  if (!event.decided_restaurant_id) {
    return NextResponse.json(
      { error: "まだお店が決定していません" },
      { status: 400 }
    );
  }

  const completeTransaction = db.transaction(() => {
    db.prepare(
      `UPDATE events SET status = 'done', updated_at = datetime('now','localtime') WHERE id = ?`
    ).run(eventId);

    db.prepare(
      `INSERT INTO visit_history (restaurant_id, event_id, visited_date, participant_count, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      event.decided_restaurant_id,
      eventId,
      visited_date ?? new Date().toISOString().split("T")[0],
      participant_count ?? null,
      rating ?? null,
      comment ?? null
    );
  });

  completeTransaction();

  return NextResponse.json({ success: true });
}
