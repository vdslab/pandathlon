// Bedrock APIから返却される型と、Bedrock serviceから返却される型を定義

/** Claude APIのレスポンス型 */
// Bedrock APIから直接返却される型
export type BedrockResponse = {
	model: string;
	id: string;
	type: string;
	role: string;
	content: Array<{
		type: string;
		text: string;
	}>;
	stop_reason: string;
	stop_sequence: string | null;
	usage: {
		input_tokens: number;
		cache_creation_input_tokens: number;
		cache_read_input_tokens: number;
		output_tokens: number;
	};
};

/** 生成されたクイズの質問要素 */
export type BedrockQuizElement = {
	id: number;
	question_text: string;
	type_weights: Record<string, number>;
};

/** 生成されたクイズの結果タイプ */
export type BedrockQuizResult = {
	base_type: string;
	modifier?: string;
	description: string;
	strengths: string;
	weaknesses: string;
	good_matches?: [string, string];
	bad_matches?: [string, string];
	advice: string;
};

/** Bedrock APIから返却されたJSONデータをパースした型 */
export type ParsedBedrockResponse = {
	quizzes: {
		title: string;
		description: string;
		scale_type: string;
		theme: string;
		created_by: string;
	};
	quiz_elements: BedrockQuizElement[];
	quiz_results: BedrockQuizResult[];
};

// クイズに関する型定義
/** 設問データ */
export type QuizQuestion = {
	id: number;
	text: string;
	weights: Record<string, number>;
};

/** 診断結果データ */
export type QuizResult = {
	type: string;
	description: string;
	strengths: string;
	weaknesses: string;
	good_matches?: [string, string];
	bad_matches?: [string, string];
	advice: string;
};

/** リクエスト型 */
export type QuizRequest = {
	title: string;
	types: string[];
	description: string;
	questions_count: number;
};

/** レスポンス型 */
export type QuizResponse = {
	quizzes: {
		title: string;
		description: string;
		scale_type: string;
		theme: string;
		created_by: string;
	};
	quiz_elements: BedrockQuizElement[];
	quiz_results: BedrockQuizResult[];
};
