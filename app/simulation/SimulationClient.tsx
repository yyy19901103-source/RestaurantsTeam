"use client";

import { useState, useRef, useCallback } from "react";
import type { YearResult, ScenarioType, LifeDomains } from "@/lib/simulation/types";

// ── helpers ────────────────────────────────────────────────────────────────

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  baseline: "基準線シナリオ",
  positive: "良い方向シナリオ",
  warning: "警戒シナリオ",
};

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  baseline: "blue",
  positive: "green",
  warning: "amber",
};

const SCENARIO_DESCRIPTIONS: Record<ScenarioType, string> = {
  baseline: "強みと弱みが両方発現する自然な展開。試練あり、成長あり、停滞あり。",
  positive: "強みが最大発揮される。パートナーとの絆、キャリアでの実績、精神的成熟。",
  warning: "脆弱性（感情揺れ戻し・喪失時の自己破壊）が発動するリスクを含む展開。",
};

const DOMAIN_LABELS: (keyof LifeDomains)[] = [
  "夫婦関係", "仕事", "健康", "資産", "精神性", "学習", "対人関係", "生きる意味",
];

const DOMAIN_ICONS: Record<keyof LifeDomains, string> = {
  夫婦関係: "💑",
  仕事: "💼",
  健康: "💪",
  資産: "📈",
  精神性: "🪷",
  学習: "📚",
  対人関係: "🤝",
  生きる意味: "✨",
};

const CATEGORY_COLORS: Record<string, string> = {
  work: "bg-blue-100 text-blue-800",
  family: "bg-pink-100 text-pink-800",
  health: "bg-green-100 text-green-800",
  financial: "bg-yellow-100 text-yellow-800",
  spiritual: "bg-purple-100 text-purple-800",
  social: "bg-orange-100 text-orange-800",
  personal: "bg-gray-100 text-gray-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  work: "仕事",
  family: "家族",
  health: "健康",
  financial: "資産",
  spiritual: "精神",
  social: "対人",
  personal: "個人",
};

const SEVERITY_DOT: Record<string, string> = {
  minor: "w-2 h-2",
  moderate: "w-3 h-3",
  major: "w-4 h-4",
  crisis: "w-5 h-5",
};

const LIFE_PHASES = [
  { label: "仕事確立期", years: [2026, 2035], color: "bg-blue-400" },
  { label: "人生の峠", years: [2036, 2045], color: "bg-purple-400" },
  { label: "成熟・育成期", years: [2046, 2055], color: "bg-green-400" },
  { label: "退職移行期", years: [2056, 2065], color: "bg-amber-400" },
  { label: "老境・完成期", years: [2066, 2076], color: "bg-rose-400" },
];

// ── sub-components ──────────────────────────────────────────────────────────

function DomainBar({
  label,
  value,
  color,
}: {
  label: keyof LifeDomains;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-center">{DOMAIN_ICONS[label]}</span>
      <span className="w-16 text-gray-600 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value * 10))}%` }}
        />
      </div>
      <span className="w-5 text-right text-gray-500">{value}</span>
    </div>
  );
}

function EmotionBadge({ name, value }: { name: string; value: number }) {
  const intensity =
    value >= 8 ? "bg-red-100 text-red-800" :
    value >= 6 ? "bg-orange-100 text-orange-800" :
    value >= 4 ? "bg-yellow-100 text-yellow-800" :
    "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${intensity}`}>
      {name}
      <span className="font-bold">{value}</span>
    </span>
  );
}

function AgentPanel({ agents }: { agents: YearResult["agents"] }) {
  const [open, setOpen] = useState(false);

  const rows: { label: string; content: React.ReactNode }[] = [
    { label: "意味理解", content: <span className="text-gray-700">{agents.意味理解}</span> },
    { label: "文脈把握", content: <span className="text-gray-700">{agents.文脈把握}</span> },
    {
      label: "感情",
      content: (
        <div className="flex flex-wrap gap-1">
          {Object.entries(agents.感情).map(([k, v]) => (
            <EmotionBadge key={k} name={k} value={v as number} />
          ))}
        </div>
      ),
    },
    { label: "共感", content: <span className="text-gray-700">{agents.共感}</span> },
    { label: "創造性", content: <span className="text-gray-700">{agents.創造性}</span> },
    { label: "目的創出", content: <span className="text-gray-700">{agents.目的創出}</span> },
    { label: "意思", content: <span className="text-gray-700">{agents.意思}</span> },
    { label: "身体性", content: <span className="text-gray-700">{agents.身体性}</span> },
    { label: "暗黙知", content: <span className="text-gray-700">{agents.暗黙知}</span> },
    { label: "直感", content: <span className="text-gray-700">{agents.直感}</span> },
    { label: "倫理観", content: <span className="text-gray-700">{agents.倫理観}</span> },
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
      >
        <span>11エージェント出力</span>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="divide-y divide-gray-100">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-3 p-3 text-sm">
              <span className="w-20 shrink-0 font-medium text-indigo-700 text-xs pt-0.5">
                {r.label}
              </span>
              <div className="flex-1 min-w-0">{r.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationPanel({ integration }: { integration: YearResult["integration"] }) {
  const [open, setOpen] = useState(false);

  const fields: { label: string; value: string; accent?: boolean }[] = [
    { label: "状況認識", value: integration.situation },
    { label: "最重要論点", value: integration.key_issue, accent: true },
    { label: "内的衝突", value: integration.conflict },
    { label: "最終判断", value: integration.decision, accent: true },
    { label: "行動", value: integration.action },
    { label: "判断理由", value: integration.reasoning },
    { label: "将来への影響", value: integration.future_impact, accent: true },
  ];

  return (
    <div className="border border-indigo-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm font-medium text-indigo-800"
      >
        <span>統合エージェント：意思決定</span>
        <span className="text-indigo-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="divide-y divide-indigo-100">
          {fields.map((f) => (
            <div key={f.label} className="flex gap-3 p-3 text-sm">
              <span className={`w-24 shrink-0 font-medium text-xs pt-0.5 ${f.accent ? "text-indigo-700" : "text-gray-600"}`}>
                {f.label}
              </span>
              <span className={`flex-1 ${f.accent ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                {f.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function YearCard({
  result,
  scenarioColor,
}: {
  result: YearResult;
  scenarioColor: string;
}) {
  const domainColor =
    scenarioColor === "green"
      ? "bg-green-500"
      : scenarioColor === "amber"
        ? "bg-amber-500"
        : "bg-blue-500";

  const avgDomain =
    Object.values(result.domains).reduce((a, b) => a + b, 0) /
    Object.values(result.domains).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{result.life_phase}</p>
          <p className="text-2xl font-bold text-gray-900">
            {result.year}年
            <span className="text-lg font-normal text-gray-500 ml-2">
              {result.age}歳
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">総合状態</div>
          <div className={`text-2xl font-bold ${avgDomain >= 7 ? "text-green-600" : avgDomain >= 5 ? "text-blue-600" : "text-amber-600"}`}>
            {avgDomain.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
        <p className="text-gray-800 leading-relaxed italic">{result.narrative}</p>
        {result.branch_note && (
          <p className="mt-2 text-xs text-amber-700 font-medium">
            ⚡ {result.branch_note}
          </p>
        )}
      </div>

      {/* Events */}
      {result.events && result.events.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            主要イベント
          </h4>
          {result.events.map((ev, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2 rounded-lg ${ev.is_positive ? "bg-green-50" : "bg-red-50"}`}
            >
              <span
                className={`mt-1.5 rounded-full shrink-0 ${SEVERITY_DOT[ev.severity] ?? "w-3 h-3"} ${ev.is_positive ? "bg-green-500" : "bg-red-400"}`}
              />
              <div className="flex-1 min-w-0">
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded mr-1 ${CATEGORY_COLORS[ev.category] ?? "bg-gray-100 text-gray-700"}`}>
                  {CATEGORY_LABELS[ev.category] ?? ev.category}
                </span>
                <span className="text-sm text-gray-800">{ev.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Life Domains */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          生活領域スコア
        </h4>
        {DOMAIN_LABELS.map((d) => (
          <DomainBar
            key={d}
            label={d}
            value={result.domains[d] ?? 5}
            color={domainColor}
          />
        ))}
      </div>

      {/* Integration */}
      <IntegrationPanel integration={result.integration} />

      {/* Agents */}
      <AgentPanel agents={result.agents} />
    </div>
  );
}

// ── Timeline bar (mini) ─────────────────────────────────────────────────────

function TimelineMini({
  results,
  selectedYear,
  onSelect,
  scenario,
}: {
  results: YearResult[];
  selectedYear: number | null;
  onSelect: (year: number) => void;
  scenario: ScenarioType;
}) {
  const color =
    scenario === "positive"
      ? "bg-green-500"
      : scenario === "warning"
        ? "bg-amber-500"
        : "bg-blue-500";

  return (
    <div className="space-y-2">
      {/* Phase labels */}
      <div className="flex">
        {LIFE_PHASES.map((phase) => (
          <div
            key={phase.label}
            className="flex-1 text-center"
            style={{ flex: phase.years[1] - phase.years[0] + 1 }}
          >
            <div className={`h-1 ${phase.color} rounded`} />
            <div className="text-xs text-gray-500 mt-0.5 truncate px-0.5">
              {phase.label}
            </div>
          </div>
        ))}
      </div>

      {/* Year dots */}
      <div className="flex gap-0.5 flex-wrap">
        {Array.from({ length: 51 }, (_, i) => 2026 + i).map((year) => {
          const r = results.find((r) => r.year === year);
          const isSelected = selectedYear === year;
          const hasData = !!r;
          const avg = r
            ? Object.values(r.domains).reduce((a, b) => a + b, 0) /
              Object.values(r.domains).length
            : null;
          const heightClass =
            avg === null
              ? "h-4 bg-gray-200"
              : avg >= 8
                ? "h-8 " + color
                : avg >= 6
                  ? "h-6 " + color
                  : avg >= 4
                    ? "h-4 " + color
                    : "h-2 bg-red-400";

          return (
            <button
              key={year}
              onClick={() => hasData && onSelect(year)}
              title={`${year}年 ${r?.age ?? ""}歳`}
              className={`flex-1 min-w-0 rounded-sm transition-all duration-150 ${heightClass} ${
                isSelected ? "ring-2 ring-offset-1 ring-gray-800" : ""
              } ${hasData ? "cursor-pointer hover:opacity-75" : "cursor-default opacity-40"}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>2026年 (35歳)</span>
        <span>2076年 (85歳)</span>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function SimulationClient() {
  const [scenario, setScenario] = useState<ScenarioType>("baseline");
  const [results, setResults] = useState<YearResult[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const selectedResult = results.find((r) => r.year === selectedYear) ?? null;

  const startSimulation = useCallback(async () => {
    if (running) return;

    // Abort any previous run
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setResults([]);
    setSelectedYear(null);
    setProgress(0);
    setError(null);

    try {
      const response = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const chunk = JSON.parse(trimmed);
            if (chunk.type === "year") {
              const yr = chunk.data as YearResult;
              setResults((prev) => {
                const next = [...prev, yr].sort((a, b) => a.year - b.year);
                return next;
              });
              setProgress(Math.round(((yr.year - 2025) / 51) * 100));
              // Auto-select first year
              setSelectedYear((prev) => prev ?? yr.year);
            } else if (chunk.type === "error") {
              setError(chunk.data.error);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setRunning(false);
    }
  }, [scenario, running]);

  const stopSimulation = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  const colorScheme = SCENARIO_COLORS[scenario];
  const btnBase =
    colorScheme === "green"
      ? "bg-green-600 hover:bg-green-700"
      : colorScheme === "amber"
        ? "bg-amber-600 hover:bg-amber-700"
        : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🧬</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              人生シミュレーション
            </h1>
            <p className="text-gray-500 mt-1">
              2026〜2076年・50年間・13エージェント並列
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          シナリオ選択
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["baseline", "positive", "warning"] as ScenarioType[]).map((s) => {
            const c = SCENARIO_COLORS[s];
            const active = scenario === s;
            const border =
              c === "green"
                ? active
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
                : c === "amber"
                  ? active
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-amber-300"
                  : active
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300";

            return (
              <button
                key={s}
                onClick={() => !running && setScenario(s)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${border} ${running ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="font-semibold text-gray-900 mb-1">
                  {SCENARIO_LABELS[s]}
                </div>
                <div className="text-xs text-gray-500">
                  {SCENARIO_DESCRIPTIONS[s]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!running ? (
          <button
            onClick={startSimulation}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${btnBase}`}
          >
            シミュレーション開始
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            停止
          </button>
        )}

        {running && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>
              シミュレーション中… {results.length}/51年
            </span>
          </div>
        )}

        {!running && results.length > 0 && (
          <span className="text-sm text-gray-500">
            {results.length}年分完了
          </span>
        )}
      </div>

      {/* Progress bar */}
      {running && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              colorScheme === "green" ? "bg-green-500" : colorScheme === "amber" ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <strong>エラー：</strong> {error}
        </div>
      )}

      {/* Timeline */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            人生タイムライン（クリックで詳細表示）
          </h2>
          <TimelineMini
            results={results}
            selectedYear={selectedYear}
            onSelect={setSelectedYear}
            scenario={scenario}
          />
        </div>
      )}

      {/* Year Detail */}
      {selectedResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700">
              {selectedResult.year}年 詳細
            </h2>
            <div className="flex gap-1">
              {results.map((r) => (
                <button
                  key={r.year}
                  onClick={() => setSelectedYear(r.year)}
                  className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                    r.year === selectedYear
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {r.year}
                </button>
              ))}
            </div>
          </div>
          <YearCard result={selectedResult} scenarioColor={colorScheme} />
        </div>
      )}

      {/* No results yet */}
      {!running && results.length === 0 && (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-500">
            シナリオを選択して「シミュレーション開始」を押してください
          </p>
          <p className="text-xs text-gray-400 mt-2">
            ※ ANTHROPIC_API_KEY が必要です。50年分の生成に数分かかります。
          </p>
        </div>
      )}
    </div>
  );
}
