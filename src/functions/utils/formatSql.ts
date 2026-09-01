import { Color } from '../../types/Color';

function rgbToHex(color: Color | undefined) {
	// Scale the RGB values to the 0-255 range
	const red = Math.round((color?.red ?? 0) * 255)
		.toString(16)
		.padStart(2, '0');
	const green = Math.round((color?.green ?? 0) * 255)
		.toString(16)
		.padStart(2, '0');
	const blue = Math.round((color?.blue ?? 0) * 255)
		.toString(16)
		.padStart(2, '0');

	return { red, green, blue };
}

function formatString(string: string | null | undefined) {
	if (!string || string === '') return null;

	return `'${string.replaceAll("'", "''")}'`;
}

function formatArray(array: string[]) {
	if (array.length === 0) return null;

	return `ARRAY[${array.map((tag) => formatString(tag)).join(', ')}]`;
}

function formatColor(color: Color | undefined) {
	const { red, green, blue } = rgbToHex(color);

	return `decode('${red}${green}${blue}', 'hex')`;
}

export { formatString, formatArray, formatColor };
