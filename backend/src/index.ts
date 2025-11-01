import dotenv from "dotenv";

// 環境変数の読み込み
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

async function start(): Promise<void> {
	try {
		// 動的インポートで環境変数読み込み後にモジュールをロード
		const { App } = await import("./app.js");
		const app = await App();

		await app.listen({ port: PORT, host: HOST });

		console.log(`
                                            
Server running at: http://${HOST}:${PORT}
Health check: http://${HOST}:${PORT}/health

    `);
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

// Graceful shutdown
process.on("SIGINT", () => {
	console.log("\nShutting down gracefully...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("\nShutting down gracefully...");
	process.exit(0);
});

// Promise は意図的に待機しないことをvoidで明示
void start();
