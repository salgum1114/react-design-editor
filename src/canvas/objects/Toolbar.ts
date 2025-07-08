const Toolbar = fabric.util.createClass(fabric.Group, {
	superType: 'toolbar',
	type: 'toolbar',
	initialize(options: any) {
		const objects = [];
		this.callSuper('initialize', objects);
	},
});
