import { createClient } from "../../../utils/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "人気の診断 - カス診断",
  description: "回答数が多い人気の診断一覧",
};

export default async function HotQuizzesPage() {
  const supabase = await createClient();

  // Get quizzes with answer counts, sorted by popularity
  const { data: quizzes, error } = await supabase.rpc("get_hot_quizzes", {
    limit_count: 50,
  });

  // If RPC function doesn't exist, fall back to manual query
  let hotQuizzes = quizzes;

  if (error || !quizzes) {
    // Fallback: Get all published quizzes and count answers
    const { data: publishedQuizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, title, description, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (quizzesError) {
      return (
        <div className="alert alert-error">
          <span>診断の読み込みに失敗しました</span>
        </div>
      );
    }

    // Get answer counts for each quiz
    const quizzesWithCounts = await Promise.all(
      publishedQuizzes.map(async (quiz) => {
        const { count } = await supabase
          .from("answers")
          .select("*", { count: "exact", head: true })
          .eq("quiz_id", quiz.id);

        return {
          ...quiz,
          answer_count: count || 0,
        };
      }),
    );

    // Sort by answer count
    hotQuizzes = quizzesWithCounts
      .filter((q) => q.answer_count > 0)
      .sort((a, b) => b.answer_count - a.answer_count)
      .slice(0, 50);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">人気の診断</h1>
      <p className="text-base-content/70 mb-8">
        回答数が多い人気の診断をチェックしよう
      </p>

      {!hotQuizzes || hotQuizzes.length === 0 ? (
        <div className="alert alert-info">
          <span>まだ人気の診断がありません</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {hotQuizzes.map((quiz, index) => (
            <Link
              key={quiz.id}
              href={`/quizzes/${quiz.id}`}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="badge badge-accent badge-lg">
                    #{index + 1}
                  </div>
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
      )}

      <div className="mt-8 text-center">
        <Link href="/quizzes" className="btn btn-outline">
          すべての診断を見る
        </Link>
      </div>
    </div>
  );
}
