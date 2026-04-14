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
  const { restaurant_ids } = body;

  if (!Array.isArray(restaurant_ids) || restaurant_ids.length === 0) {
    return NextResponse.json(
      { error: "restaurant_ids は配列で指定してください" },
      { status: 400 }
    );
  }

  const insert = db.prepare(
    `INSERT OR IGNORE INTO event_candidates (event_id, restaurant_id) VALUES (?, ?)`
  );

  const insertMany = db.transaction((ids: number[]) => {
    for (const rid of ids) {
      insert.run(eventId, rid);
    }
  });

  insertMany(restaurant_ids);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const eventId = parseInt(id);
  const body = await request.json();
  const { restaurant_id } = body;

  db.prepare(
    `DELETE FROM event_candidates WHERE event_id = ? AND restaurant_id = ?`
  ).run(eventId, restaurant_id);

  return NextResponse.json({ success: true });
}
