import { Handler } from '.';

class CustomHandler {
	handler: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
		this.initialze();
	}

	protected initialze() {}
}

export default CustomHandler;
