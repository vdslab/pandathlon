"use client";

import { useState } from "react";
import BasicInfoTab from "./BasicInfoTab";
import QuestionsTab from "./QuestionsTab";
import ResultTypesTab from "./ResultTypesTab";
import ScoreWeightsTab from "./ScoreWeightsTab";
import PublishButton from "./PublishButton";

export default function QuizEditForm({
  quiz,
  elements,
  results,
  scores,
  readOnly = false,
}) {
  const [activeTab, setActiveTab] = useState("basic");

  const tabs = [
    { id: "basic", label: "基本情報", icon: "📝" },
    { id: "questions", label: "質問", icon: "❓" },
    { id: "results", label: "結果タイプ", icon: "🎯" },
    { id: "scores", label: "スコア設定", icon: "⚖️" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {readOnly ? "診断の詳細" : "診断を編集"}
        </h1>
        <p className="text-base-content/60">
          {readOnly
            ? "公開済みの診断の内容を確認できます。公開後は編集できません。"
            : "診断の内容を編集できます。公開すると編集できなくなりますのでご注意ください。"}
        </p>
      </div>

      {/* Published Alert */}
      {readOnly && (
        <div className="alert alert-success mb-8">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
              公開済みの診断は編集できません。内容を確認できます。
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-8 bg-base-200 p-2">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            className={`tab tab-lg flex-1 ${
              activeTab === tab.id ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </a>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === "basic" && (
          <BasicInfoTab quiz={quiz} readOnly={readOnly} />
        )}
        {activeTab === "questions" && (
          <QuestionsTab
            quizId={quiz.id}
            elements={elements}
            readOnly={readOnly}
          />
        )}
        {activeTab === "results" && (
          <ResultTypesTab
            quizId={quiz.id}
            results={results}
            readOnly={readOnly}
          />
        )}
        {activeTab === "scores" && (
          <ScoreWeightsTab
            quizId={quiz.id}
            elements={elements}
            results={results}
            scores={scores}
            readOnly={readOnly}
          />
        )}
      </div>

      {/* Publish Section - Only show for non-published quizzes */}
      {!readOnly && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">公開設定</h2>
            <PublishButton quizId={quiz.id} initialPublished={quiz.published} />
          </div>
        </div>
      )}
    </div>
  );
}
