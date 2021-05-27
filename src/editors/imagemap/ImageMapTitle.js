import React, { Component } from 'react';
import { Flex } from '../../components/flex';

class ImageMapTitle extends Component {
	render() {
		const { title, content, action, children } = this.props;
		return (
			children || (
				<Flex className="rde-content-layout-title" alignItems="center" flexWrap="wrap">
					<Flex.Item flex="0 1 auto">
						<Flex
							className="rde-content-layout-title-title"
							justifyContent="flex-start"
							alignItems="center"
						>
							{title instanceof String ? <h3>{title}</h3> : title}
						</Flex>
					</Flex.Item>
					<Flex.Item flex="auto">
						<Flex className="rde-content-layout-title-content" alignItems="center">
							{content}
						</Flex>
					</Flex.Item>
					<Flex.Item flex="auto">
						<Flex className="rde-content-layout-title-action" justifyContent="flex-end" alignItems="center">
							{action}
						</Flex>
					</Flex.Item>
				</Flex>
			)
		);
	}
}

export default ImageMapTitle;
