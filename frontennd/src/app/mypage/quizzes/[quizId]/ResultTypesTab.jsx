"use client";

import { useState, useTransition } from "react";
import { updateResultTypes } from "./actions";

export default function ResultTypesTab({ quizId, results }) {
  const [resultTypes, setResultTypes] = useState(
    results.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      modifier: r.modifier || "",
      strengths: r.strengths || "",
      weaknesses: r.weaknesses || "",
      good_matches: r.good_matches || "",
      bad_matches: r.bad_matches || "",
      advice: r.advice || "",
      image_prompt: r.image_prompt || "",
    })),
  );
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (resultTypes.length < 2) {
      setMessage({
        type: "error",
        text: "結果タイプは最低2つ必要です",
      });
      return;
    }

    if (resultTypes.some((r) => !r.title.trim())) {
      setMessage({
        type: "error",
        text: "すべての結果タイプにタイトルを入力してください",
      });
      return;
    }

    startTransition(async () => {
      try {
        await updateResultTypes(quizId, resultTypes);
        setMessage({ type: "success", text: "結果タイプを保存しました" });
      } catch (error) {
        setMessage({
          type: "error",
          text: "保存に失敗しました。もう一度お試しください。",
        });
        console.error("Failed to update result types:", error);
      }
    });
  };

  const handleResultChange = (index, field, value) => {
    setResultTypes((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const handleAddResult = () => {
    setResultTypes((prev) => [
      ...prev,
      {
        id: null,
        title: "",
        description: "",
        modifier: "",
        strengths: "",
        weaknesses: "",
        good_matches: "",
        bad_matches: "",
        advice: "",
        image_prompt: "",
      },
    ]);
    setExpandedIndex(resultTypes.length);
  };

  const handleDeleteResult = (index) => {
    if (resultTypes.length <= 2) {
      alert("結果タイプは最低2つ必要です");
      return;
    }

    if (
      !window.confirm(
        "この結果タイプを削除しますか？\n関連するスコア設定も削除されます。",
      )
    ) {
      return;
    }

    setResultTypes((prev) => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">結果タイプの編集</h2>

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
          {/* Result Types List */}
          <div className="space-y-4">
            {resultTypes.map((result, index) => (
              <div
                key={index}
                className="card bg-base-200 border-2 border-base-300"
              >
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="badge badge-lg badge-secondary">
                      タイプ{index + 1}
                    </div>
                    <input
                      type="text"
                      value={result.title}
                      onChange={(e) =>
                        handleResultChange(index, "title", e.target.value)
                      }
                      className="input input-bordered flex-1"
                      placeholder="結果タイプのタイトル（例: 外向型、内向型）"
                      maxLength={100}
                    />
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="btn btn-sm btn-ghost"
                    >
                      {expandedIndex === index ? "▲ 閉じる" : "▼ 詳細"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteResult(index)}
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

                  {/* Expanded Content */}
                  {expandedIndex === index && (
                    <div className="mt-4 space-y-4 border-t border-base-300 pt-4">
                      {/* Description */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">説明</span>
                        </label>
                        <textarea
                          value={result.description}
                          onChange={(e) =>
                            handleResultChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          className="textarea textarea-bordered h-24"
                          placeholder="このタイプの特徴を説明してください"
                          maxLength={1000}
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            {result.description.length}/1000文字
                          </span>
                        </label>
                      </div>

                      {/* Modifier */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            修飾語
                          </span>
                        </label>
                        <input
                          type="text"
                          value={result.modifier}
                          onChange={(e) =>
                            handleResultChange(
                              index,
                              "modifier",
                              e.target.value,
                            )
                          }
                          className="input input-bordered"
                          placeholder="例: 社交的な、思慮深い"
                          maxLength={100}
                        />
                      </div>

                      {/* Strengths */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">強み</span>
                        </label>
                        <textarea
                          value={result.strengths}
                          onChange={(e) =>
                            handleResultChange(
                              index,
                              "strengths",
                              e.target.value,
                            )
                          }
                          className="textarea textarea-bordered h-20"
                          placeholder="このタイプの強みや長所"
                          maxLength={500}
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            {result.strengths.length}/500文字
                          </span>
                        </label>
                      </div>

                      {/* Weaknesses */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">弱み</span>
                        </label>
                        <textarea
                          value={result.weaknesses}
                          onChange={(e) =>
                            handleResultChange(
                              index,
                              "weaknesses",
                              e.target.value,
                            )
                          }
                          className="textarea textarea-bordered h-20"
                          placeholder="このタイプの弱みや短所"
                          maxLength={500}
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            {result.weaknesses.length}/500文字
                          </span>
                        </label>
                      </div>

                      {/* Good Matches */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            相性が良いタイプ
                          </span>
                        </label>
                        <textarea
                          value={result.good_matches}
                          onChange={(e) =>
                            handleResultChange(
                              index,
                              "good_matches",
                              e.target.value,
                            )
                          }
                          className="textarea textarea-bordered h-20"
                          placeholder="相性の良い他のタイプ"
                          maxLength={500}
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            {result.good_matches.length}/500文字
                          </span>
                        </label>
                      </div>

                      {/* Bad Matches */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            相性が悪いタイプ
                          </span>
                        </label>
                        <textarea
                          value={result.bad_matches}
                          onChange={(e) =>
                            handleResultChange(
                              index,
                              "bad_matches",
                              e.target.value,
                            )
                          }
                          className="textarea textarea-bordered h-20"
                          placeholder="相性の悪い他のタイプ"
                          maxLength={500}
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            {result.bad_matches.length}/500文字
                          </span>
                        </label>
                      </div>

                      {/* Advice */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            アドバイス
                          </span>
                        </label>
                        <textarea
                          value={result.advice}
                          onChange={(e) =>
                            handleResultChange(index, "advice", e.target.value)
                          }
                          className="textarea textarea-bordered h-24"
                          placeholder="このタイプの人へのアドバイス"
                          maxLength={1000}
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            {result.advice.length}/1000文字
                          </span>
                        </label>
                      </div>

                      {/* Image Prompt */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            画像プロンプト
                          </span>
                        </label>
                        <textarea
                          value={result.image_prompt}
                          onChange={(e) =>
                            handleResultChange(
                              index,
                              "image_prompt",
                              e.target.value,
                            )
                          }
                          className="textarea textarea-bordered h-20"
                          placeholder="結果画像生成用のプロンプト（オプション）"
                          maxLength={500}
                        />
                        <label className="label">
                          <span className="label-text-alt">
                            {result.image_prompt.length}/500文字
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Result Type Button */}
          <button
            type="button"
            onClick={handleAddResult}
            className="btn btn-outline btn-secondary w-full"
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
            結果タイプを追加
          </button>

          {/* Info Alert */}
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
                結果タイプは最低2つ必要です。各タイプをクリックして詳細情報を編集できます。
              </p>
            </div>
          </div>

          {/* Submit Button */}
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
        </form>
      </div>
    </div>
  );
}
