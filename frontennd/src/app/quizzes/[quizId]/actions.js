"use server";

import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";

export async function submitQuizAnswers(quizId, answers) {
  const supabase = await createClient();

  // Get current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get quiz to check published status
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("published")
    .eq("id", quizId)
    .single();

  // Insert answer record (without user_id)
  const { data: answerData, error: answerError } = await supabase
    .from("answers")
    .insert({
      quiz_id: quizId,
    })
    .select()
    .single();

  if (answerError) {
    console.error("Error inserting answer:", answerError);
    throw new Error("回答の送信に失敗しました");
  }

  // Insert answer details
  const answerDetails = Object.entries(answers).map(([questionId, answer]) => ({
    answer_id: answerData.id,
    quiz_element_id: parseInt(questionId),
    answer: answer,
  }));

  const { error: detailsError } = await supabase
    .from("answer_details")
    .insert(answerDetails);

  if (detailsError) {
    console.error("Error inserting answer details:", detailsError);
    throw new Error("回答の送信に失敗しました");
  }

  // If user is logged in AND quiz is published, link answer to user in user_answers table
  if (user?.id && quiz?.published) {
    const { error: userAnswerError } = await supabase
      .from("user_answers")
      .insert({
        answer_id: answerData.id,
        user_id: user.id,
      });

    if (userAnswerError) {
      console.error("Error linking answer to user:", userAnswerError);
      // Continue to redirect even if linking fails (answer is already saved)
    }
  }

  // Redirect to results page
  redirect(`/quizzes/${quizId}/results/${answerData.id}`);
}
