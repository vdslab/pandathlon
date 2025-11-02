import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, BEDROCK_MODEL_ARN } from "../config/bedrock.js";
import { BedrockError } from "../utils/errors.js";
import type { BedrockResponse, ParsedBedrockResponse, QuizResponse } from "../types/index.js";

/**
 * Bedrockを使用してクイズコンテンツを生成する
 * @param title クイズタイトル
 * @param description クイズ説明
 * @param types クイズタイプ
 * @param questions_count 質問数
 * @param types_description 各タイプの説明
 * @returns 生成済みクイズコンテンツ
 */
export async function generateQuizContent(
	title: string,
	description: string,
	types: string[],
	questions_count: number,
	types_description: string[],
): Promise<QuizResponse> {
	types_description = types_description.map((desc, i) => types[i] + desc);
	console.log(types_description);
	try {
		const prompt = `あなたは性格診断を自動生成するAIです。
ユーザーが与えるテーマ（例：動物、RPG職業、神話の登場人物など）と、
ユーザー指定のタイプリストに基づいて、質問・スコア・診断結果タイプを生成してください。
【タイトル】${title}
【説明】${description}
【ユーザー指定のタイプリスト】${types.map((t, i) => `${i + 1}. ${t}`).join(", ")}
【各タイプの説明】
${types_description.map((t, i) => `${i + 1}. ${t}`).join(", ")}
※各タイプの修飾語・性格説明・診断文は、必ずこの「各タイプの説明」の内容を反映させてください。

────────────────────────────
【仕様ルール】
1️⃣ タイプ
 上記のユーザー指定のタイプリストに対して、各タイプの説明からそのタイプにあった修飾語のみを生成してください。
 テーマに沿った象徴的でインパクトのある形容詞や修飾語を考えてください。
 例：タイプ名「モンスター」に対してタイプの説明「報われない恋をしがち」 → 修飾語：「悲恋に生きる」
     「化け物」に対してタイプの説明「怒るとなにをしでかすかわからない」 → 修飾語：「手の付けられない」
     「戦士」に対して「熱血過ぎて、周りを置いてけぼりにしがち」 → 修飾語：「孤高の」
 base_typeには必ずユーザーが指定したタイプ名を使用してください。
 modifierには、そのタイプの特徴（types_description）を反映した修飾語を生成してください。
 descriptionには、types_descriptionの要素を自然に織り込みながら作成してください
 タイプの説明は自然で、ポジティブな表現にしてください。必ず、ユーザの入力を元にタイプの特徴を説明してください。
 タイプの説明
  - 自然でポジティブな表現
  - 文字数が3000文字以上になるよう調整してください。1文字でも足りない場合は再生成してください。
  - 各タイプの結果には必ず全ての要素を含めること： 
    強み
      - 内容: そのタイプの強みを3つ  
      - トーン: ユーザが調子に乗れるほどのポジティブな表現で,
      弱み
      - 内容: 短所や課題を3つ  
      - トーン: 否定的すぎず、改善の余地があるように,
      相性
      - 内容: 相性の良いタイプを1〜2つ と　相性の悪いタイプを1~2つ 
      - トーン各要素に理由を簡潔に説明,
      アドバイス
      - 内容: 日常・行動面でのアドバイス
      - トーン: 前向きで現実的,

【description作成テンプレート】
次の要素を自然に含めてください：
- base_type（例：「狼」）
- modifier（例：「孤高の」）
- types_description（例：「集団の中で静かに全体を見渡すタイプ」）
- テーマに沿った文体
例：「孤高の狼」は、集団の中で静かに全体を見渡すタイプです。協調よりも独立を好み…（続く）
  

2️⃣ 質問設計（タイプ重み方式）
 質問を${questions_count}個、生成してください。（制約：これが一致するまで繰り返し実行してください）
 各質問には type_weights を割り当てます：
 各タイプがどれだけスコアに影響するかを数値で指定
 回答値 × type_weights[type] でスコアに加算されます
 -各タイプの重みは他の重みと比べて、あまり突出しすぎないようにすべての重みを合計したとき同じ値になるようにしてください。（制約：これが一致するまで繰り返し実行してください。）
 すべての質問は7段階評価（−3〜+3）で回答されます。
4️⃣ 結果設計
 各タイプには以下を必ず含めてください **絶対に省略してはいけません。必ず全タイプに生成してください。そして、以下に書いてある結果以外は生成しないようにしてください**：
 base_type（ユーザーが指定した元のタイプ名）
 modifier（テーマに沿った修飾語のみ）
 description（100〜200字）
 strengths
 weaknesses
 good_match
 advice

 ────────────────────────────
 【出力形式】以下の形は必ず守ってください
 json
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
        "base_type2": "number",
      }
    }
  ],
  "quiz_results": [
    {
      "base_type": "string",
      "modifier": "string",
      "description": "string",
      "strengths": ["string", "string", "string"],
      "weaknesses": ["string", "string", "string"],
      "good_match": {
        "best_matches": ["string", "string"],
        "worst_matches": ["string", "string"],
        "reasons": "string"
      },
      "advice": "string"
    }
  ]
}
必ず${
			types.length
		}個の結果を生成してください。（制約：これが一致するまで繰り返し実行してください）`;

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
