export type PriceRange = "~2000" | "2000~4000" | "4000~6000" | "6000~";
export type EventStatus = "voting" | "decided" | "done";

export interface Restaurant {
  id: number;
  name: string;
  genre: string;
  price_range: PriceRange;
  location: string;
  capacity: number | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_visited?: string | null;
  visit_count?: number;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  organizer: string;
  scheduled_date: string | null;
  status: EventStatus;
  decided_restaurant_id: number | null;
  created_at: string;
  updated_at: string;
  decided_restaurant?: Restaurant;
  candidates?: Restaurant[];
  vote_count?: number;
}

export interface Vote {
  id: number;
  event_id: number;
  restaurant_id: number;
  voter_name: string;
  comment: string | null;
  created_at: string;
  restaurant_name?: string;
}

export interface VoteSummary {
  restaurant_id: number;
  restaurant_name: string;
  vote_count: number;
  voters: string[];
}

export interface VisitHistory {
  id: number;
  restaurant_id: number;
  event_id: number | null;
  visited_date: string;
  participant_count: number | null;
  rating: number | null;
  comment: string | null;
  created_at: string;
  restaurant_name?: string;
  event_title?: string | null;
}

export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  "~2000": "〜¥2,000",
  "2000~4000": "¥2,000〜¥4,000",
  "4000~6000": "¥4,000〜¥6,000",
  "6000~": "¥6,000〜",
};

export const GENRE_OPTIONS = [
  "居酒屋",
  "和食",
  "洋食",
  "イタリアン",
  "フレンチ",
  "中華",
  "焼肉",
  "焼き鳥",
  "鍋",
  "寿司",
  "海鮮",
  "ラーメン",
  "その他",
];
