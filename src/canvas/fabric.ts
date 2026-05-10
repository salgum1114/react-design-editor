import * as FabricModule from 'fabric/es';

const fabric = { ...FabricModule } as typeof FabricModule;

if (typeof window !== 'undefined') {
	window.fabric = window.fabric || {};
	Object.assign(window.fabric, fabric);
}

export * from 'fabric/es';
export { fabric };
export default fabric;
