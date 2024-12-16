import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function mbToBytes(mbs: number) {
	return mbs * 1024 * 1024;
}

export function sleep(delay = 1000) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}
