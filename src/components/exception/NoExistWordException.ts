export default class NoExistWordException extends Error {
	constructor() {
		super('Does not exist word.');
		this.name = 'NoExistWordException';
	}
}