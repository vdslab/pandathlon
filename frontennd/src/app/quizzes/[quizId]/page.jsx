"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";
import { submitQuizAnswers } from "./actions";

export default function QuizPage({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const supabase = createClient();
        const quizId = (await params).quizId;

        // Fetch quiz data
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .eq("published", true)
          .single();

        if (quizError) throw quizError;

        // Fetch quiz elements (questions)
        const { data: elementsData, error: elementsError } = await supabase
          .from("quiz_elements")
          .select("*")
          .eq("quiz_id", quizId)
          .order("id");

        if (elementsError) throw elementsError;

        setQuiz(quizData);
        setQuestions(elementsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("クイズの読み込みに失敗しました");
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [params]);

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const quizId = (await params).quizId;

      // Use server action to submit answers
      await submitQuizAnswers(quizId, answers);
    } catch (err) {
      console.error("Error submitting answers:", err);
      setError("回答の送信に失敗しました");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="alert alert-warning">
        <span>クイズが見つかりません</span>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
      <p className="mb-8 text-gray-600">{quiz.description}</p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>
            質問 {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span>
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <progress
          className="progress progress-accent w-full"
          value={currentQuestionIndex + 1}
          max={questions.length}
        ></progress>
      </div>

      {/* Question */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-xl mb-6">{currentQuestion.content}</h2>

          {/* Answer scale */}
          <div className="flex flex-col gap-3">
            {[-3, -2, -1, 0, 1, 2, 3].map((value) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-3 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="answer"
                  className="radio radio-accent"
                  checked={currentAnswer === value}
                  onChange={() => handleAnswerChange(value)}
                />
                <span className="flex-1">
                  {value === -3 && "全くそう思わない"}
                  {value === -2 && "そう思わない"}
                  {value === -1 && "あまりそう思わない"}
                  {value === 0 && "どちらでもない"}
                  {value === 1 && "ややそう思う"}
                  {value === 2 && "そう思う"}
                  {value === 3 && "とてもそう思う"}
                </span>
                <span className="badge badge-neutral">{value}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between gap-4">
        <button
          className="btn btn-outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          前の質問
        </button>

        {isLastQuestion ? (
          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
          >
            {submitting ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "結果を見る"
            )}
          </button>
        ) : (
          <button
            className="btn btn-accent"
            onClick={handleNext}
            disabled={currentAnswer === undefined}
          >
            次の質問
          </button>
        )}
      </div>

      {/* Warning if not all answered */}
      {isLastQuestion && !allAnswered && (
        <div className="alert alert-warning mt-4">
          <span>すべての質問に回答してください</span>
        </div>
      )}
    </div>
  );
}
