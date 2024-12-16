import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { S3Event } from "aws-lambda";
import { streamToString } from "../../utils/streamToString";
import { s3Client } from "../../clients/s3Client";
import type { Readable } from "node:stream";
import { mbToBytes } from "../../utils/mbToBytes";
import { env } from "../../config/env";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../../clients/sqsClient";
import {
	maxMessageSize,
	sendLargeChunkToSQS,
} from "../../utils/sendLargeChunkToSQS";
import { createDynamoChunkStatus } from "../../utils/createDynamoChunkStatus";

const chunkSize = mbToBytes(1);

export async function handler(event: S3Event) {
	const record = event.Records[0];

	const bucket = env.UPLOADS_BUCKET_TEST_NAME;
	const objectSize = record.s3.object.size;
	const key = record.s3.object.key;

	const totalChunks = Math.ceil(objectSize / chunkSize);

	for (let i = 0; i < totalChunks; i++) {
		const rangeStart = i * chunkSize;
		const rangeEnd = Math.min(rangeStart + chunkSize - 1, objectSize - 1);
		const bytesRange = `bytes=${rangeStart}-${rangeEnd}`;

		const getObjectCommand = new GetObjectCommand({
			Bucket: bucket,
			Key: key,
			Range: bytesRange,
		});

		try {
			const response = await s3Client.send(getObjectCommand);

			if (!response.Body) {
				console.error(
					`Nothing to be processed reading Bucket: ${bucket}, Key: ${key} and Range: ${bytesRange}`,
				);

				continue;
			}

			const chunk = await streamToString(response.Body as Readable);

			const messageBody = JSON.stringify({ key, chunk, range: bytesRange });

			if (Buffer.byteLength(messageBody) > maxMessageSize) {
				await sendLargeChunkToSQS(key, bytesRange, chunk);
			} else {
				await sqsClient.send(
					new SendMessageCommand({
						QueueUrl: env.CONTROL_CHUNKS_QUEUE_URL,
						MessageBody: messageBody,
					}),
				);

				await createDynamoChunkStatus({
					key,
					range: bytesRange,
				});
			}
		} catch (error) {
			console.error(
				`Error processing object ${key} from range ${bytesRange}:`,
				error,
			);
		}
	}
}
