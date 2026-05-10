import { Button, Form } from 'antd';
import React from 'react';

import { Flex } from '../../../components/flex';
import Icon from '../../../components/icon/Icon';
import type { DataSourceModalHandle } from './DataSourceModal';
import DataSourceList from './DataSourceList';
import DataSourceModal from './DataSourceModal';

type DataSourceItem = Record<string, any>;

type ValidationState = {
	validateStatus: string;
	help: string;
};

interface DataSourcesProps {
	dataSources?: DataSourceItem[];
	onChangeDataSources?: (dataSources: DataSourceItem[]) => void;
}

const initialValidationState: ValidationState = {
	validateStatus: '',
	help: '',
};

export default function DataSources({ dataSources = [], onChangeDataSources }: DataSourcesProps) {
	const [dataSource, setDataSource] = React.useState<DataSourceItem>({});
	const [visible, setVisible] = React.useState(false);
	const [validateTitle, setValidateTitle] = React.useState<ValidationState>(initialValidationState);
	const [current, setCurrent] = React.useState<'add' | 'modify'>('add');
	const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
	const modalRef = React.useRef<DataSourceModalHandle | null>(null);

	const validate = React.useCallback(
		(value?: string): ValidationState => {
			if (!value || !value.length) {
				return {
					validateStatus: 'error',
					help: 'Please input title.',
				};
			}

			const exists = dataSources.some(item => item.title === value);
			if (!exists) {
				return {
					validateStatus: 'success',
					help: '',
				};
			}

			return {
				validateStatus: 'error',
				help: 'Already exist title.',
			};
		},
		[dataSources],
	);

	const handleOk = React.useCallback(async () => {
		if (validateTitle.validateStatus === 'error') {
			return;
		}
		if (!dataSource.title) {
			setValidateTitle(validate());
			return;
		}

		let nextDataSource = dataSource;
		if (Object.keys(nextDataSource).length === 1) {
			const values = await modalRef.current?.validateFields();
			nextDataSource = {
				...nextDataSource,
				...(values || {}),
			};
		}

		const nextDataSources = [...dataSources];
		if (current === 'add') {
			nextDataSources.push(nextDataSource);
		} else if (editingIndex !== null) {
			nextDataSources.splice(editingIndex, 1, nextDataSource);
		}

		setVisible(false);
		setDataSource({});
		onChangeDataSources?.(nextDataSources);
	}, [current, dataSource, dataSources, editingIndex, onChangeDataSources, validate, validateTitle.validateStatus]);

	const handleCancel = React.useCallback(() => {
		setVisible(false);
		setDataSource({});
		setValidateTitle(initialValidationState);
	}, []);

	const handleAdd = React.useCallback(() => {
		setVisible(true);
		setDataSource({});
		setValidateTitle(initialValidationState);
		setCurrent('add');
		setEditingIndex(null);
	}, []);

	const handleEdit = React.useCallback((nextDataSource: DataSourceItem, index: number) => {
		setVisible(true);
		setDataSource(nextDataSource);
		setValidateTitle(initialValidationState);
		setCurrent('modify');
		setEditingIndex(index);
	}, []);

	const handleDelete = React.useCallback(
		(index: number) => {
			const nextDataSources = [...dataSources];
			nextDataSources.splice(index, 1);
			onChangeDataSources?.(nextDataSources);
		},
		[dataSources, onChangeDataSources],
	);

	const handleClear = React.useCallback(() => {
		onChangeDataSources?.([]);
	}, [onChangeDataSources]);

	const handleChange = React.useCallback(
		(_props: unknown, changedValues: Record<string, any>, allValues: Record<string, any>) => {
			const field = Object.keys(changedValues)[0];
			if (field === 'title') {
				setValidateTitle(validate(changedValues[field]));
			}

			setDataSource(prevDataSource => ({
				title: prevDataSource.title,
				...allValues,
			}));
		},
		[validate],
	);

	return (
		<Form>
			<Flex flexDirection="column">
				<Flex justifyContent="flex-end" style={{ padding: 8 }}>
					<Button className="rde-action-btn" shape="circle" onClick={handleAdd}>
						<Icon name="plus" />
					</Button>
					<Button className="rde-action-btn" shape="circle" onClick={handleClear}>
						<Icon name="times" />
					</Button>
					<DataSourceModal
						ref={modalRef}
						validateTitle={validateTitle}
						visible={visible}
						onOk={handleOk}
						dataSource={dataSource}
						onCancel={handleCancel}
						onChange={handleChange}
					/>
				</Flex>
				<DataSourceList dataSources={dataSources} onEdit={handleEdit} onDelete={handleDelete} />
			</Flex>
		</Form>
	);
}
