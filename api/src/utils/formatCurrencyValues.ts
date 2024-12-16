export function formatCurrencyValues(value: string | number | bigint) {
	if (
		(typeof value !== 'number' && typeof value !== 'bigint') ||
		(typeof value === 'string' && Number.isNaN(Number(value)))
	) {
		return value;
	}

	return Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value);
}
