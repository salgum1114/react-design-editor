export default class UnsafetyWordException {
	constructor() {
		this.message = 'Includes unsafety word.';
		this.name = 'UnsafetyWordException';
	}

	toString() {
		return `${this.name}: ${this.message}`;
	}
}
