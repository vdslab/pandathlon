import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import type { QuizRequest, QuizResponse } from "../types/index.js";
import { generateQuizContent } from "../services/bedrockTextService.js";
	
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

	done();
};
