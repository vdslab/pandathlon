"use client";

import { useState, useTransition } from "react";
import { updateBasicInfo } from "./actions";

export default function BasicInfoTab({ quiz, readOnly = false }) {
  const [formData, setFormData] = useState({
    title: quiz.title,
    description: quiz.description,
    content: quiz.content,
  });
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await updateBasicInfo(quiz.id, formData);
        setMessage({ type: "success", text: "基本情報を保存しました" });
      } catch (error) {
        setMessage({
          type: "error",
          text: "保存に失敗しました。もう一度お試しください。",
        });
        console.error("Failed to update basic info:", error);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">基本情報</h2>

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
          {/* Title */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">診断タイトル</span>
              {!readOnly && (
                <span className="label-text-alt text-error">必須</span>
              )}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered w-full max-w-full"
              placeholder="例: あなたの性格タイプ診断"
              required
              maxLength={100}
              disabled={readOnly}
            />
            {!readOnly && (
              <label className="label">
                <span className="label-text-alt">
                  {formData.title.length}/100文字
                </span>
              </label>
            )}
          </div>

          {/* Description */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">診断の説明</span>
              {!readOnly && (
                <span className="label-text-alt text-error">必須</span>
              )}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered h-24 w-full max-w-full"
              placeholder="例: この診断では、あなたの性格タイプを判定します。質問に答えて、あなたの性格の特徴を知りましょう。"
              required
              maxLength={500}
              disabled={readOnly}
            />
            {!readOnly && (
              <label className="label">
                <span className="label-text-alt">
                  {formData.description.length}/500文字
                </span>
              </label>
            )}
          </div>

          {/* Content (Theme) */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">
                テーマ・コンテンツ
              </span>
              {!readOnly && (
                <span className="label-text-alt text-error">必須</span>
              )}
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="textarea textarea-bordered h-32 w-full max-w-full"
              placeholder="例: 性格心理学に基づいた診断で、外向性・内向性、感覚・直感など複数の軸であなたの性格を分析します。"
              required
              maxLength={1000}
              disabled={readOnly}
            />
            {!readOnly && (
              <label className="label">
                <span className="label-text-alt">
                  {formData.content.length}/1000文字
                </span>
                <span className="label-text-alt">
                  診断のテーマや詳細な説明を入力してください
                </span>
              </label>
            )}
          </div>

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
                      xmlns="http://www.w3.org/2000/svg"
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
