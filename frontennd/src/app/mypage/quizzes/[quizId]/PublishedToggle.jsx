"use client";

import { useState, useTransition } from "react";
import { updateQuizPublished } from "./actions";

export default function PublishedToggle({ quizId, initialPublished }) {
  const [published, setPublished] = useState(initialPublished);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newPublished = !published;
    setPublished(newPublished); // Optimistic update

    startTransition(async () => {
      try {
        await updateQuizPublished(quizId, newPublished);
      } catch (error) {
        // Revert on error
        setPublished(!newPublished);
        console.error("Failed to update published status:", error);
      }
    });
  };

  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-4">
        <input
          type="checkbox"
          className="toggle toggle-success toggle-lg"
          checked={published}
          onChange={handleToggle}
          disabled={isPending}
        />
        <div>
          <span className="label-text text-lg font-semibold">
            {published ? "公開中" : "非公開"}
          </span>
          <p className="text-sm text-base-content/60 mt-1">
            {published
              ? "診断が公開されており、誰でもアクセスできます"
              : "診断は非公開で、URLを知っている人のみアクセスできます"}
          </p>
        </div>
        {isPending && (
          <span className="loading loading-spinner loading-md ml-auto"></span>
        )}
      </label>
    </div>
  );
}
