"use client";

import { useState } from "react";
import { createClient } from "../../../../utils/supabase/client";

export default function MyQuizNewPage() {
  const [quizResults, setQuizResults] = useState(["", ""]);

  async function createQuiz(formData) {
    setQuizResults(["", ""]);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      questions_count: formData.get("questions_count"),
      types: formData.getAll("types"),
    };
    const supabase = createClient();
    const result = await supabase.schema("pgmq_public").rpc("send", {
      queue_name: "quiz_requests",
      message: data,
    });
  }

  return (
    <>
      <form action={createQuiz}>
        <fieldset className="fieldset bg-base-200 border-base-300 w-full rounded-box border p-4">
          <legend className="fieldset-legend">診断を作りましょう！</legend>
          <label className="label">診断テーマは？</label>
          <input
            type="text"
            name="title"
            className="input w-full"
            placeholder="診断テーマ"
            required
          />
          <label className="label">どんな診断？</label>
          <textarea
            name="description"
            className="textarea w-full"
            placeholder="診断の説明"
            required
          ></textarea>
          <label className="label">質問の数は？</label>
          <input
            type="number"
            name="questions_count"
            className="input w-full"
            min="1"
            max="30"
            defaultValue="10"
          />
          <label className="label">診断結果は？</label>
          <div>
            {quizResults.map((item, i) => {
              return (
                <div className="join w-full mb-2" key={i}>
                  <div className="w-full">
                    <label className="input join-item w-full">
                      <input
                        type="text"
                        name="types"
                        placeholder={`診断結果${i + 1}`}
                        value={item}
                        required
                        onChange={(event) => {
                          const newQuizResults = [...quizResults];
                          newQuizResults[i] = event.target.value;
                          setQuizResults(newQuizResults);
                        }}
                      />
                    </label>
                  </div>
                  <button
                    className="btn join-item"
                    onClick={() => {
                      const newQuizResults = [...quizResults];
                      newQuizResults.splice(i, 1);
                      setQuizResults(newQuizResults);
                    }}
                    disabled={quizResults.length <= 2}
                  >
                    -
                  </button>
                </div>
              );
            })}
          </div>
          <button
            className="btn"
            onClick={() => {
              setQuizResults([...quizResults, ""]);
            }}
          >
            診断結果を追加する
          </button>
          <button className="btn btn-accent mt-4" type="submit">
            診断を作る！
          </button>
        </fieldset>
      </form>
    </>
  );
}
