import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const bedrockModelArn = process.env.BEDROCK_MODEL_ARN;
const bedrockImageModelArn = process.env.BEDROCK_IMAGE_MODEL_ARN;

if (!bedrockModelArn) {
	throw new Error("BEDROCK_MODEL_ARNが設定されていません");
}

if (!bedrockImageModelArn) {
	throw new Error("BEDROCK_IMAGE_MODEL_ARNが設定されていません");
}

// Claude用のBedrockクライアント
// 開発環境: .envのアクセスキーを使用
// 本番環境（ECS）: タスクロールを自動的に使用
export const bedrockClient = new BedrockRuntimeClient({
	region: awsRegion,
	...(awsAccessKeyId && awsSecretAccessKey
		? {
				credentials: {
					accessKeyId: awsAccessKeyId,
					secretAccessKey: awsSecretAccessKey,
				},
		}
		: {}),
});
export const BEDROCK_MODEL_ARN: string = bedrockModelArn;
export const BEDROCK_IMAGE_MODEL_ARN = bedrockImageModelArn;
