import type { EditorTheme } from '../../theme/editorTheme';

export interface MonacoMarkerLike {
	message: string;
	severity: number;
	startColumn: number;
	startLineNumber: number;
}

const MONACO_ERROR_SEVERITY = 8;

export const normalizeMonacoLanguage = (language: string) =>
	language === 'handlebars' ? 'html' : language;

export const resolveMonacoTheme = (editorTheme: EditorTheme, explicitTheme?: string) =>
	explicitTheme || (editorTheme === 'light' ? 'vs' : 'vs-dark');

export const markersToErrors = (markers: MonacoMarkerLike[] = []) =>
	markers
		.filter(marker => marker.severity === MONACO_ERROR_SEVERITY)
		.map(marker => new Error(`${marker.startLineNumber}:${marker.startColumn} ${marker.message}`));
