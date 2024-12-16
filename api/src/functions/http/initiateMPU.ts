import {
	CreateMultipartUploadCommand,
	S3Client,
	UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { randomUUID } from "node:crypto";
import { response } from "../../utils/response";
import { env } from "../../config/env";

const s3Client = new S3Client();

export async function handler(event: APIGatewayProxyEventV2) {
	const { filename, totalChunks } = JSON.parse(event.body ?? "");

	const bucket = env.UPLOADS_BUCKET_TEST_NAME;
	const key = `${randomUUID()}-${filename}`;

	const createMPUCommand = new CreateMultipartUploadCommand({
		Bucket: bucket,
		Key: key,
	});

	const { UploadId } = await s3Client.send(createMPUCommand);

	if (!UploadId) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Failed to create multipart upload",
			}),
		};
	}

	const signedURLPromises = [];

	for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
		const uploadPartCommand = new UploadPartCommand({
			Bucket: bucket,
			Key: key,
			UploadId,
			PartNumber: partNumber,
		});

		signedURLPromises.push(
			getSignedUrl(s3Client, uploadPartCommand, { expiresIn: 3600 }),
		);
	}

	const urls = await Promise.all(signedURLPromises);

	return response(201, {
		key,
		uploadId: UploadId,
		parts: urls.map((url, index) => ({
			url,
			partNumber: index + 1,
		})),
	});
}
