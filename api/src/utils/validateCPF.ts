export function validateCPF(cpf: string) {
	if (/^(\d)\1+$/.test(cpf)) {
		return false;
	}

	let sum = 0;
	let remainder: number;

	for (let i = 1; i <= 9; i++) {
		sum += Number(cpf[i - 1]) * (11 - i);
	}

	remainder = (sum * 10) % 11;

	if (remainder === 10 || remainder === 11) {
		remainder = 0;
	}

	if (remainder !== Number(cpf[9])) {
		return false;
	}

	sum = 0;

	for (let i = 1; i <= 10; i++) {
		sum += Number(cpf[i - 1]) * (12 - i);
	}

	remainder = (sum * 10) % 11;

	if (remainder === 10 || remainder === 11) {
		remainder = 0;
	}

	return remainder === Number(cpf[10]);
}
