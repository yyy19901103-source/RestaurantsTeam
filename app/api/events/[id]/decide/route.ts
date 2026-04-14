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
  const { restaurant_id } = body;

  if (!restaurant_id) {
    return NextResponse.json(
      { error: "restaurant_id は必須です" },
      { status: 400 }
    );
  }

  db.prepare(
    `UPDATE events SET decided_restaurant_id = ?, status = 'decided',
     updated_at = datetime('now','localtime') WHERE id = ?`
  ).run(restaurant_id, eventId);

  const event = db.prepare(`SELECT * FROM events WHERE id = ?`).get(eventId);
  return NextResponse.json(event);
}
