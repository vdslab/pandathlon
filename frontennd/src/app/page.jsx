import Link from "next/link";
import { createClient } from "../utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get some featured quizzes
  const { data: featuredQuizzes } = await supabase
    .from("quizzes")
    .select("id, title, description")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero section */}
      <div className="hero min-h-[50vh] bg-base-200 rounded-lg mb-8">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-4">カス診断</h1>
            <p className="text-xl mb-6">
              あなただけの性格診断を
              <br className="block md:hidden" />
              作成・共有しよう
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <Link href="/mypage/quizzes/new" className="btn btn-accent">
                  診断を作る
                </Link>
              ) : (
                <Link href="/signup" className="btn btn-accent">
                  無料で始める
                </Link>
              )}
              <Link href="/quizzes" className="btn btn-outline">
                診断を探す
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-4xl mb-2">🎯</div>
            <h2 className="card-title">簡単作成</h2>
            <p>テーマと結果タイプを入力するだけで、AIが質問を自動生成</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-4xl mb-2">🔍</div>
            <h2 className="card-title">ログイン不要</h2>
            <p>診断を受けるのにログインは不要。気軽に楽しめます</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-4xl mb-2">📊</div>
            <h2 className="card-title">結果をシェア</h2>
            <p>診断結果をSNSで簡単にシェアして友達と共有</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">診断を探す</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/quizzes/hot"
            className="card bg-gradient-to-r from-amber-400 to-red-400 text-white shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <h3 className="card-title text-2xl">🔥 人気の診断</h3>
              <p>みんなが受けている話題の診断をチェック</p>
            </div>
          </Link>
          <Link
            href="/quizzes/recent"
            className="card bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <h3 className="card-title text-2xl">✨ 最近の診断</h3>
              <p>最新の診断をいち早く体験</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Featured quizzes */}
      {featuredQuizzes && featuredQuizzes.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">注目の診断</h2>
          <div className="grid gap-4">
            {featuredQuizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body">
                  <h3 className="card-title">{quiz.title}</h3>
                  <p className="text-base-content/70">{quiz.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/quizzes" className="btn btn-outline">
              すべての診断を見る →
            </Link>
          </div>
        </div>
      )}

      {/* My page or Login link */}
      <div className="mb-12">
        {user ? (
          <Link
            href="/mypage"
            className="card bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <h3 className="card-title text-2xl">👤 マイページ</h3>
              <p>あなたの診断、履歴、お気に入りを管理</p>
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className="card bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <h3 className="card-title text-2xl">🔑 ログイン</h3>
              <p>診断を作成・管理するにはログインが必要です</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
