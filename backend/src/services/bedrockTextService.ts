import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, BEDROCK_MODEL_ARN } from "../config/bedrock.js";
import { BedrockError } from "../utils/errors.js";
import type {
	BedrockResponse,
	ParsedBedrockResponse,
	QuizResponse,
} from "../types/index.js";

/**
 * Bedrockを使用してクイズコンテンツを生成する
 * @param title クイズタイトル
 * @param description クイズ説明
 * @param types クイズタイプ
 * @returns 生成済みクイズコンテンツ
 */
export async function generateQuizContent(
	title: string,
	description: string,
	types: string[],
	questions_count: number,
): Promise<QuizResponse> {
	try {
		const prompt = `あなたは性格診断を自動生成するAIです。
ユーザーが与えるテーマ（例：動物、RPG職業、神話の登場人物など）と、
ユーザー指定のタイプリストに基づいて、質問・スコア・診断結果タイプを生成してください。

【タイトル】${title}
【説明】${description}
【ユーザー指定のタイプリスト】${types.map((t, i) => `${i + 1}. ${t}`).join(", ")}

────────────────────────────
【仕様ルール】

1️⃣ タイプ
上記のユーザー指定のタイプリストに対して、各タイプを象徴する修飾語のみを生成してください。
テーマに沿った象徴的でインパクトのある形容詞や修飾語を考えてください。
例：
- 「モンスター」に対して → 修飾語：「悲恋に生きる」
- 「化け物」に対して → 修飾語：「手の付けられない」
- 「戦士」に対して → 修飾語：「孤高の」

base_typeには必ずユーザーが指定した元のタイプ名をそのまま使用し、modifierには修飾語のみを出力してください。

2️⃣ 質問設計（タイプ重み方式）
ユーザー指定の質問数を生成してください。（制約：これが一致するまで繰り返し実行してください。）
各質問には type_weights を割り当てます：
各タイプがどれだけスコアに影響するかを数値で指定
回答値 × type_weights[type] でスコアに加算されます
-各タイプの重みは他の重みと比べて、あまり突出しすぎないようにすべての重みを合計したとき同じ値になるようにしてください。（制約：これが一致するまで繰り返し実行してください。）
すべての質問は7段階評価（−3〜+3）で回答されます。

4️⃣ 結果設計
各タイプには以下を含めてください：
base_type（ユーザーが指定した元のタイプ名）
modifier（テーマに沿った修飾語のみ）
description（100〜200字）
strengths（このタイプの強み・長所を説明する文章、100〜150字）
weaknesses（このタイプの弱み・短所を説明する文章、100〜150字）
good_matches（相性の良いタイプ2つ、オプショナル）
bad_matches（相性の悪いタイプ2つ、オプショナル）
advice（100〜150字）
image_prompt（画像生成用の英語プロンプト、100〜200文字）

5️⃣ 画像生成用プロンプト
各タイプについて、Amazon Nova Canvasで画像を生成するための英語プロンプトを作成してください：
- **必ず最初にタイプ名（modifier + base_type）を含めること**（例：「Destiny-Bound Hero」「Star-Reading Mage」）
  これにより画像生成の指針が明確になり、精度が向上します
- 英語で記述すること（Nova Canvasは英語プロンプトを推奨）
- そのタイプの特徴や雰囲気を視覚的に表現する内容
- 全年齢対象で、争いや危険な行為の描写を避けること
- 穏やかでファンタジー調のスタイルを指定
- 具体的な視覚要素を含める（キャラクターの雰囲気、背景、色調など）

例（必ずタイプ名から始める）：
- "Destiny-Bound Hero A positive leader who inspires hope. You care for your companions and calmly organize situations, guiding everyone toward a bright outcome. No depictions of conflict or dangerous acts; a gentle, wholesome fantasy style."
- "Star-Reading Mage A calm, dependable planner who charts the course with knowledge and intuition. Uses gentle, non-combat magic—like light or breeze—to set the scene and bring out allies' strengths. A composed observer who guides toward the best move. (No combat depictions, no weapons; suitable for all ages.)"


────────────────────────────
【出力形式】
以下のJSON形式で、コードブロック記法を使わず純粋なJSONのみを出力してください。

{
  "quizzes": {
    "title": "string",
    "description": "string",
    "scale_type": "7-point (-3〜+3)",
    "theme": "string",
    "created_by": "system"
  },
  "quiz_elements": [
    {
      "id": "number",
      "question_text": "string",
      "type_weights": {
        "base_type1": "number",
        "base_type2": "number"
      }
    }
  ],
  "quiz_results": [
    {
      "base_type": "string",
      "modifier": "string",
      "description": "string",
      "strengths": "string",
      "weaknesses": "string",
      "good_matches": ["string", "string"],
      "bad_matches": ["string", "string"],
      "advice": "string",
      "image_prompt": "string"
    }
  ]
}

必ず${questions_count}個の質問と${types.length}個の結果を生成してください。`;

		const command = new InvokeModelCommand({
			modelId: BEDROCK_MODEL_ARN,
			contentType: "application/json",
			accept: "application/json",
			body: JSON.stringify({
				anthropic_version: "bedrock-2023-05-31",
				max_tokens: 8192,
				temperature: 0.7,
				messages: [
					{
						role: "user",
						content: prompt,
					},
				],
			}),
		});

		const response = await bedrockClient.send(command);
		const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as BedrockResponse;
		if (!responseBody.content || !responseBody.content[0] || !responseBody.content[0].text) {
			throw new BedrockError("Bedrock APIからの無効なレスポンス");
		}

		let content = responseBody.content[0].text.trim();

		// マークダウンのコードブロック記法を除去
		const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
		const match = content.match(codeBlockRegex);
		if (match) {
			content = match[1].trim();
		}

		const parsed = JSON.parse(content) as ParsedBedrockResponse;

		// LLMから返されたデータをそのまま返す
		return {
			quizzes: parsed.quizzes,
			quiz_elements: parsed.quiz_elements,
			quiz_results: parsed.quiz_results,
		};
	} catch (error) {
		throw new BedrockError(
			error instanceof Error ? error.message : "クイズコンテンツの生成に失敗しました",
		);
	}
}
