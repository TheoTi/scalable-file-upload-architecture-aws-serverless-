import type { ChunkParsed } from './parseChunk';

export function getConsistencyInstallmentValue({
	vlTotal,
	vlPresta,
	qtPrestacoes,
}: ChunkParsed) {
	const totalValue = Number(vlTotal);
	const installmentValue = Number(vlPresta);
	const installmentCount = Number(qtPrestacoes);

	if (
		Number.isNaN(totalValue) ||
		Number.isNaN(installmentValue) ||
		Number.isNaN(installmentCount) ||
		installmentCount === 0
	) {
		return '0';
	}

	const consistentValue = totalValue / installmentCount;

	const tolerance = 0.01;
	if (Math.abs(consistentValue - installmentValue) > tolerance) {
		return String(consistentValue);
	}

	return vlPresta;
}
