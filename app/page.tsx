import Link from "next/link";

const features = [
  {
    href: "/restaurants",
    icon: "🍽️",
    title: "お店管理",
    description: "飲み会候補のお店を登録・管理します。ジャンル・価格帯・場所などを記録できます。",
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    href: "/events",
    icon: "📅",
    title: "イベント作成・投票",
    description: "飲み会イベントを作成し、候補店を設定。メンバーが投票して民主的にお店を決定！",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    href: "/pick",
    icon: "🎲",
    title: "ランダム抽選",
    description: "ジャンルや価格帯でフィルターして、AIがお店をランダムに提案。最近行った店は自動除外。",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
  {
    href: "/history",
    icon: "📖",
    title: "訪問履歴",
    description: "過去に行ったお店の記録。満足度・参加人数・コメントを残して次回の参考に。",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          🍻 飲み会ピッカー
        </h1>
        <p className="text-lg text-gray-500">
          会社の飲み会のお店選びを、もっとかんたんに・楽しく
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`block p-6 rounded-xl border-2 transition-colors ${f.color}`}
          >
            <div className="text-3xl mb-2">{f.icon}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{f.title}</h2>
            <p className="text-gray-600 text-sm">{f.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
        <h3 className="font-bold text-gray-800 mb-3">💡 使い方の流れ</h3>
        <ol className="space-y-2 list-decimal list-inside">
          <li>
            <span className="font-medium">お店を登録</span> — 候補になりそうなお店を「お店管理」に追加
          </li>
          <li>
            <span className="font-medium">イベントを作成</span> — 幹事がイベントを作り、候補店を選ぶ
          </li>
          <li>
            <span className="font-medium">メンバーが投票</span> — 各自が行きたい店に投票
          </li>
          <li>
            <span className="font-medium">お店を決定</span> — 最多票 or ランダム抽選で決定！
          </li>
          <li>
            <span className="font-medium">履歴に記録</span> — 感想・評価を残して次回に活かす
          </li>
        </ol>
      </div>
    </div>
  );
}
