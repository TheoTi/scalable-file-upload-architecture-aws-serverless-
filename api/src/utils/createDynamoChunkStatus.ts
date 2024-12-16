import { randomUUID } from 'node:crypto';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient } from '../clients/dynamoClient';
import { env } from '../config/env';

type CreateDynamoChunkStatusParams = {
	key: string;
	range: string;
};

export async function createDynamoChunkStatus({
	key,
	range,
}: CreateDynamoChunkStatusParams) {
	const command = new PutItemCommand({
		TableName: env.DYNAMO_KRONOOS_UPLOADS_CONTROL_TABLE,
		Item: {
			id: { S: randomUUID() },
			key: { S: key },
			bytesRange: { S: range },
			status: { S: 'pending' },
			createdAt: { S: new Date().toISOString() },
			updatedAt: { NULL: true },
		},
	});

	await dynamoClient.send(command);
}
