export type ScenarioType = "baseline" | "positive" | "warning";

export type EventCategory =
  | "work"
  | "family"
  | "health"
  | "financial"
  | "spiritual"
  | "social"
  | "personal";

export type EventSeverity = "minor" | "moderate" | "major" | "crisis";

export interface SimulationEvent {
  category: EventCategory;
  severity: EventSeverity;
  description: string;
  is_positive: boolean;
}

export interface EmotionState {
  喜び: number;    // 0-10
  不安: number;    // 0-10
  怒り: number;    // 0-10
  恐れ: number;    // 0-10
  安心: number;    // 0-10
  喪失感: number;  // 0-10
}

export interface AgentOutputs {
  意味理解: string;
  文脈把握: string;
  感情: EmotionState;
  共感: string;
  創造性: string;
  目的創出: string;
  意思: string;
  身体性: string;
  暗黙知: string;
  直感: string;
  倫理観: string;
}

export interface IntegrationResult {
  situation: string;      // 状況認識
  key_issue: string;      // 最重要論点
  conflict: string;       // 内的衝突
  decision: string;       // 最終判断
  action: string;         // 行動
  reasoning: string;      // 判断理由
  future_impact: string;  // 将来への影響
}

export interface LifeDomains {
  夫婦関係: number;    // 0-10
  仕事: number;        // 0-10
  健康: number;        // 0-10
  資産: number;        // 0-10 (相対値)
  精神性: number;      // 0-10
  学習: number;        // 0-10
  対人関係: number;    // 0-10
  生きる意味: number;  // 0-10
}

export interface YearResult {
  year: number;
  age: number;
  life_phase: string;
  scenario: ScenarioType;
  events: SimulationEvent[];
  agents: AgentOutputs;
  integration: IntegrationResult;
  domains: LifeDomains;
  narrative: string;
  branch_note?: string;
}

export interface SimulationConfig {
  scenario: ScenarioType;
}

export interface StreamChunk {
  type: "year" | "meta" | "error" | "done";
  data: YearResult | { message: string } | { error: string };
}
