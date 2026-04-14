import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { Event } from "@/lib/types";

export async function GET() {
  const db = getDb();
  const events = db
    .prepare(
      `SELECT e.*, r.name as decided_restaurant_name,
        (SELECT COUNT(*) FROM votes v WHERE v.event_id = e.id) as vote_count
       FROM events e
       LEFT JOIN restaurants r ON e.decided_restaurant_id = r.id
       ORDER BY e.created_at DESC`
    )
    .all() as Event[];
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { title, description, organizer, scheduled_date } = body;

  if (!title || !organizer) {
    return NextResponse.json(
      { error: "title と organizer は必須です" },
      { status: 400 }
    );
  }

  const result = db
    .prepare(
      `INSERT INTO events (title, description, organizer, scheduled_date)
       VALUES (?, ?, ?, ?)`
    )
    .run(title, description ?? null, organizer, scheduled_date ?? null);

  const event = db
    .prepare(`SELECT * FROM events WHERE id = ?`)
    .get(result.lastInsertRowid) as Event;

  return NextResponse.json(event, { status: 201 });
}
