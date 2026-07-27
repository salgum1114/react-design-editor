export default class NodeConfigurationError extends Error {
	nodeId?: string;
	nodeName?: string;

	constructor(message: string, nodeId?: string, nodeName?: string) {
		super(message);
		this.name = 'NodeConfigurationError';
		this.nodeId = nodeId;
		this.nodeName = nodeName;
	}
}
