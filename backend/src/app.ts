import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { quizzesRoutes } from "./api/quizzes.js";
import { AppError } from "./utils/errors.js";

export async function App(): Promise<FastifyInstance> {
	const fastify = Fastify({
		logger: {
			level: process.env.LOG_LEVEL || "info",
		},
	});

	// CORS設定
	await fastify.register(cors, {
		origin: process.env.CORS_ORIGIN || "*",
		credentials: true,
	});

	// ヘルスチェック
	fastify.get("/health", () => {
		return { status: "ok", timestamp: new Date().toISOString() };
	});

	// ルート登録
	await fastify.register(quizzesRoutes);

	// エラーハンドラー
	fastify.setErrorHandler((error, request, reply) => {
		if (error instanceof AppError) {
			return reply.code(error.statusCode).send({
				error: error.message,
				code: error.code,
			});
		}

		// デフォルトのエラーハンドリング
		fastify.log.error(error);
		return reply.code(500).send({
			error: "Internal server error",
			message: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	});

	// 404 ハンドラー
	fastify.setNotFoundHandler((request, reply) => {
		return reply.code(404).send({
			error: "Not found",
			path: request.url,
		});
	});

	return fastify;
}
