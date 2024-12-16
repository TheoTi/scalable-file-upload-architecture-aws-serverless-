import { useState } from "react";
import { Input } from "./components/ui/input";
import { Toaster } from "./components/ui/toaster";
import { Button } from "./components/ui/button";
import { toast } from "./hooks/use-toast";
import { mbToBytes } from "./lib/utils";
import { initiateMPU } from "./service/initiateMPU";
import { completeMPU } from "./service/completeMPU";
import { uploadChunk } from "./service/uploadChunk";
import { abortMPU } from "./service/abortMPU";

export function App() {
	const [file, setFile] = useState<File>();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!file) {
			return;
		}

		const chunkSize = mbToBytes(5);
		const totalChunks = Math.ceil(file.size / chunkSize);

		const { key, parts, uploadId } = await initiateMPU({
			filename: file.name,
			totalChunks,
		});

		try {
			const uploadedParts = await Promise.all(
				parts.map(async ({ url, partNumber }, index) => {
					const chunkStart = index * chunkSize;
					const chunkEnd = Math.min(chunkStart + chunkSize, file.size);

					const fileChunk = file.slice(chunkStart, chunkEnd);

					const { entityTag } = await uploadChunk({
						url,
						chunk: fileChunk,
						maxRetries: 3,
					});

					return {
						partNumber,
						entityTag,
					};
				}),
			);

			await completeMPU({
				uploadId,
				fileKey: key,
				parts: uploadedParts,
			});

			toast({
				title: "Upload realizado com sucesso!",
				className: "bg-emerald-600",
			});
		} catch {
			await abortMPU({
				fileKey: key,
				uploadId,
			});

			toast({
				title: "Ocorreu um erro ao fazer o upload do arquivo!",
				className: "bg-destructive",
			});
		}
	}

	return (
		<>
			<Toaster />

			<div className="w-full min-h-screen grid place-items-center">
				<div className="w-full max-w-lg">
					<h1 className="text-4xl font-semibold tracking-tighter mb-10">
						Selecione um arquivo
					</h1>

					<form className="space-y-4" onSubmit={handleSubmit}>
						<Input
							type="file"
							onChange={(event) =>
								event.target.files && setFile(event.target.files[0])
							}
						/>
						<Button type="submit" className="w-full" disabled={!file}>
							Enviar
						</Button>
					</form>
				</div>
			</div>
		</>
	);
}
