import Anthropic from "@anthropic-ai/sdk";
import {
  SIMULATION_SYSTEM_PROMPT,
  SCENARIO_DESCRIPTIONS,
} from "./character";
import { YearResult, ScenarioType } from "./types";

const client = new Anthropic();

function buildUserPrompt(scenario: ScenarioType): string {
  const scenarioDesc = SCENARIO_DESCRIPTIONS[scenario];
  const scenarioLabel =
    scenario === "baseline"
      ? "基準線"
      : scenario === "positive"
        ? "良い方向"
        : "警戒";

  return `
${scenarioDesc}

上記の「${scenarioLabel}シナリオ」として、しーくんの人生を2026年から2076年まで50年分シミュレートしてください。

各年を1つのJSONオブジェクト（1行）として出力してください。
50個のJSONオブジェクトを連続して出力してください。
コードブロック（\`\`\`）は使わないでください。
説明文や前置きは不要です。JSONだけを出力してください。

最初の行から最後の行まで、すべてJSON形式で出力してください。
`;
}

export async function* simulateLife(
  scenario: ScenarioType
): AsyncGenerator<YearResult> {
  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 80000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SIMULATION_SYSTEM_PROMPT,
        // Cache the large system prompt across repeated calls
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: buildUserPrompt(scenario),
      },
    ],
  });

  let buffer = "";
  let braceDepth = 0;
  let inString = false;
  let escapeNext = false;
  let jsonStart = -1;

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const text = event.delta.text;
      buffer += text;

      // Parse complete JSON objects from the buffer
      while (buffer.length > 0) {
        if (jsonStart === -1) {
          // Find next '{'
          const idx = buffer.indexOf("{");
          if (idx === -1) {
            buffer = "";
            break;
          }
          buffer = buffer.slice(idx);
          jsonStart = 0;
          braceDepth = 0;
          inString = false;
          escapeNext = false;
        }

        // Scan through buffer tracking brace depth
        let i = jsonStart === 0 && braceDepth === 0 ? 0 : 0;
        const startPos = 0;
        let found = false;

        for (i = startPos; i < buffer.length; i++) {
          const ch = buffer[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (ch === "\\" && inString) {
            escapeNext = true;
            continue;
          }

          if (ch === '"') {
            inString = !inString;
            continue;
          }

          if (inString) continue;

          if (ch === "{") {
            braceDepth++;
          } else if (ch === "}") {
            braceDepth--;
            if (braceDepth === 0) {
              // Found a complete JSON object
              const jsonStr = buffer.slice(0, i + 1);
              buffer = buffer.slice(i + 1);
              jsonStart = -1;
              braceDepth = 0;
              inString = false;
              escapeNext = false;
              found = true;

              try {
                const yearResult = JSON.parse(jsonStr) as YearResult;
                // Ensure scenario field is set
                yearResult.scenario = scenario;
                if (yearResult.year && yearResult.age) {
                  yield yearResult;
                }
              } catch {
                // Skip malformed JSON, continue
              }
              break;
            }
          }
        }

        if (!found) {
          // Incomplete JSON object, wait for more data
          break;
        }
      }
    }
  }

  // Process any remaining buffer content
  if (buffer.trim().startsWith("{")) {
    try {
      const yearResult = JSON.parse(buffer.trim()) as YearResult;
      yearResult.scenario = scenario;
      if (yearResult.year && yearResult.age) {
        yield yearResult;
      }
    } catch {
      // Ignore incomplete final object
    }
  }
}
