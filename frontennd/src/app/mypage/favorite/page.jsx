import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import QuizCard from "../../components/QuizCard";

export const metadata = {
  title: "お気に入り - カスタム診断メーカー",
  description: "お気に入り登録した診断",
};

export default async function FavoritePage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's bookmarked quizzes
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select(
      `
      created_at,
      quiz_id,
      quizzes (
        id,
        title,
        description,
        created_at
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (bookmarksError) {
    return (
      <div className="alert alert-error">
        <span>お気に入りの読み込みに失敗しました</span>
      </div>
    );
  }

  // Get answer counts for each quiz
  const quizzesWithInfo = await Promise.all(
    (bookmarks || []).map(async (bookmark) => {
      const quiz = bookmark.quizzes;
      if (!quiz) return null;

      const { count } = await supabase
        .from("answers")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quiz.id);

      return {
        quiz,
        bookmarkedAt: bookmark.created_at,
        answerCount: count || 0,
      };
    }),
  );

  // Filter out any null entries
  const validQuizzes = quizzesWithInfo.filter((item) => item !== null);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">お気に入り</h1>
      <p className="text-base-content/70 mb-8">
        お気に入り登録した診断を確認できます
      </p>

      {!validQuizzes || validQuizzes.length === 0 ? (
        <div className="alert alert-info">
          <span>まだお気に入りに登録された診断がありません</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {validQuizzes.map((item) => (
            <QuizCard
              key={item.quiz.id}
              quiz={item.quiz}
              showBookmark={true}
              additionalInfo={{
                answerCount: item.answerCount,
                date: item.bookmarkedAt,
                dateLabel: "登録日: ",
              }}
            />
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
