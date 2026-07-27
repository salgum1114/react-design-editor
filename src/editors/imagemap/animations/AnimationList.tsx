import { Avatar, Button, List } from 'antd';
import React from 'react';

import Icon from '../../../components/icon/Icon';

type AnimationItem = {
	title?: string;
	type?: string;
};

interface AnimationListProps {
	animations?: AnimationItem[];
	onEdit?: (animation: AnimationItem, index: number) => void;
	onDelete?: (index: number) => void;
}

export default function AnimationList({ animations = [], onDelete, onEdit }: AnimationListProps) {
	return (
		<List
			dataSource={animations}
			renderItem={(animation, index) => {
				const actions = [
					<Button className="rde-action-btn" shape="circle" onClick={() => onEdit?.(animation, index)}>
						<Icon name="edit" />
					</Button>,
					<Button className="rde-action-btn" shape="circle" onClick={() => onDelete?.(index)}>
						<Icon name="times" />
					</Button>,
				];

				return (
					<List.Item actions={actions}>
						<List.Item.Meta
							avatar={<Avatar>{index}</Avatar>}
							title={animation.title}
							description={animation.type}
						/>
					</List.Item>
				);
			}}
		/>
	);
}
