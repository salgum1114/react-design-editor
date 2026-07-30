import type { FabricObjectOption, FabricObjects } from '../models';

const normalizeFabricObjectType = (type?: string) =>
	String(type ?? '')
		.replace(/[-_]/g, '')
		.toLowerCase();

export const resolveFabricObjectType = (
	fabricObjects: FabricObjects | undefined,
	object: {
		nodeClazz?: FabricObjectOption['nodeClazz'];
		superType?: FabricObjectOption['superType'];
		type?: string;
	},
) => {
	const candidates = object.superType === 'node'
		? [object.nodeClazz, object.type]
		: [object.type];
	const registeredTypes = Object.keys(fabricObjects ?? {});

	for (const candidate of candidates) {
		const normalizedCandidate = normalizeFabricObjectType(candidate);
		const resolvedType = registeredTypes.find(
			type => normalizeFabricObjectType(type) === normalizedCandidate,
		);
		if (resolvedType) {
			return resolvedType;
		}
	}
	return undefined;
};
