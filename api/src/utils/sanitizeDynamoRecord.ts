import { formatCurrencyValues } from './formatCurrencyValues';
import type { ChunkParsed } from './parseChunk';

export function sanitizeDynamoRecord(record: ChunkParsed) {
	const vlTotal = formatCurrencyValues(record.vlTotal);
	const vlPresta = formatCurrencyValues(record.vlPresta);
	const vlMora = formatCurrencyValues(record.vlMora);
	const vlMulta = formatCurrencyValues(record.vlMulta);
	const vlOutAcr = formatCurrencyValues(record.vlOutAcr);
	const vlIof = formatCurrencyValues(record.vlIof);
	const vlDescon = formatCurrencyValues(record.vlDescon);
	const vlAtual = formatCurrencyValues(record.vlAtual);

	return {
		...record,
		vlTotal,
		vlPresta,
		vlMora,
		vlMulta,
		vlOutAcr,
		vlIof,
		vlDescon,
		vlAtual,
	};
}
