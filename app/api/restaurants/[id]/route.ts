import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { Restaurant } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const restaurant = db
    .prepare(
      `SELECT r.*, MAX(vh.visited_date) as last_visited, COUNT(vh.id) as visit_count
       FROM restaurants r
       LEFT JOIN visit_history vh ON r.id = vh.restaurant_id
       WHERE r.id = ?
       GROUP BY r.id`
    )
    .get(parseInt(id)) as Restaurant | undefined;

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(restaurant);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const body = await request.json();
  const { name, genre, price_range, location, capacity, url, notes } = body;

  if (!name || !genre || !price_range || !location) {
    return NextResponse.json(
      { error: "name, genre, price_range, location は必須です" },
      { status: 400 }
    );
  }

  db.prepare(
    `UPDATE restaurants SET name=?, genre=?, price_range=?, location=?, capacity=?, url=?, notes=?,
     updated_at=datetime('now','localtime') WHERE id=?`
  ).run(name, genre, price_range, location, capacity ?? null, url ?? null, notes ?? null, parseInt(id));

  const restaurant = db
    .prepare(`SELECT * FROM restaurants WHERE id = ?`)
    .get(parseInt(id)) as Restaurant;

  return NextResponse.json(restaurant);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  db.prepare(`DELETE FROM restaurants WHERE id = ?`).run(parseInt(id));
  return NextResponse.json({ success: true });
}
