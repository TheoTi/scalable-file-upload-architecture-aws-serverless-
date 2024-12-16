import type { Readable } from 'node:stream';

export function streamToString(stream: Readable): Promise<string> {
	return new Promise((resolve, reject) => {
		let data = '';
		stream.on('data', (chunk) => {
			data += chunk.toString('utf-8');
		});
		stream.on('end', () => resolve(data));
		stream.on('error', reject);
	});
}
