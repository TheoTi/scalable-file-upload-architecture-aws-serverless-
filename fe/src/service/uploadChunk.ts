import { sleep } from "@/lib/utils";
import axios from "axios";

type UploadChunkParam = {
	url: string;
	chunk: Blob;

	maxRetries?: number;
};

export async function uploadChunk({
	chunk,
	url,
	maxRetries = 3,
}: UploadChunkParam) {
	try {
		const { headers } = await axios.put<null, { headers: { etag: string } }>(
			url,
			chunk,
		);

		const entityTag = headers.etag?.replace(/"/g, "");

		return { entityTag };
	} catch (error) {
		if (maxRetries > 0) {
			await sleep(2000);
			return uploadChunk({ chunk, url, maxRetries: maxRetries - 1 });
		}

		throw error;
	}
}
