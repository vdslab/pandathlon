export class AppError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code?: string,
	) {
		super(message);
		this.name = "AppError";
		Error.captureStackTrace(this, this.constructor);
	}
}

export class BedrockError extends AppError {
	constructor(message: string = "AI generation failed") {
		super(message, 500, "BEDROCK_ERROR");
		this.name = "BedrockError";
	}
}
