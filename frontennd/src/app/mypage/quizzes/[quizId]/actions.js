"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../../utils/supabase/server";

export async function updateQuizPublished(quizId, published) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user owns this quiz
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("creator_id")
    .eq("id", quizId)
    .single();

  if (!quiz || quiz.creator_id !== user.id) {
    throw new Error("Unauthorized");
  }

  // Update published status
  const { error } = await supabase
    .from("quizzes")
    .update({ published })
    .eq("id", quizId);

  if (error) {
    throw error;
  }

  revalidatePath(`/mypage/quizzes/${quizId}`);
  revalidatePath("/mypage/quizzes");
  revalidatePath("/mypage");

  return { success: true };
}
