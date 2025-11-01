"use server";

import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";

export async function submitQuizAnswers(quizId, answers) {
  const supabase = await createClient();

  // Get current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Insert answer record
  const { data: answerData, error: answerError } = await supabase
    .from("answers")
    .insert({
      quiz_id: quizId,
      user_id: user?.id || null,
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

  // Redirect to results page
  redirect(`/quizzes/${quizId}/results?answerId=${answerData.id}`);
}
