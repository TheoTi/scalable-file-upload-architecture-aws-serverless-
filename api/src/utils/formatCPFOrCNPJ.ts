import { formatCNPJ } from './formatCNPJ';
import { formatCPF } from './formatCPF';
import { validateCNPJ } from './validateCNPJ';
import { validateCPF } from './validateCPF';

export function formatCPFOrCNPJ(value = '') {
	const cleanValue = value.replace(/\D/g, '');

	if (/^\d{11}$/.test(cleanValue) && validateCPF(cleanValue)) {
		return formatCPF(cleanValue);
	}

	if (/^\d{14}$/.test(cleanValue) && validateCNPJ(cleanValue)) {
		return formatCNPJ(cleanValue);
	}

	return 'invalid';
}
