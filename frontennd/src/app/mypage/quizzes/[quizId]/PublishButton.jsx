"use client";

import { useState, useTransition } from "react";
import { updateQuizPublished } from "./actions";

export default function PublishButton({ quizId, initialPublished }) {
  const [published, setPublished] = useState(initialPublished);
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    const confirmed = window.confirm(
      "診断を公開しますか？\n\n⚠️ 公開すると以下の制限があります：\n・診断内容の編集ができなくなります\n・非公開に戻すことができなくなります\n\nよろしいですか？",
    );

    if (!confirmed) return;

    setPublished(true); // Optimistic update

    startTransition(async () => {
      try {
        await updateQuizPublished(quizId, true);
      } catch (error) {
        // Revert on error
        setPublished(false);
        alert("公開に失敗しました。もう一度お試しください。");
        console.error("Failed to publish quiz:", error);
      }
    });
  };

  if (published) {
    return (
      <div className="alert alert-success">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">この診断は公開されています</h3>
          <div className="text-sm">
            診断が公開されており、誰でもアクセスできます。公開後は編集や非公開化ができません。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="alert alert-warning mb-4">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="text-sm">
          <p className="font-bold">この診断は現在非公開です</p>
          <p>
            公開すると、診断一覧に表示され誰でも回答できるようになります。
            <strong>公開後は編集や非公開化ができなくなります</strong>
            ので、内容を確認してから公開してください。
          </p>
        </div>
      </div>

      <button
        onClick={handlePublish}
        disabled={isPending}
        className="btn btn-success btn-lg w-full"
      >
        {isPending ? (
          <>
            <span className="loading loading-spinner"></span>
            公開中...
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            診断を公開する
          </>
        )}
      </button>
    </div>
  );
}
