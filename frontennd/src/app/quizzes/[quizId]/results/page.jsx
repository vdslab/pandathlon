import { Suspense } from "react";
import { createClient } from "../../../../utils/supabase/server";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

async function ResultsContent({ params, searchParams }) {
  const quizId = (await params).quizId;
  const answerId = (await searchParams).answerId;

  if (!answerId) {
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
    .eq("answer_id", answerId);

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
      const resultId = elementScore.quiz_result_id;
      const weightedScore = detail.answer * elementScore.score;

      if (!scores[resultId]) {
        scores[resultId] = 0;
      }
      scores[resultId] += weightedScore;
    });
  });

  // Find the result with the highest score
  let maxScore = -Infinity;
  let winningResultId = null;

  for (const [resultId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winningResultId = resultId;
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
  const resultUrl = `${baseUrl}/quizzes/${quizId}/results?answerId=${answerId}`;
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
          <h2 className="card-title text-2xl text-accent mb-4">
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

export async function generateMetadata({ params, searchParams }) {
  const quizId = (await params).quizId;
  const answerId = (await searchParams).answerId;

  if (!answerId) {
    return {
      title: "診断結果",
    };
  }

  try {
    const supabase = await createClient();

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("title, description")
      .eq("id", quizId)
      .single();

    if (!quiz) {
      return { title: "診断結果" };
    }

    return {
      title: `${quiz.title} - 診断結果`,
      description: quiz.description,
      openGraph: {
        title: `${quiz.title} - 診断結果`,
        description: quiz.description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${quiz.title} - 診断結果`,
        description: quiz.description,
      },
    };
  } catch (error) {
    return { title: "診断結果" };
  }
}

export default async function ResultsPage({ params, searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <ResultsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
