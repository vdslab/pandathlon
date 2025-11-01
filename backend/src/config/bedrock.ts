import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const bedrockModelArn = process.env.BEDROCK_MODEL_ARN;

if (!awsAccessKeyId || !awsSecretAccessKey) {
	throw new Error("AWSの認証情報が設定されていません");
}

if (!bedrockModelArn) {
	throw new Error("BEDROCK_MODEL_ARNが設定されていません");
}

export const bedrockClient = new BedrockRuntimeClient({
	region: awsRegion,
	credentials: {
		accessKeyId: awsAccessKeyId,
		secretAccessKey: awsSecretAccessKey,
	},
});

export const BEDROCK_MODEL_ARN = bedrockModelArn;
