import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "診断履歴 - カス診断",
  description: "あなたが受けた診断の履歴",
};

export default async function HistoryPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's answer history
  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select(
      `
      id,
      created_at,
      quiz_id,
      quizzes (
        id,
        title,
        description
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (answersError) {
    return (
      <div className="alert alert-error">
        <span>履歴の読み込みに失敗しました</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">診断履歴</h1>
      <p className="text-base-content/70 mb-8">
        あなたが受けた診断の履歴を確認できます
      </p>

      {!answers || answers.length === 0 ? (
        <div className="alert alert-info">
          <span>まだ診断を受けていません</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h2 className="card-title text-xl mb-2">
                      {answer.quizzes?.title || "診断"}
                    </h2>
                    <p className="text-base-content/70 mb-3">
                      {answer.quizzes?.description || ""}
                    </p>
                    <div className="flex gap-3 text-sm text-base-content/60">
                      <div className="flex items-center gap-1">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {new Date(answer.created_at).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/quizzes/${answer.quiz_id}/results?answerId=${answer.id}`}
                      className="btn btn-accent btn-sm"
                    >
                      結果を見る
                    </Link>
                    <Link
                      href={`/quizzes/${answer.quiz_id}`}
                      className="btn btn-outline btn-sm"
                    >
                      もう一度受ける
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/quizzes" className="btn btn-accent">
          診断を探す
        </Link>
      </div>
    </div>
  );
}
