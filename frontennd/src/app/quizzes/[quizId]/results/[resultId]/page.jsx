import { Suspense } from "react";
import { createClient } from "../../../../../utils/supabase/server";
import Link from "next/link";
import ShareButtons from "../ShareButtons";

async function ResultsContent({ params }) {
  const quizId = (await params).quizId;
  const resultId = (await params).resultId;

  if (!resultId) {
    return (
      <div className="alert alert-error">
        <span>回答IDが指定されていません</span>
      </div>
    );
  }

  const supabase = await createClient();

  // Fetch quiz data
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError) {
    return (
      <div className="alert alert-error">
        <span>クイズの読み込みに失敗しました</span>
      </div>
    );
  }

  // Fetch answer details with scores
  const { data: answerDetails, error: answerDetailsError } = await supabase
    .from("answer_details")
    .select(
      `
      answer,
      quiz_element_id,
      quiz_elements!inner(
        quiz_element_score(
          quiz_result_id,
          score
        )
      )
    `,
    )
    .eq("answer_id", resultId);

  if (answerDetailsError) {
    console.error("Error fetching answer details:", answerDetailsError);
    return (
      <div className="alert alert-error">
        <span>回答の読み込みに失敗しました</span>
      </div>
    );
  }

  // Calculate scores for each result type
  const scores = {};

  answerDetails.forEach((detail) => {
    const elementScores = detail.quiz_elements.quiz_element_score;
    elementScores.forEach((elementScore) => {
      const resultTypeId = elementScore.quiz_result_id;
      const weightedScore = detail.answer * elementScore.score;

      if (!scores[resultTypeId]) {
        scores[resultTypeId] = 0;
      }
      scores[resultTypeId] += weightedScore;
    });
  });

  // Find the result with the highest score
  let maxScore = -Infinity;
  let winningResultId = null;

  for (const [resultTypeId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winningResultId = resultTypeId;
    }
  }

  if (!winningResultId) {
    return (
      <div className="alert alert-error">
        <span>結果の計算に失敗しました</span>
      </div>
    );
  }

  // Fetch the winning result details
  const { data: result, error: resultError } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("id", winningResultId)
    .single();

  if (resultError) {
    return (
      <div className="alert alert-error">
        <span>結果の読み込みに失敗しました</span>
      </div>
    );
  }

  // Generate share URL and text
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resultUrl = `${baseUrl}/quizzes/${quizId}/results/${resultId}`;
  const shareText = `${quiz.title}の診断結果: ${result.title}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(resultUrl)}`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>

      {/* Result card */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl text-amber-800 mb-4">
            あなたの診断結果
          </h2>
          <h3 className="text-xl font-bold mb-4">{result.title}</h3>
          <p className="whitespace-pre-wrap text-base-content/80">
            {result.content}
          </p>
        </div>
      </div>

      {/* Share section */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">結果をシェア</h3>
          <ShareButtons
            twitterShareUrl={twitterShareUrl}
            resultUrl={resultUrl}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href={`/quizzes/${quizId}`} className="btn btn-outline flex-1">
          もう一度診断する
        </Link>
        <Link href="/quizzes" className="btn btn-accent flex-1">
          他の診断を見る
        </Link>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const quizId = (await params).quizId;
  const resultId = (await params).resultId;

  if (!resultId) {
    return {
      title: "診断結果",
    };
  }

  try {
    const supabase = await createClient();

    // Fetch quiz data
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("title, description")
      .eq("id", quizId)
      .single();

    if (!quiz) {
      return { title: "診断結果" };
    }

    // Fetch answer details to calculate result
    const { data: answerDetails } = await supabase
      .from("answer_details")
      .select(
        `
        answer,
        quiz_element_id,
        quiz_elements!inner(
          quiz_element_score(
            quiz_result_id,
            score
          )
        )
      `,
      )
      .eq("answer_id", resultId);

    if (!answerDetails || answerDetails.length === 0) {
      return {
        title: `${quiz.title} - 診断結果`,
        description: quiz.description,
      };
    }

    // Calculate scores
    const scores = {};
    answerDetails.forEach((detail) => {
      const elementScores = detail.quiz_elements.quiz_element_score;
      elementScores.forEach((elementScore) => {
        const resultTypeId = elementScore.quiz_result_id;
        const weightedScore = detail.answer * elementScore.score;
        if (!scores[resultTypeId]) {
          scores[resultTypeId] = 0;
        }
        scores[resultTypeId] += weightedScore;
      });
    });

    // Find winning result
    let maxScore = -Infinity;
    let winningResultId = null;
    for (const [resultTypeId, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        winningResultId = resultTypeId;
      }
    }

    if (!winningResultId) {
      return {
        title: `${quiz.title} - 診断結果`,
        description: quiz.description,
      };
    }

    // Fetch the winning result details
    const { data: result } = await supabase
      .from("quiz_results")
      .select("title, content")
      .eq("id", winningResultId)
      .single();

    if (!result) {
      return {
        title: `${quiz.title} - 診断結果`,
        description: quiz.description,
      };
    }

    // Create rich metadata with actual result information
    const resultTitle = `【${result.title}】 - ${quiz.title}`;
    const resultDescription =
      result.content.length > 150
        ? result.content.substring(0, 150) + "..."
        : result.content;

    return {
      title: resultTitle,
      description: resultDescription,
      openGraph: {
        title: resultTitle,
        description: resultDescription,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: resultTitle,
        description: resultDescription,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "診断結果" };
  }
}

export default async function ResultsPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <ResultsContent params={params} />
    </Suspense>
  );
}
