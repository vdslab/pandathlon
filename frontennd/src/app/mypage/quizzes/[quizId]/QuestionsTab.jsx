"use client";

import { useState, useTransition } from "react";
import { updateQuestions } from "./actions";

export default function QuestionsTab({ quizId, elements, readOnly = false }) {
  const [questions, setQuestions] = useState(
    elements.map((el) => ({ id: el.id, content: el.content })),
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (questions.length === 0) {
      setMessage({ type: "error", text: "質問を1つ以上追加してください" });
      return;
    }

    if (questions.some((q) => !q.content.trim())) {
      setMessage({
        type: "error",
        text: "空の質問があります。すべての質問に内容を入力してください",
      });
      return;
    }

    startTransition(async () => {
      try {
        await updateQuestions(quizId, questions);
        setMessage({ type: "success", text: "質問を保存しました" });
      } catch (error) {
        setMessage({
          type: "error",
          text: "保存に失敗しました。もう一度お試しください。",
        });
        console.error("Failed to update questions:", error);
      }
    });
  };

  const handleQuestionChange = (index, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, content: value } : q)),
    );
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: null, content: "" }, // null id means new question
    ]);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length <= 1) {
      alert("質問は最低1つ必要です");
      return;
    }

    if (
      !window.confirm(
        "この質問を削除しますか？\n関連するスコア設定も削除されます。",
      )
    ) {
      return;
    }

    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setQuestions((prev) => {
      const newQuestions = [...prev];
      [newQuestions[index - 1], newQuestions[index]] = [
        newQuestions[index],
        newQuestions[index - 1],
      ];
      return newQuestions;
    });
  };

  const handleMoveDown = (index) => {
    if (index === questions.length - 1) return;
    setQuestions((prev) => {
      const newQuestions = [...prev];
      [newQuestions[index], newQuestions[index + 1]] = [
        newQuestions[index + 1],
        newQuestions[index],
      ];
      return newQuestions;
    });
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">質問の編集</h2>

        {message && (
          <div
            className={`alert ${
              message.type === "success" ? "alert-success" : "alert-error"
            } mb-4`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {message.type === "success" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={index}
                className="card bg-base-200 border-2 border-base-300"
              >
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    {/* Question Number */}
                    <div className="badge badge-lg badge-primary mt-2">
                      Q{index + 1}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <textarea
                        value={question.content}
                        onChange={(e) =>
                          handleQuestionChange(index, e.target.value)
                        }
                        className="textarea textarea-bordered w-full"
                        placeholder="質問内容を入力してください"
                        rows={2}
                        maxLength={500}
                        disabled={readOnly}
                      />
                      {!readOnly && (
                        <div className="text-xs text-base-content/60 mt-1">
                          {question.content.length}/500文字
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {!readOnly && (
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="btn btn-sm btn-ghost"
                          title="上に移動"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === questions.length - 1}
                          className="btn btn-sm btn-ghost"
                          title="下に移動"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(index)}
                          className="btn btn-sm btn-error btn-ghost"
                          title="削除"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="btn btn-outline btn-primary w-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              質問を追加
            </button>
          )}

          {/* Info Alert */}
          {!readOnly && (
            <div className="alert alert-info">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm">
                <p>
                  質問を追加・削除・並び替えできます。質問を削除すると、関連するスコア設定も削除されます。
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!readOnly && (
            <div className="card-actions justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary btn-lg"
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    保存中...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    保存する
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
