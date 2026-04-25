import SimulationClient from "./SimulationClient";

export const metadata = {
  title: "人生シミュレーション",
  description: "2026〜2076年 50年間マルチエージェント人生シミュレーション",
};

export default function SimulationPage() {
  return (
    <div className="pb-12">
      <SimulationClient />
    </div>
  );
}
