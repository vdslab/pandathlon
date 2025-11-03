import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "作成した診断 - カスタム診断メーカー",
  description: "あなたが作成した診断一覧",
};

export default async function MyQuizzesPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get pending quiz requests
  const { data: pendingQuizzes } = await supabase
    .from("quiz_requests")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  // Get completed quizzes with answer counts
  const { data: completedQuizzes } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      answers(count)
    `,
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">作成した診断</h1>
        <Link href="/mypage/quizzes/new" className="btn btn-accent">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          新しい診断を作る
        </Link>
      </div>

      {/* Processing Quizzes Section */}
      {pendingQuizzes && pendingQuizzes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
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
            <span className="badge badge-warning">{pendingQuizzes.length}</span>
          </h2>
          <div className="space-y-4">
            {pendingQuizzes.map((request) => {
              const content = request.content;
              return (
                <div
                  key={request.id}
                  className="card bg-base-100 shadow-xl border-2 border-warning"
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="card-title text-xl">
                          {content.title}
                          <span className="badge badge-warning">処理中</span>
                        </h3>
                        <p className="text-base-content/70 mt-2">
                          {content.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm text-base-content/60">
                          <span>質問数: {content.questions_count}問</span>
                          <span>
                            結果タイプ数: {content.types?.length || 0}種類
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-base-content/50 mt-2">
                      作成日時:{" "}
                      {new Date(request.created_at).toLocaleDateString(
                        "ja-JP",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
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
                      <span className="text-sm">
                        診断の生成処理を行っています。完了までしばらくお待ちください。
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Quizzes Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          完成した診断
          {completedQuizzes && (
            <span className="badge badge-success">
              {completedQuizzes.length}
            </span>
          )}
        </h2>

        {!completedQuizzes || completedQuizzes.length === 0 ? (
          <div className="alert alert-info">
            <svg
              className="w-6 h-6"
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
            <span>まだ診断を作成していません</span>
          </div>
        ) : (
          <div className="space-y-4">
            {completedQuizzes.map((quiz) => {
              const answerCount =
                quiz.answers && quiz.answers.length > 0
                  ? quiz.answers[0].count
                  : 0;

              return (
                <div key={quiz.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="card-title text-xl">
                          {quiz.title}
                          {quiz.published ? (
                            <span className="badge badge-success">公開中</span>
                          ) : (
                            <span className="badge badge-ghost">非公開</span>
                          )}
                        </h3>
                        <p className="text-base-content/70 mt-2">
                          {quiz.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm text-base-content/60">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            回答数: {answerCount}回
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(quiz.created_at).toLocaleDateString(
                              "ja-JP",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      {quiz.published && (
                        <Link
                          href={`/quizzes/${quiz.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          <svg
                            className="w-4 h-4"
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
                          プレビュー
                        </Link>
                      )}
                      <Link
                        href={`/mypage/quizzes/${quiz.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        編集
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
