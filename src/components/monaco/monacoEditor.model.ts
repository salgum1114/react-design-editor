export interface MonacoMarkerLike {
	message: string;
	severity: number;
	startColumn: number;
	startLineNumber: number;
}

const MONACO_ERROR_SEVERITY = 8;

export const normalizeMonacoLanguage = (language: string) =>
	language === 'handlebars' ? 'html' : language;

export const markersToErrors = (markers: MonacoMarkerLike[] = []) =>
	markers
		.filter(marker => marker.severity === MONACO_ERROR_SEVERITY)
		.map(marker => new Error(`${marker.startLineNumber}:${marker.startColumn} ${marker.message}`));
