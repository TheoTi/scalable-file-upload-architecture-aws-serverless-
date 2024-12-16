import { S3Client, ListMultipartUploadsCommand } from "@aws-sdk/client-s3";
import { response } from "../../utils/response";
import { env } from "../../config/env";

const s3Client = new S3Client();

export async function handler() {
	const command = new ListMultipartUploadsCommand({
		Bucket: env.UPLOADS_BUCKET_TEST_NAME,
	});

	const { Uploads } = await s3Client.send(command);

	return response(200, {
		uploads: Uploads ?? [],
	});
}
