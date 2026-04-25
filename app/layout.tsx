import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "飲み会お店ピッカー",
  description: "会社の飲み会でお店をかんたんに選べるツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-orange-500 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-wide hover:opacity-90">
              🍻 飲み会ピッカー
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              <Link href="/restaurants" className="hover:underline opacity-90 hover:opacity-100">
                お店管理
              </Link>
              <Link href="/events" className="hover:underline opacity-90 hover:opacity-100">
                イベント
              </Link>
              <Link href="/pick" className="hover:underline opacity-90 hover:opacity-100">
                ランダム抽選
              </Link>
              <Link href="/history" className="hover:underline opacity-90 hover:opacity-100">
                訪問履歴
              </Link>
              <Link href="/simulation" className="hover:underline opacity-90 hover:opacity-100 border-l border-orange-300 pl-4">
                人生シミュレーション
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-4">
          飲み会ピッカー &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
