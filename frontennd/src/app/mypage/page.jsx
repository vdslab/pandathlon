import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "マイページ - カス診断",
  description: "あなたのダッシュボード",
};

export default async function MyPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's created quizzes count
  const { count: createdQuizzesCount } = await supabase
    .from("quizzes")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user.id);

  // Get user's answer count (from user_answers table)
  const { count: answersCount } = await supabase
    .from("user_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get user's bookmarks count
  const { count: bookmarksCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get pending quiz requests count
  const { count: pendingQuizzesCount } = await supabase
    .from("quiz_requests")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", user.id);

  // Get pending quiz requests (latest 3)
  const { data: pendingQuizzes } = await supabase
    .from("quiz_requests")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Get recent answers (latest 3) through user_answers table
  const { data: userAnswersData } = await supabase
    .from("user_answers")
    .select(
      `
      answer_id,
      created_at,
      answers!inner (
        id,
        quiz_id,
        quizzes (
          id,
          title
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Transform data structure to match previous format
  const recentAnswers =
    userAnswersData?.map((ua) => ({
      id: ua.answers.id,
      created_at: ua.created_at,
      quiz_id: ua.answers.quiz_id,
      quizzes: ua.answers.quizzes,
    })) || [];

  // Get recent bookmarks (latest 3)
  const { data: recentBookmarks } = await supabase
    .from("bookmarks")
    .select(
      `
      created_at,
      quiz_id,
      quizzes (
        id,
        title
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Get user metadata
  const userMetadata = user.user_metadata || {};
  const nickname =
    userMetadata.nickname || user.email?.split("@")[0] || "ユーザー";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">マイページ</h1>
        <div className="flex items-center gap-2 text-base-content/70">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-lg">{nickname}</span>
        </div>
        <p className="text-sm text-base-content/60 mt-1">{user.email}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-accent">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="stat-title">作成した診断</div>
            <div className="stat-value text-accent">
              {createdQuizzesCount || 0}
            </div>
            <div className="stat-desc">個</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div className="stat-title">受けた診断</div>
            <div className="stat-value text-secondary">{answersCount || 0}</div>
            <div className="stat-desc">回</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-error">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="stat-title">お気に入り</div>
            <div className="stat-value text-error">{bookmarksCount || 0}</div>
            <div className="stat-desc">個</div>
          </div>
        </div>
      </div>

      {/* Pending Quizzes Alert */}
      {pendingQuizzesCount && pendingQuizzesCount > 0 && (
        <div className="alert alert-warning mb-8">
          <svg
            className="w-6 h-6 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold">処理中の診断があります</h3>
            <p className="text-sm">
              {pendingQuizzesCount}件の診断が生成処理中です
            </p>
          </div>
          <Link href="/mypage/quizzes" className="btn btn-sm">
            詳細を見る
          </Link>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">クイックアクセス</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/mypage/quizzes/new"
            className="card bg-accent text-accent-content shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <h3 className="card-title text-lg">診断を作る</h3>
              <p className="text-sm opacity-80">新しい診断を作成</p>
            </div>
          </Link>

          <Link
            href="/mypage/history"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="card-title text-lg">診断履歴</h3>
              <p className="text-sm text-base-content/70">受けた診断を確認</p>
            </div>
          </Link>

          <Link
            href="/mypage/favorite"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 mb-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <h3 className="card-title text-lg">お気に入り</h3>
              <p className="text-sm text-base-content/70">お気に入りの診断</p>
            </div>
          </Link>

          <Link
            href="/quizzes"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="card-title text-lg">診断を探す</h3>
              <p className="text-sm text-base-content/70">新しい診断を発見</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Quizzes */}
        {pendingQuizzes && pendingQuizzes.length > 0 && (
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <svg
                  className="w-6 h-6 animate-spin text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                処理中の診断
              </h2>
              <Link href="/mypage/quizzes" className="btn btn-ghost btn-sm">
                すべて見る →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {pendingQuizzes.map((request) => {
                const content = request.content;
                return (
                  <div
                    key={request.id}
                    className="card bg-base-100 shadow border-2 border-warning"
                  >
                    <div className="card-body p-4">
                      <h3 className="font-semibold line-clamp-2">
                        {content.title}
                      </h3>
                      <div className="flex gap-2 text-xs text-base-content/60 mt-2">
                        <span>{content.questions_count}問</span>
                        <span>•</span>
                        <span>{content.types?.length || 0}種類</span>
                      </div>
                      <p className="text-xs text-base-content/50 mt-2">
                        {new Date(request.created_at).toLocaleDateString(
                          "ja-JP",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                      <div className="badge badge-warning badge-sm mt-2">
                        処理中
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Answers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">最近受けた診断</h2>
            <Link href="/mypage/history" className="btn btn-ghost btn-sm">
              すべて見る →
            </Link>
          </div>

          {!recentAnswers || recentAnswers.length === 0 ? (
            <div className="alert alert-info">
              <span>まだ診断を受けていません</span>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnswers.map((answer) => (
                <Link
                  key={answer.id}
                  href={`/quizzes/${answer.quiz_id}/results?answerId=${answer.id}`}
                  className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
                >
                  <div className="card-body p-4">
                    <h3 className="font-semibold">
                      {answer.quizzes?.title || "診断"}
                    </h3>
                    <p className="text-sm text-base-content/60">
                      {new Date(answer.created_at).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookmarks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">最近お気に入りした診断</h2>
            <Link href="/mypage/favorite" className="btn btn-ghost btn-sm">
              すべて見る →
            </Link>
          </div>

          {!recentBookmarks || recentBookmarks.length === 0 ? (
            <div className="alert alert-info">
              <span>まだお気に入りがありません</span>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookmarks.map((bookmark) => (
                <Link
                  key={bookmark.quiz_id}
                  href={`/quizzes/${bookmark.quiz_id}`}
                  className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
                >
                  <div className="card-body p-4">
                    <h3 className="font-semibold">
                      {bookmark.quizzes?.title || "診断"}
                    </h3>
                    <p className="text-sm text-base-content/60">
                      {new Date(bookmark.created_at).toLocaleDateString(
                        "ja-JP",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
