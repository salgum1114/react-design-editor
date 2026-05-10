import { fabric } from 'fabric';

import { registerFabricClass } from '../utils';

class Toolbar extends fabric.Group {
	static type = 'toolbar';
	superType = 'toolbar';

	constructor(_options: any) {
		super([]);
	}
}

registerFabricClass('Toolbar', Toolbar);

export default Toolbar;
