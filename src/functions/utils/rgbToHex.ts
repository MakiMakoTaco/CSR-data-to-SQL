import type { Color } from '../../types/Color';

function rgbToHex(color: Color) {
	// Scale the RGB values to the 0-255 range
	const r = Math.round((color?.red ?? 0) * 255)
		.toString(16)
		.toUpperCase()
		.padStart(2, '0');
	const g = Math.round((color?.green ?? 0) * 255)
		.toString(16)
		.toUpperCase()
		.padStart(2, '0');
	const b = Math.round((color?.blue ?? 0) * 255)
		.toString(16)
		.toUpperCase()
		.padStart(2, '0');

	// Combine the hexadecimal values
	return `#${r}${g}${b}`;
}

export default rgbToHex;
