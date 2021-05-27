import CustomHandler from './CustomHandler';

class FiberHandler extends CustomHandler {
	test() {
		console.log(this, 'zzz');
	}
}

export default FiberHandler;
