import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, BEDROCK_EMBEDDING_MODEL_ARN } from "../config/bedrock.js";
import { BedrockError } from "../utils/errors.js";
import type { EmbeddingResponse } from "../types/index.js";

/**
 * Amazon Titan Text Embeddings v2を使用してテキストのベクトル埋め込みを生成
 * @param text 埋め込みを生成するテキスト
 * @returns ベクトル埋め込み
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
	try {
		const requestBody = {
			inputText: text,
			dimensions: 1024, // Titan v2のデフォルト次元数
			normalize: true,  // 正規化
		};

		const command = new InvokeModelCommand({
			modelId: BEDROCK_EMBEDDING_MODEL_ARN,
			contentType: "application/json",
			accept: "application/json",
			body: JSON.stringify(requestBody),
		});

		const response = await bedrockClient.send(command);
		const responseBody = JSON.parse(
			new TextDecoder().decode(response.body),
		) as {
			embedding: number[];
			inputTextTokenCount: number;
		};

		if (!responseBody.embedding || responseBody.embedding.length === 0) {
			throw new BedrockError("ベクトル埋め込みが返されませんでした");
		}

		return {
			embedding: responseBody.embedding,
			dimensions: responseBody.embedding.length,
			inputTextTokenCount: responseBody.inputTextTokenCount,
		};
	} catch (error) {
		throw new BedrockError(
			error instanceof Error ? error.message : "ベクトル埋め込みの生成に失敗しました",
		);
	}
}

