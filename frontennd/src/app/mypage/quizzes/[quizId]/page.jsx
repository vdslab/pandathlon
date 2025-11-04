import { createClient } from "../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import QuizEditForm from "./QuizEditForm";

export async function generateMetadata({ params }) {
  return {
    title: "診断を編集 - カスタム診断メーカー",
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

  // Get quiz details with all related data
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  // Check if quiz exists and user is the creator
  if (!quiz || quiz.creator_id !== user.id) {
    redirect("/mypage/quizzes");
  }

  // Get quiz elements (questions)
  const { data: elements } = await supabase
    .from("quiz_elements")
    .select("*")
    .eq("quiz_id", quizId)
    .order("id");

  // Get quiz results (result types)
  const { data: results } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("quiz_id", quizId)
    .order("id");

  // Get score weights
  const { data: scores } = await supabase
    .from("quiz_element_score")
    .select("*")
    .in(
      "quiz_element_id",
      elements.map((e) => e.id),
    );

  // Get statistics
  const { count: answerCount } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  const { count: bookmarkCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  // Use QuizEditForm for both published and unpublished quizzes
  // Pass readOnly=true for published quizzes
  return (
    <QuizEditForm
      quiz={quiz}
      elements={elements || []}
      results={results || []}
      scores={scores || []}
      readOnly={quiz.published}
    />
  );
}
