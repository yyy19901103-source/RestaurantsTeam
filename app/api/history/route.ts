import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { VisitHistory } from "@/lib/types";

export async function GET() {
  const db = getDb();
  const history = db
    .prepare(
      `SELECT vh.*, r.name as restaurant_name, e.title as event_title
       FROM visit_history vh
       JOIN restaurants r ON vh.restaurant_id = r.id
       LEFT JOIN events e ON vh.event_id = e.id
       ORDER BY vh.visited_date DESC`
    )
    .all() as VisitHistory[];
  return NextResponse.json(history);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { restaurant_id, visited_date, participant_count, rating, comment } =
    body;

  if (!restaurant_id || !visited_date) {
    return NextResponse.json(
      { error: "restaurant_id と visited_date は必須です" },
      { status: 400 }
    );
  }

  const result = db
    .prepare(
      `INSERT INTO visit_history (restaurant_id, visited_date, participant_count, rating, comment)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      restaurant_id,
      visited_date,
      participant_count ?? null,
      rating ?? null,
      comment ?? null
    );

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
