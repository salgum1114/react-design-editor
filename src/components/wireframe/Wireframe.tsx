import React, { Component, createRef } from 'react';

import { Flex } from '../flex';

type WireframeProps = {
	canvasRef: React.RefObject<any>;
};

class Wireframe extends Component<WireframeProps> {
	container = createRef<HTMLDivElement>();

	render() {
		const {
			canvasRef: { current },
		} = this.props;

		if (!current) {
			return null;
		}

		return (
			<Flex flexDirection="column">
				<div ref={this.container} style={{ flex: '0 1 auto', margin: 8 }}>
					<img width="144" height="150" src={current.handlers.exportPNG()} />
				</div>
			</Flex>
		);
	}
}

export default Wireframe;
