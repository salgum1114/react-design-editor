import { Avatar, Button, List } from 'antd';
import React from 'react';

import Icon from '../../../components/icon/Icon';

type StyleItem = {
	title?: string;
	fill?: string;
	opacity?: number;
};

interface StyleListProps {
	styles?: StyleItem[];
	onEdit?: (style: StyleItem, index: number) => void;
	onDelete?: (index: number) => void;
}

export default function StyleList({ onDelete, onEdit, styles = [] }: StyleListProps) {
	return (
		<List
			dataSource={styles}
			renderItem={(style, index) => {
				const actions = [
					<Button className="rde-action-btn" shape="circle" onClick={() => onEdit?.(style, index)}>
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
							title={style.title}
							description={`fill: ${style.fill}, opacity: ${style.opacity}`}
						/>
					</List.Item>
				);
			}}
		/>
	);
}
