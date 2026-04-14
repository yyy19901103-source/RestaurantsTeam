import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { Event, Restaurant } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const eventId = parseInt(id);

  const event = db
    .prepare(
      `SELECT e.*, r.name as decided_restaurant_name
       FROM events e
       LEFT JOIN restaurants r ON e.decided_restaurant_id = r.id
       WHERE e.id = ?`
    )
    .get(eventId) as Event | undefined;

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const candidates = db
    .prepare(
      `SELECT r.*, MAX(vh.visited_date) as last_visited, COUNT(vh.id) as visit_count
       FROM event_candidates ec
       JOIN restaurants r ON ec.restaurant_id = r.id
       LEFT JOIN visit_history vh ON r.id = vh.restaurant_id
       WHERE ec.event_id = ?
       GROUP BY r.id`
    )
    .all(eventId) as Restaurant[];

  event.candidates = candidates;

  return NextResponse.json(event);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  db.prepare(`DELETE FROM events WHERE id = ?`).run(parseInt(id));
  return NextResponse.json({ success: true });
}
