import { createClient } from "../../utils/supabase/server";
import Link from "next/link";
import QuizCard from "../components/QuizCard";

export const metadata = {
  title: "診断一覧 - カスタム診断メーカー",
  description: "すべての診断を探す",
};

export default async function QuizzesPage() {
  const supabase = await createClient();

  // Get all published quizzes
  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select("id, title, description, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="alert alert-error">
        <span>診断の読み込みに失敗しました</span>
      </div>
    );
  }

  // Get answer counts for each quiz
  const quizzesWithCounts = await Promise.all(
    (quizzes || []).map(async (quiz) => {
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">診断一覧</h1>
      <p className="text-base-content/70 mb-8">
        様々な診断から気になるものを見つけよう
      </p>

      {/* Quick links */}
      <div className="flex gap-4 mb-8">
        <Link href="/quizzes/hot" className="btn btn-accent">
          🔥 人気の診断
        </Link>
        <Link href="/quizzes/recent" className="btn btn-outline">
          ✨ 最近の診断
        </Link>
      </div>

      {!quizzesWithCounts || quizzesWithCounts.length === 0 ? (
        <div className="alert alert-info">
          <span>まだ診断がありません</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzesWithCounts.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              showBookmark={true}
              additionalInfo={{
                answerCount: quiz.answer_count,
                date: quiz.created_at,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
