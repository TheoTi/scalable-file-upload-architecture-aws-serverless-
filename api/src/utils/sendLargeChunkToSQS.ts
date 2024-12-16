import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '../clients/sqsClient';
import { createDynamoChunkStatus } from './createDynamoChunkStatus';
import { env } from '../config/env';

export const maxMessageSize = 256 * 1024 - 15000;

export async function sendLargeChunkToSQS(
	key: string,
	bytesRange: string,
	chunk: string,
) {
	const totalSubChunks = Math.ceil(Buffer.byteLength(chunk) / maxMessageSize);

	for (let i = 0; i < totalSubChunks; i++) {
		const subChunkStart = i * maxMessageSize;
		const subChunkEnd = Math.min(subChunkStart + maxMessageSize, chunk.length);
		const subChunk = chunk.substring(subChunkStart, subChunkEnd);
		const subChunkRange = `${bytesRange}-part${i + 1}`;

		const subChunkMessage = JSON.stringify({
			key,
			chunk: subChunk,
			range: subChunkRange,
		});

		try {
			await sqsClient.send(
				new SendMessageCommand({
					QueueUrl: env.CONTROL_CHUNKS_QUEUE_URL,
					MessageBody: subChunkMessage,
				}),
			);

			await createDynamoChunkStatus({
				key,
				range: subChunkRange,
			});
		} catch (error) {
			console.error(
				`Error sending subchunk for key ${key} with range ${subChunkRange}:`,
				error,
			);
		}
	}
}
