import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import type { QuizRequest, QuizResponse } from "../types/index.js";
import type { GenerateSingleImageRequest } from "../types/image.js";
import { generateQuizContent } from "../services/bedrockTextService.js";
import { generateImageBinary } from "../services/bedrockImageService.js";
	
export const quizzesRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
	/**
	 * クイズ作成
	 * @param request - リクエスト
	 * @param reply - レスポンス
	 * @returns クイズ作成結果
	 */
	fastify.post<{ Body: QuizRequest }>("/api/quizzes", async (request, reply) => {
		const { title, description, types, questions_count } = request.body;

		const response: QuizResponse = await generateQuizContent(title, description, types, questions_count);
		return reply.code(201).send(response);
	});

	/**
	 * 画像生成エンドポイント（バイナリレスポンス）
	 * @param request - リクエスト
	 * @param reply - レスポンス
	 * @returns 画像バイナリ（image/png）
	 */
	fastify.post<{ Body: GenerateSingleImageRequest }>(
		"/api/image",
		async (request, reply) => {
			const { image_prompt } = request.body;

			// バイナリで画像を生成
			const imageBuffer = await generateImageBinary(image_prompt);

			// バイナリレスポンスとして返す
			return reply
				.code(200)
				.header("Content-Type", "image/png")
				.send(imageBuffer);
		}
	);

	done();
};
