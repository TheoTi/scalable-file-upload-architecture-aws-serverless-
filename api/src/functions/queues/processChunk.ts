import type { SQSEvent } from 'aws-lambda';
import pLimit from 'p-limit';
import { createDynamoRecord } from '../../utils/createDynamoRecord';
import { formatCPFOrCNPJ } from '../../utils/formatCPFOrCNPJ';
import { getConsistencyInstallmentValue } from '../../utils/getConsistencyInstallmentValue';
import { parseChunk } from '../../utils/parseChunk';
import { sanitizeDynamoRecord } from '../../utils/sanitizeDynamoRecord';
import { updateChunkStatus } from '../../utils/updateDynamoChunkStatus';

type ProcessChunkBody = {
	key: string;
	range: string;
	chunk: string;
};

const limit = pLimit(15);

export async function handler(event: SQSEvent) {
	for (const record of event.Records) {
		const { key, chunk, range }: ProcessChunkBody = JSON.parse(record.body);

		const chunkParsed = parseChunk(chunk);

		try {
			await updateChunkStatus(key, range, 'processing');

			await Promise.all(
				chunkParsed.map((record) => {
					const consistentInstallmentValue =
						getConsistencyInstallmentValue(record);
					const recordSanitized = sanitizeDynamoRecord({
						...record,
						vlPresta: consistentInstallmentValue,
						nrCpfCnpj: formatCPFOrCNPJ(record.nrCpfCnpj),
					});

					return limit(() => createDynamoRecord(recordSanitized));
				}),
			);

			await updateChunkStatus(key, range, 'completed');

			console.log(
				`Successfully processed chunk for key ${key}, range ${range}`,
			);
		} catch (error) {
			await updateChunkStatus(key, range, 'failed');
			console.error(`Failed to process chunk for key ${key}:`, error);
		}
	}
}
