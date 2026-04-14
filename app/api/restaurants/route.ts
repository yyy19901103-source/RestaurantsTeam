import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { Restaurant } from "@/lib/types";

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const price_range = searchParams.get("price_range");
  const exclude_recent_days = searchParams.get("exclude_recent_days");

  let query = `
    SELECT r.*,
      MAX(vh.visited_date) as last_visited,
      COUNT(vh.id) as visit_count
    FROM restaurants r
    LEFT JOIN visit_history vh ON r.id = vh.restaurant_id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (genre) {
    query += ` AND r.genre = ?`;
    params.push(genre);
  }
  if (price_range) {
    query += ` AND r.price_range = ?`;
    params.push(price_range);
  }
  if (exclude_recent_days) {
    const days = parseInt(exclude_recent_days);
    query += ` AND (r.id NOT IN (
      SELECT restaurant_id FROM visit_history
      WHERE visited_date >= date('now', '-${days} days')
    ))`;
  }

  query += ` GROUP BY r.id ORDER BY r.name`;

  const restaurants = db.prepare(query).all(...params) as Restaurant[];
  return NextResponse.json(restaurants);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { name, genre, price_range, location, capacity, url, notes } = body;

  if (!name || !genre || !price_range || !location) {
    return NextResponse.json(
      { error: "name, genre, price_range, location は必須です" },
      { status: 400 }
    );
  }

  const result = db
    .prepare(
      `INSERT INTO restaurants (name, genre, price_range, location, capacity, url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, genre, price_range, location, capacity ?? null, url ?? null, notes ?? null);

  const restaurant = db
    .prepare(`SELECT * FROM restaurants WHERE id = ?`)
    .get(result.lastInsertRowid) as Restaurant;

  return NextResponse.json(restaurant, { status: 201 });
}
