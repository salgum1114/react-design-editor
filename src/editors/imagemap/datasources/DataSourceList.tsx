import { Avatar, Button, List } from 'antd';
import React from 'react';

import Icon from '../../../components/icon/Icon';

type DataSourceItem = {
	title?: string;
	type?: string;
};

interface DataSourceListProps {
	dataSources?: DataSourceItem[];
	onEdit?: (dataSource: DataSourceItem, index: number) => void;
	onDelete?: (index: number) => void;
}

export default function DataSourceList({ dataSources = [], onDelete, onEdit }: DataSourceListProps) {
	return (
		<List
			dataSource={dataSources}
			renderItem={(dataSource, index) => {
				const actions = [
					<Button className="rde-action-btn" shape="circle" onClick={() => onEdit?.(dataSource, index)}>
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
							title={dataSource.title}
							description={dataSource.type}
						/>
					</List.Item>
				);
			}}
		/>
	);
}
