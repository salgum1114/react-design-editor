import React, { PropsWithChildren, useState } from 'react';
import { NodeObject } from '../canvas/objects/Node';
import { FlowContext } from '../contexts';

const FlowContainer: React.FC<PropsWithChildren> = props => {
	const { children } = props;
	const [selectedFlowNode, setSelectedFlowNode] = useState<NodeObject>();
	return (
		<FlowContext.Provider
			value={{
				selectedFlowNode,
				setSelectedFlowNode,
			}}
		>
			{children}
		</FlowContext.Provider>
	);
};

export default FlowContainer;
