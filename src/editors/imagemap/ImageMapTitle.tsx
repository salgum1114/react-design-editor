import React from 'react';

import { Flex } from '../../components/flex';

interface ImageMapTitleProps {
	title?: React.ReactNode;
	content?: React.ReactNode;
	action?: React.ReactNode;
	children?: React.ReactNode;
}

export default function ImageMapTitle({ action, children, content, title }: ImageMapTitleProps) {
	if (children) {
		return <>{children}</>;
	}

	return (
		<Flex className="rde-content-layout-title" alignItems="center" flexWrap="wrap">
			<Flex.Item flex="0 1 auto">
				<Flex className="rde-content-layout-title-title" justifyContent="flex-start" alignItems="center">
					{typeof title === 'string' ? <h3>{title}</h3> : title}
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
	);
}
