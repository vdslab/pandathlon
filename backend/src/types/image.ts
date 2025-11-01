/** Base64エンコードされた画像文字列 */
export type Base64Image = string;

/**
 * Amazon Nova Canvas 画像生成レスポンス
 * Nova Canvas APIから返却される生成画像データ
 */
export type NovaCanvasImageResponse = {
	/** 生成された画像の配列（base64エンコード） */
	images: Base64Image[];
};

/**
 * 画像生成サービスのレスポンス型
 * generateImage関数の返り値として使用
 */
export type ImageGenerationResponse = {
	/** 生成された画像の配列<base64> */
	images: Base64Image[];
	/** シード値（オプショナル） */
	seed?: number;
};

/**
 * 画像生成APIリクエスト（/api/image）
 * 1つのbase_type:image_promptに対して、1つの画像バイナリを返す
 */
export type GenerateSingleImageRequest = {
	/** タイプ名（base_type） */
	base_type: string;
	/** 画像生成用プロンプト */
	image_prompt: string;
};
