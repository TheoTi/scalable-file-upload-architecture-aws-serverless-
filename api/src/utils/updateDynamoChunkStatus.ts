import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient } from '../clients/dynamoClient';
import { env } from '../config/env';

export async function updateChunkStatus(
	key: string,
	range: string,
	status: 'processing' | 'completed' | 'failed',
) {
	const command = new UpdateItemCommand({
		TableName: env.DYNAMO_KRONOOS_UPLOADS_CONTROL_TABLE,
		Key: {
			key: { S: key },
			bytesRange: { S: range },
		},
		UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
		ExpressionAttributeNames: {
			'#status': 'status',
			'#updatedAt': 'updatedAt',
		},
		ExpressionAttributeValues: {
			':status': { S: status },
			':updatedAt': { S: new Date().toISOString() },
		},
	});

	await dynamoClient.send(command);
}
