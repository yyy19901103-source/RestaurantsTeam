import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { Restaurant } from "@/lib/types";

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const {
    genre,
    price_range,
    exclude_recent_days = 30,
    count = 3,
    event_id,
  } = body;

  let query = `
    SELECT r.*, MAX(vh.visited_date) as last_visited, COUNT(vh.id) as visit_count
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
  if (exclude_recent_days > 0) {
    query += ` AND (r.id NOT IN (
      SELECT restaurant_id FROM visit_history
      WHERE visited_date >= date('now', '-${exclude_recent_days} days')
    ))`;
  }

  // exclude already-decided candidates if event provided
  if (event_id) {
    query += ` AND r.id NOT IN (
      SELECT restaurant_id FROM event_candidates WHERE event_id = ?
    )`;
    params.push(event_id);
  }

  query += ` GROUP BY r.id`;

  const allRestaurants = db.prepare(query).all(...params) as (Restaurant & {
    visit_count: number;
  })[];

  if (allRestaurants.length === 0) {
    return NextResponse.json({ picked: [], message: "条件に合うお店がありません" });
  }

  // weighted random: less visited = higher weight
  const maxVisits = Math.max(...allRestaurants.map((r) => r.visit_count || 0));
  const weighted = allRestaurants.map((r) => ({
    restaurant: r,
    weight: maxVisits - (r.visit_count || 0) + 1,
  }));

  const picked: Restaurant[] = [];
  const available = [...weighted];

  for (let i = 0; i < Math.min(count, available.length); i++) {
    const totalWeight = available.reduce((sum, w) => sum + w.weight, 0);
    let rand = Math.random() * totalWeight;
    let idx = 0;
    for (let j = 0; j < available.length; j++) {
      rand -= available[j].weight;
      if (rand <= 0) {
        idx = j;
        break;
      }
    }
    picked.push(available[idx].restaurant);
    available.splice(idx, 1);
  }

  return NextResponse.json({ picked });
}
