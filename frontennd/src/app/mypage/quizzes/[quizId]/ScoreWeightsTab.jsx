"use client";

import { useState, useTransition } from "react";
import { updateScoreWeights } from "./actions";

export default function ScoreWeightsTab({ quizId, elements, results, scores }) {
  // Build initial score matrix
  const buildScoreMatrix = () => {
    const matrix = {};
    elements.forEach((element) => {
      matrix[element.id] = {};
      results.forEach((result) => {
        // Find existing score or default to 0
        const existingScore = scores.find(
          (s) =>
            s.quiz_element_id === element.id && s.quiz_result_id === result.id,
        );
        matrix[element.id][result.id] = existingScore ? existingScore.score : 0;
      });
    });
    return matrix;
  };

  const [scoreMatrix, setScoreMatrix] = useState(buildScoreMatrix());
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await updateScoreWeights(quizId, scoreMatrix);
        setMessage({ type: "success", text: "スコア設定を保存しました" });
      } catch (error) {
        setMessage({
          type: "error",
          text: "保存に失敗しました。もう一度お試しください。",
        });
        console.error("Failed to update score weights:", error);
      }
    });
  };

  const handleScoreChange = (elementId, resultId, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < -3 || numValue > 3) return;

    setScoreMatrix((prev) => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        [resultId]: numValue,
      },
    }));
  };

  const getScoreColor = (score) => {
    if (score > 0) return "text-success font-bold";
    if (score < 0) return "text-error font-bold";
    return "text-base-content/60";
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">スコア重み付け設定</h2>

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

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <p>各質問が各結果タイプに与える影響度を-3〜+3で設定します。</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <strong className="text-success">正の値 (+1〜+3)</strong>:
                  この質問に強く同意するほど、そのタイプに近づきます
                </li>
                <li>
                  <strong className="text-error">負の値 (-1〜-3)</strong>:
                  この質問に強く同意するほど、そのタイプから遠ざかります
                </li>
                <li>
                  <strong>0</strong>: この質問はそのタイプに影響を与えません
                </li>
              </ul>
            </div>
          </div>

          {/* Score Matrix Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra table-pin-rows table-pin-cols">
              <thead>
                <tr>
                  <th className="bg-base-200">質問</th>
                  {results.map((result, idx) => (
                    <th key={result.id} className="bg-base-200 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="badge badge-secondary badge-sm">
                          タイプ{idx + 1}
                        </span>
                        <span className="text-xs font-normal">
                          {result.title}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {elements.map((element, idx) => (
                  <tr key={element.id}>
                    <td className="bg-base-200 font-semibold">
                      <div className="flex items-start gap-2">
                        <span className="badge badge-primary badge-sm mt-1">
                          Q{idx + 1}
                        </span>
                        <span className="text-sm line-clamp-2">
                          {element.content}
                        </span>
                      </div>
                    </td>
                    {results.map((result) => (
                      <td key={result.id} className="text-center p-2">
                        <input
                          type="number"
                          min="-3"
                          max="3"
                          step="1"
                          value={scoreMatrix[element.id][result.id]}
                          onChange={(e) =>
                            handleScoreChange(
                              element.id,
                              result.id,
                              e.target.value,
                            )
                          }
                          className={`input input-bordered input-sm w-16 text-center ${getScoreColor(
                            scoreMatrix[element.id][result.id],
                          )}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Reference */}
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h3 className="font-semibold text-sm mb-2">
                スコア値のクイックリファレンス
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-bold text-success">+3</span>{" "}
                  非常に強い正の影響
                </div>
                <div>
                  <span className="font-bold text-success">+2</span>{" "}
                  強い正の影響
                </div>
                <div>
                  <span className="font-bold text-success">+1</span>{" "}
                  弱い正の影響
                </div>
                <div>
                  <span className="font-bold">0</span> 影響なし
                </div>
                <div>
                  <span className="font-bold text-error">-1</span> 弱い負の影響
                </div>
                <div>
                  <span className="font-bold text-error">-2</span> 強い負の影響
                </div>
                <div>
                  <span className="font-bold text-error">-3</span>{" "}
                  非常に強い負の影響
                </div>
              </div>
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
