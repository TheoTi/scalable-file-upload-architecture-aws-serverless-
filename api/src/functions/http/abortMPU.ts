import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { response } from "../../utils/response";
import { env } from "../../config/env";

const s3Client = new S3Client();

export async function handler(event: APIGatewayProxyEventV2) {
	const { fileKey, uploadId } = JSON.parse(event.body ?? "");

	const command = new AbortMultipartUploadCommand({
		Bucket: env.UPLOADS_BUCKET_TEST_NAME,
		Key: fileKey,
		UploadId: uploadId,
	});

	await s3Client.send(command);

	return response(204);
}
