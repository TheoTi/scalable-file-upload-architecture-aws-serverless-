import {
	S3Client,
	AbortMultipartUploadCommand,
	ListMultipartUploadsCommand,
} from "@aws-sdk/client-s3";
import { response } from "../../utils/response";
import { env } from "../../config/env";

const s3Client = new S3Client();

export async function handler() {
	const bucket = env.UPLOADS_BUCKET_TEST_NAME;

	const listMultipartUploadsCommand = new ListMultipartUploadsCommand({
		Bucket: bucket,
	});

	const { Uploads = [] } = await s3Client.send(listMultipartUploadsCommand);

	const aborts = Uploads.map(({ Key, UploadId }) => {
		const abortMultipartUploadCommand = new AbortMultipartUploadCommand({
			Bucket: bucket,
			Key,
			UploadId,
		});

		return s3Client.send(abortMultipartUploadCommand);
	});

	await Promise.allSettled(aborts);

	return response(204);
}
