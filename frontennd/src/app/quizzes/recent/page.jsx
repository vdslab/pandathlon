import { createClient } from "../../../utils/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "最近の診断 - カス診断",
  description: "最近回答された診断一覧",
};

export default async function RecentQuizzesPage() {
  const supabase = await createClient();

  // Get recently answered quizzes
  // Get distinct quiz_ids from answers, ordered by most recent answer
  const { data: recentAnswers, error: answersError } = await supabase
    .from("answers")
    .select("quiz_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (answersError) {
    return (
      <div className="alert alert-error">
        <span>診断の読み込みに失敗しました</span>
      </div>
    );
  }

  // Get unique quiz IDs (most recent first)
  const uniqueQuizIds = [
    ...new Set(recentAnswers.map((answer) => answer.quiz_id)),
  ].slice(0, 50);

  if (uniqueQuizIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">最近の診断</h1>
        <p className="text-base-content/70 mb-8">
          最近回答された診断をチェックしよう
        </p>
        <div className="alert alert-info">
          <span>まだ回答された診断がありません</span>
        </div>
      </div>
    );
  }

  // Fetch quiz details
  const { data: quizzes, error: quizzesError } = await supabase
    .from("quizzes")
    .select("id, title, description, created_at")
    .in("id", uniqueQuizIds)
    .eq("published", true);

  if (quizzesError) {
    return (
      <div className="alert alert-error">
        <span>診断の読み込みに失敗しました</span>
      </div>
    );
  }

  // Sort quizzes by the order in uniqueQuizIds
  const sortedQuizzes = uniqueQuizIds
    .map((id) => quizzes.find((q) => q.id === id))
    .filter(Boolean);

  // Get answer counts and latest answer time for each quiz
  const quizzesWithData = await Promise.all(
    sortedQuizzes.map(async (quiz) => {
      const { count } = await supabase
        .from("answers")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quiz.id);

      const { data: latestAnswer } = await supabase
        .from("answers")
        .select("created_at")
        .eq("quiz_id", quiz.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...quiz,
        answer_count: count || 0,
        latest_answer_at: latestAnswer?.created_at,
      };
    }),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">最近の診断</h1>
      <p className="text-base-content/70 mb-8">
        最近回答された診断をチェックしよう
      </p>

      <div className="grid gap-4">
        {quizzesWithData.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quizzes/${quiz.id}`}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="badge badge-accent">NEW</div>
                <div className="flex-1">
                  <h2 className="card-title text-xl mb-2">{quiz.title}</h2>
                  <p className="text-base-content/70 mb-3">
                    {quiz.description}
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>{quiz.answer_count}人が回答</span>
                    </div>
                    {quiz.latest_answer_at && (
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
                          {new Date(quiz.latest_answer_at).toLocaleDateString(
                            "ja-JP",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-base-content/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/quizzes" className="btn btn-outline">
          すべての診断を見る
        </Link>
      </div>
    </div>
  );
}
