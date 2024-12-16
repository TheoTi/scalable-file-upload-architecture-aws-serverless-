import { CompleteMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { response } from "../../utils/response";
import { env } from "../../config/env";

type RequestBody = {
	fileKey: string;
	uploadId: string;
	parts: {
		partNumber: number;
		entityTag: string;
	}[];
};

const s3Client = new S3Client();

export async function handler(event: APIGatewayProxyEventV2) {
	const { fileKey, uploadId, parts } = JSON.parse(
		event.body ?? "",
	) as RequestBody;

	const bucket = env.UPLOADS_BUCKET_TEST_NAME;

	const command = new CompleteMultipartUploadCommand({
		Bucket: bucket,
		Key: fileKey,
		UploadId: uploadId,
		MultipartUpload: {
			Parts: parts.map(({ entityTag, partNumber }) => ({
				PartNumber: partNumber,
				ETag: entityTag,
			})),
		},
	});

	await s3Client.send(command);

	return response(204);
}
