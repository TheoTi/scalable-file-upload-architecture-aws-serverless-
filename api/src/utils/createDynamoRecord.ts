import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { ChunkParsed } from './parseChunk';
import { env } from '../config/env';
import { randomUUID } from 'node:crypto';
import { dynamoClient } from '../clients/dynamoClient';

export async function createDynamoRecord(record: ChunkParsed) {
	const putItemCommand = new PutItemCommand({
		TableName: env.DYNAMO_KRONOOS_RECORDS_TABLE,
		Item: {
			id: { S: randomUUID() },
			...Object.fromEntries(
				Object.entries(record).map(([k, v]) => [k, { S: v }]),
			),
		},
	});

	try {
		await dynamoClient.send(putItemCommand);
	} catch (error) {
		console.error('Failed to insert record into DynamoDB: ', error);
	}
}
