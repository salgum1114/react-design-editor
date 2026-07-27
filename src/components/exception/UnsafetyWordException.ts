export default class UnsafetyWordException extends Error {
	constructor() {
		super('Includes unsafety word.');
		this.name = 'UnsafetyWordException';
	}
}