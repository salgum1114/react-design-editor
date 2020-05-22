class NodeConfigurationError extends Error {
    constructor(message, nodeId, nodeName) {
        super(message);
        this.name = 'NodeConfigurationError';
        this.message = message;
        this.nodeId = nodeId;
        this.nodeName = nodeName;
    }
}

export default NodeConfigurationError;
