import NoExistWordException from '../exception/NoExistWordException';
import UnsafetyWordException from '../exception/UnsafetyWordException';

const defaultExcludeWords = [
	'window',
	'Window',
	'alert',
	'console',
	'this',
	'eval',
	'new',
	'function',
	'Function',
	'document',
];

const defaultIncludeWords = ['return'];
const parameters = ['value', 'animations', 'styles', 'userProperty'];

type SandBoxParams = {
	excludeWords?: string[];
	includeWords?: string[];
};

class SandBox {
	private excludeWords: string[];

	private includeWords: string[];

	constructor(params: SandBoxParams = {}) {
		this.excludeWords = params.excludeWords || defaultExcludeWords;
		this.includeWords = params.includeWords || defaultIncludeWords;
	}

	verify(code: string) {
		const newCode = code.toString();
		if (this.excludeWords.some(word => code.includes(word))) {
			throw new UnsafetyWordException();
		}
		if (!this.includeWords.some(word => code.includes(word))) {
			throw new NoExistWordException();
		}
		return new Function(...parameters, `"use strict"; ${newCode}`);
	}

	compile(code: string) {
		try {
			return this.verify(code);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.toString ? error.toString() : error.message);
			} else {
				console.error(String(error));
			}
			return undefined;
		}
	}
}

export default SandBox;
