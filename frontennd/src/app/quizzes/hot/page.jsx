import { createClient } from "../../../utils/supabase/server";
import Link from "next/link";
import QuizCard from "../../components/QuizCard";

export const metadata = {
  title: "人気の診断 - カスタム診断メーカー",
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
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              showBookmark={true}
              additionalInfo={{
                rank: index + 1,
                answerCount: quiz.answer_count,
              }}
            />
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
