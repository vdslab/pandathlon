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
    .select("creator_id, published")
    .eq("id", quizId)
    .single();

  if (!quiz || quiz.creator_id !== user.id) {
    throw new Error("Unauthorized");
  }

  // Only allow publishing (false -> true), not unpublishing
  if (!published) {
    throw new Error("Cannot unpublish a quiz");
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

export async function updateBasicInfo(quizId, data) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user owns this quiz and it's not published
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("creator_id, published")
    .eq("id", quizId)
    .single();

  if (!quiz || quiz.creator_id !== user.id) {
    throw new Error("Unauthorized");
  }

  if (quiz.published) {
    throw new Error("Cannot edit published quiz");
  }

  // Update basic info
  const { error } = await supabase
    .from("quizzes")
    .update({
      title: data.title,
      description: data.description,
      content: data.content,
    })
    .eq("id", quizId);

  if (error) {
    throw error;
  }

  revalidatePath(`/mypage/quizzes/${quizId}`);
  revalidatePath("/mypage/quizzes");

  return { success: true };
}

export async function updateQuestions(quizId, questions) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user owns this quiz and it's not published
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("creator_id, published")
    .eq("id", quizId)
    .single();

  if (!quiz || quiz.creator_id !== user.id) {
    throw new Error("Unauthorized");
  }

  if (quiz.published) {
    throw new Error("Cannot edit published quiz");
  }

  // Get existing questions
  const { data: existingQuestions } = await supabase
    .from("quiz_elements")
    .select("id")
    .eq("quiz_id", quizId);

  const existingIds = existingQuestions.map((q) => q.id);
  const newQuestionIds = questions.filter((q) => q.id).map((q) => q.id);

  // Delete removed questions (and their scores will cascade)
  const toDelete = existingIds.filter((id) => !newQuestionIds.includes(id));
  if (toDelete.length > 0) {
    await supabase.from("quiz_elements").delete().in("id", toDelete);
  }

  // Update existing questions and insert new ones
  for (const question of questions) {
    if (question.id) {
      // Update existing
      await supabase
        .from("quiz_elements")
        .update({ content: question.content })
        .eq("id", question.id);
    } else {
      // Insert new
      await supabase.from("quiz_elements").insert({
        quiz_id: quizId,
        content: question.content,
      });
    }
  }

  revalidatePath(`/mypage/quizzes/${quizId}`);

  return { success: true };
}

export async function updateResultTypes(quizId, resultTypes) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user owns this quiz and it's not published
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("creator_id, published")
    .eq("id", quizId)
    .single();

  if (!quiz || quiz.creator_id !== user.id) {
    throw new Error("Unauthorized");
  }

  if (quiz.published) {
    throw new Error("Cannot edit published quiz");
  }

  // Get existing result types
  const { data: existingResults } = await supabase
    .from("quiz_results")
    .select("id")
    .eq("quiz_id", quizId);

  const existingIds = existingResults.map((r) => r.id);
  const newResultIds = resultTypes.filter((r) => r.id).map((r) => r.id);

  // Delete removed result types (and their scores will cascade)
  const toDelete = existingIds.filter((id) => !newResultIds.includes(id));
  if (toDelete.length > 0) {
    await supabase.from("quiz_results").delete().in("id", toDelete);
  }

  // Update existing result types and insert new ones
  for (const result of resultTypes) {
    if (result.id) {
      // Update existing
      await supabase
        .from("quiz_results")
        .update({
          title: result.title,
          description: result.description,
          modifier: result.modifier,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          good_matches: result.good_matches,
          bad_matches: result.bad_matches,
          advice: result.advice,
          image_prompt: result.image_prompt,
        })
        .eq("id", result.id);
    } else {
      // Insert new
      await supabase.from("quiz_results").insert({
        quiz_id: quizId,
        title: result.title,
        description: result.description,
        modifier: result.modifier,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        good_matches: result.good_matches,
        bad_matches: result.bad_matches,
        advice: result.advice,
        image_prompt: result.image_prompt,
      });
    }
  }

  revalidatePath(`/mypage/quizzes/${quizId}`);

  return { success: true };
}

export async function updateScoreWeights(quizId, scoreMatrix) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user owns this quiz and it's not published
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("creator_id, published")
    .eq("id", quizId)
    .single();

  if (!quiz || quiz.creator_id !== user.id) {
    throw new Error("Unauthorized");
  }

  if (quiz.published) {
    throw new Error("Cannot edit published quiz");
  }

  // Delete all existing scores for this quiz
  await supabase
    .from("quiz_element_score")
    .delete()
    .in(
      "quiz_element_id",
      await supabase
        .from("quiz_elements")
        .select("id")
        .eq("quiz_id", quizId)
        .then(({ data }) => data.map((e) => e.id)),
    );

  // Insert all scores
  const scoresToInsert = [];
  for (const [elementId, results] of Object.entries(scoreMatrix)) {
    for (const [resultId, score] of Object.entries(results)) {
      scoresToInsert.push({
        quiz_element_id: parseInt(elementId),
        quiz_result_id: parseInt(resultId),
        score: score,
      });
    }
  }

  if (scoresToInsert.length > 0) {
    const { error } = await supabase
      .from("quiz_element_score")
      .insert(scoresToInsert);

    if (error) {
      throw error;
    }
  }

  revalidatePath(`/mypage/quizzes/${quizId}`);

  return { success: true };
}
