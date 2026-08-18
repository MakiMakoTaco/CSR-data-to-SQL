function letterToNumber(letter: string) {
	return letter.toLowerCase().charCodeAt(0) - 96;
}

export default letterToNumber;
