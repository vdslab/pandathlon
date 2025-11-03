import { createClient } from "../../../utils/supabase/server";
import Link from "next/link";
import QuizCard from "../../components/QuizCard";

export const metadata = {
  title: "最近の診断 - カスタム診断メーカー",
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
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            showBookmark={true}
            additionalInfo={{
              answerCount: quiz.answer_count,
              date: quiz.latest_answer_at,
              dateLabel: "最新回答: ",
            }}
          />
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
