import { createClient } from "../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublishedToggle from "./PublishedToggle";

export async function generateMetadata({ params }) {
  return {
    title: "診断を編集 - カス診断",
  };
}

export default async function QuizEditPage({ params }) {
  const { quizId } = await params;
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get quiz details
  const { data: quiz } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      quiz_elements(count),
      quiz_results(count),
      answers(count),
      bookmarks(count)
    `,
    )
    .eq("id", quizId)
    .single();

  // Check if quiz exists and user is the creator
  if (!quiz || quiz.creator_id !== user.id) {
    redirect("/mypage/quizzes");
  }

  const questionCount =
    quiz.quiz_elements && quiz.quiz_elements.length > 0
      ? quiz.quiz_elements[0].count
      : 0;
  const resultTypeCount =
    quiz.quiz_results && quiz.quiz_results.length > 0
      ? quiz.quiz_results[0].count
      : 0;
  const answerCount =
    quiz.answers && quiz.answers.length > 0 ? quiz.answers[0].count : 0;
  const bookmarkCount =
    quiz.bookmarks && quiz.bookmarks.length > 0 ? quiz.bookmarks[0].count : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm breadcrumbs mb-4">
          <ul>
            <li>
              <Link href="/mypage">マイページ</Link>
            </li>
            <li>
              <Link href="/mypage/quizzes">作成した診断</Link>
            </li>
            <li>診断を編集</li>
          </ul>
        </div>
        <h1 className="text-4xl font-bold">診断を編集</h1>
      </div>

      {/* Quiz Information Card */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="card-title text-2xl mb-2">{quiz.title}</h2>
              <p className="text-base-content/70">{quiz.description}</p>
            </div>
            {quiz.published ? (
              <span className="badge badge-success badge-lg">公開中</span>
            ) : (
              <span className="badge badge-ghost badge-lg">非公開</span>
            )}
          </div>

          <div className="divider"></div>

          {/* Quiz Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-xs">質問数</div>
              <div className="stat-value text-2xl">{questionCount}</div>
              <div className="stat-desc">問</div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-xs">結果タイプ</div>
              <div className="stat-value text-2xl">{resultTypeCount}</div>
              <div className="stat-desc">種類</div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-xs">回答数</div>
              <div className="stat-value text-2xl">{answerCount}</div>
              <div className="stat-desc">回</div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-xs">お気に入り</div>
              <div className="stat-value text-2xl">{bookmarkCount}</div>
              <div className="stat-desc">件</div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Creation Date */}
          <div className="text-sm text-base-content/60">
            <span className="font-semibold">作成日時:</span>{" "}
            {new Date(quiz.created_at).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Published Status Toggle */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h3 className="card-title mb-4">公開設定</h3>
          <PublishedToggle quizId={quiz.id} initialPublished={quiz.published} />
          <div className="alert alert-info mt-4">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm">
              <p>
                <strong>公開:</strong>{" "}
                診断が診断一覧ページに表示され、誰でも回答できるようになります。
              </p>
              <p className="mt-1">
                <strong>非公開:</strong>{" "}
                診断一覧に表示されず、直接URLを知っている人のみアクセスできます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-4">アクション</h3>
          <div className="flex flex-wrap gap-4">
            {quiz.published && (
              <Link
                href={`/quizzes/${quiz.id}`}
                className="btn btn-primary"
                target="_blank"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                診断ページを開く
              </Link>
            )}
            <Link href="/mypage/quizzes" className="btn btn-ghost">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
