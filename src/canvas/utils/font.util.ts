export function buildAdjustedText(adjustedLines: string[]) {
	return adjustedLines.join('\n'); // 줄바꿈 추가
}

export function getCharacterWidth(
	context: CanvasRenderingContext2D,
	char: string,
	fontSize: number,
	fontFamily: string,
) {
	context.font = `${fontSize}px '${fontFamily}'`; // 폰트 설정
	return context.measureText(char).width;
}

export function adjustCharactersToFitWidth(
	context: CanvasRenderingContext2D,
	text: string,
	fontSize: number,
	fontFamily: string,
	rectWidth: number,
) {
	let line = '';
	let lines: string[] = [];
	let currentWidth = 0;
	for (let char of text) {
		const charWidth = getCharacterWidth(context, char, fontSize, fontFamily);
		if (currentWidth + charWidth > rectWidth) {
			lines.push(line); // 현재 줄 추가
			line = char; // 새로운 줄 시작
			currentWidth = charWidth;
		} else {
			line += char;
			currentWidth += charWidth;
		}
	}
	if (line) lines.push(line); // 마지막 줄 추가
	return lines;
}

export function fitTextToRect(
	context: CanvasRenderingContext2D,
	text: string,
	fontSize: number,
	fontFamily: string,
	rectWidth: number,
	rectHeight: number,
) {
	for (let size = fontSize; size > 0; size--) {
		const adjustedLines = adjustCharactersToFitWidth(context, text, size, fontFamily, rectWidth);
		const height = adjustedLines.length * size * 1.2; // 줄 간격 포함 높이 계산
		if (height <= rectHeight) {
			return { text: adjustedLines.join('\n'), fontSize: size, height };
		}
	}
	return { text: '', fontSize: 0, height: 0 }; // 폰트 크기가 너무 작아서 맞출 수 없는 경우
}
