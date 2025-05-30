import { Handler } from '.';

export default abstract class AbstractHandler {
	protected handler: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
		this.initialize();
	}

	protected initialize() {}
}
