import axios from "axios";

type AbortMPUParams = {
	fileKey: string;
	uploadId: string;
};

export async function abortMPU({ fileKey, uploadId }: AbortMPUParams) {
	const url =
		"https://4q034oeea4.execute-api.sa-east-1.amazonaws.com/abort-mpu";

	await axios.delete(url, {
		data: {
			fileKey,
			uploadId,
		},
	});
}
