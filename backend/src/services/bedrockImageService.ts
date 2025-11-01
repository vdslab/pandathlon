import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, BEDROCK_IMAGE_MODEL_ARN } from "../config/bedrock.js";
import { BedrockError } from "../utils/errors.js";
import type { 
	ImageGenerationResponse, 
	NovaCanvasImageResponse 
} from "../types/image.js";

/**
 * Amazon Nova Canvas v1:0の画像生成
 * @param prompt テキストプロンプト（英語推奨）
 * @returns 生成された画像データ
 */
export async function generateImage(
	prompt: string,
): Promise<ImageGenerationResponse> {
	try {
		// NOTE:height,widthでアス比変えれる
		const requestBody = {
			taskType: "TEXT_IMAGE",
			textToImageParams: {
				text: prompt,
			},
			imageGenerationConfig: {
				numberOfImages: 1,
				quality: "standard",
				height: 1024,
				width: 1024,
				seed: Math.floor(Math.random() * 858993460),
			},
		};

		const command = new InvokeModelCommand({
			modelId: BEDROCK_IMAGE_MODEL_ARN,
			contentType: "application/json",
			accept: "application/json",
			body: JSON.stringify(requestBody),
		});
		const response = await bedrockClient.send(command);
		const responseBody = JSON.parse(
			new TextDecoder().decode(response.body),
		) as NovaCanvasImageResponse;

		if (!responseBody.images || responseBody.images.length === 0) {
			throw new BedrockError("画像が返されませんでした");
		}

		return {
			images: responseBody.images,
		};
	} catch (error) {
		throw new BedrockError(
			error instanceof Error ? error.message : "画像生成に失敗しました",
		);
	}
}

/**
 * バイナリ変換用
 * @param prompt
 * @returns 生成された画像データ（Buffer）
 */
export async function generateImageBinary(prompt: string): Promise<Buffer> {
	try {
		const response = await generateImage(prompt);
		
		if (!response.images[0]) {
			throw new BedrockError("画像が返されませんでした");
		}

		// base64をBufferに変換
		return Buffer.from(response.images[0], "base64");
	} catch (error) {
		throw new BedrockError(
			error instanceof Error ? error.message : "画像生成に失敗しました",
		);
	}
}
