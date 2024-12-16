export function validateCNPJ(cnpj: string) {
	if (/^(\d)\1+$/.test(cnpj)) {
		return false;
	}

	let sum = 0;
	let size = cnpj.length - 2;
	let numbers = cnpj.substring(0, size);
	const digits = cnpj.substring(size);
	let pos = size - 7;

	for (let i = size; i >= 1; i--) {
		sum += Number(numbers[size - i]) * pos--;
		if (pos < 2) pos = 9;
	}

	let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

	if (result !== Number(digits[0])) {
		return false;
	}

	size += 1;
	numbers = cnpj.substring(0, size);
	sum = 0;

	let pos2 = size - 7;

	for (let i = size; i >= 1; i--) {
		sum += Number(numbers[size - i]) * pos2--;

		if (pos2 < 2) {
			pos2 = 9;
		}
	}

	result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

	return result === Number(digits[1]);
}
