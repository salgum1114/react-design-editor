import { Button, Form } from 'antd';
import i18n from 'i18next';
import React from 'react';

import { Flex } from '../../../components/flex';
import Icon from '../../../components/icon/Icon';
import type { StyleModalHandle } from './StyleModal';
import StyleList from './StyleList';
import StyleModal from './StyleModal';

type StyleItem = Record<string, any>;

type ValidationState = {
	validateStatus: string;
	help: string;
};

interface StylesProps {
	styles?: StyleItem[];
	onChangeStyles?: (styles: StyleItem[]) => void;
}

const initialValidationState: ValidationState = {
	validateStatus: '',
	help: '',
};

export default function Styles({ onChangeStyles, styles = [] }: StylesProps) {
	const [style, setStyle] = React.useState<StyleItem>({});
	const [visible, setVisible] = React.useState(false);
	const [validateTitle, setValidateTitle] = React.useState<ValidationState>(initialValidationState);
	const [current, setCurrent] = React.useState<'add' | 'modify'>('add');
	const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
	const modalRef = React.useRef<StyleModalHandle | null>(null);

	const validate = React.useCallback(
		(value?: string): ValidationState => {
			if (!value || !value.length) {
				return {
					validateStatus: 'error',
					help: i18n.t('validation.enter-property', { arg: i18n.t('common.title') }),
				};
			}

			const exists = styles.some(item => item.title === value);
			if (!exists) {
				return {
					validateStatus: 'success',
					help: '',
				};
			}

			return {
				validateStatus: 'error',
				help: i18n.t('validation.already-property', { arg: i18n.t('common.title') }),
			};
		},
		[styles],
	);

	const handleOk = React.useCallback(async () => {
		if (validateTitle.validateStatus === 'error') {
			return;
		}
		if (!style.title) {
			setValidateTitle(validate());
			return;
		}

		let nextStyle = style;
		if (Object.keys(nextStyle).length === 1) {
			const values = await modalRef.current?.validateFields();
			nextStyle = {
				...nextStyle,
				...(values || {}),
			};
		}

		const nextStyles = [...styles];
		if (current === 'add') {
			nextStyles.push(nextStyle);
		} else if (editingIndex !== null) {
			nextStyles.splice(editingIndex, 1, nextStyle);
		}

		setVisible(false);
		setStyle({});
		onChangeStyles?.(nextStyles);
	}, [current, editingIndex, onChangeStyles, style, styles, validate, validateTitle.validateStatus]);

	const handleCancel = React.useCallback(() => {
		setVisible(false);
		setStyle({});
		setValidateTitle(initialValidationState);
	}, []);

	const handleAdd = React.useCallback(() => {
		setVisible(true);
		setStyle({});
		setValidateTitle(initialValidationState);
		setCurrent('add');
		setEditingIndex(null);
	}, []);

	const handleEdit = React.useCallback((nextStyle: StyleItem, index: number) => {
		setVisible(true);
		setStyle(nextStyle);
		setValidateTitle(initialValidationState);
		setCurrent('modify');
		setEditingIndex(index);
	}, []);

	const handleDelete = React.useCallback(
		(index: number) => {
			const nextStyles = [...styles];
			nextStyles.splice(index, 1);
			onChangeStyles?.(nextStyles);
		},
		[onChangeStyles, styles],
	);

	const handleClear = React.useCallback(() => {
		onChangeStyles?.([]);
	}, [onChangeStyles]);

	const handleChange = React.useCallback(
		(_props: unknown, changedValues: Record<string, any>, allValues: Record<string, any>) => {
			const field = Object.keys(changedValues)[0];
			if (field === 'title') {
				setValidateTitle(validate(changedValues[field]));
			}

			setStyle(prevStyle => ({
				title: prevStyle.title,
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
					<StyleModal
						ref={modalRef}
						validateTitle={validateTitle}
						visible={visible}
						onOk={handleOk}
						style={style}
						onCancel={handleCancel}
						onChange={handleChange}
					/>
				</Flex>
				<StyleList styles={styles} onEdit={handleEdit} onDelete={handleDelete} />
			</Flex>
		</Form>
	);
}
