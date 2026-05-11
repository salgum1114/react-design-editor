import { Button, Form } from 'antd';
import React from 'react';

import i18next from 'i18next';
import Scrollbar from '../../../components/common/Scrollbar';
import { Flex } from '../../../components/flex';
import Icon from '../../../components/icon/Icon';
import AnimationList from './AnimationList';
import type { AnimationModalHandle } from './AnimationModal';
import AnimationModal from './AnimationModal';

type AnimationItem = Record<string, any>;

type ValidationState = {
	validateStatus: string;
	help: string;
};

interface AnimationsProps {
	animations?: AnimationItem[];
	onChangeAnimations?: (animations: AnimationItem[]) => void;
}

const initialAnimation: AnimationItem = {
	type: 'none',
	loop: true,
	autoplay: true,
	delay: 100,
	duration: 1000,
};

const initialValidationState: ValidationState = {
	validateStatus: '',
	help: '',
};

export default function Animations({ animations = [], onChangeAnimations }: AnimationsProps) {
	const [animation, setAnimation] = React.useState<AnimationItem>(initialAnimation);
	const [visible, setVisible] = React.useState(false);
	const [validateTitle, setValidateTitle] = React.useState<ValidationState>(initialValidationState);
	const [current, setCurrent] = React.useState<'add' | 'modify'>('add');
	const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
	const modalRef = React.useRef<AnimationModalHandle | null>(null);

	const validate = React.useCallback(
		(value?: string): ValidationState => {
			if (!value || !value.length) {
				return {
					validateStatus: 'error',
					help: i18next.t('validation.enter-property', { arg: i18next.t('common.title') }),
				};
			}

			const exists = animations.some(item => item.title === value);
			if (!exists) {
				return {
					validateStatus: 'success',
					help: '',
				};
			}

			return {
				validateStatus: 'error',
				help: i18next.t('validation.already-property', { arg: i18next.t('common.title') }),
			};
		},
		[animations],
	);

	const handleOk = React.useCallback(async () => {
		if (validateTitle.validateStatus === 'error') {
			return;
		}
		if (!animation.title) {
			setValidateTitle(validate());
			return;
		}

		let nextAnimation = {
			...animation,
			type: animation.type || 'none',
		};

		if (Object.keys(nextAnimation).length === 2) {
			const values = await modalRef.current?.validateFields();
			nextAnimation = {
				...nextAnimation,
				...(values?.animation || {}),
			};
		}

		const nextAnimations = [...animations];
		if (current === 'add') {
			nextAnimations.push(nextAnimation);
		} else if (editingIndex !== null) {
			nextAnimations.splice(editingIndex, 1, nextAnimation);
		}

		setVisible(false);
		setAnimation({});
		onChangeAnimations?.(nextAnimations);
	}, [animation, animations, current, editingIndex, onChangeAnimations, validate, validateTitle.validateStatus]);

	const handleCancel = React.useCallback(() => {
		setVisible(false);
		setAnimation(initialAnimation);
		setValidateTitle(initialValidationState);
	}, []);

	const handleAdd = React.useCallback(() => {
		setVisible(true);
		setAnimation(initialAnimation);
		setValidateTitle(initialValidationState);
		setCurrent('add');
		setEditingIndex(null);
	}, []);

	const handleEdit = React.useCallback((nextAnimation: AnimationItem, index: number) => {
		setVisible(true);
		setAnimation(nextAnimation);
		setValidateTitle(initialValidationState);
		setCurrent('modify');
		setEditingIndex(index);
	}, []);

	const handleDelete = React.useCallback(
		(index: number) => {
			const nextAnimations = [...animations];
			nextAnimations.splice(index, 1);
			onChangeAnimations?.(nextAnimations);
		},
		[animations, onChangeAnimations],
	);

	const handleClear = React.useCallback(() => {
		onChangeAnimations?.([]);
	}, [onChangeAnimations]);

	const handleChange = React.useCallback(
		(_props: unknown, changedValues: Record<string, any>, allValues: Record<string, any>) => {
			const nextGroup = changedValues[Object.keys(changedValues)[0]] || {};
			const field = Object.keys(nextGroup)[0];
			if (field === 'title') {
				setValidateTitle(validate(nextGroup[field]));
			}

			const nextValues = allValues[Object.keys(allValues)[0]] || {};
			setAnimation(prevAnimation => ({
				title: prevAnimation.title,
				...initialAnimation,
				...nextValues,
			}));
		},
		[validate],
	);

	return (
		<Scrollbar>
			<Form>
				<Flex flexDirection="column">
					<Flex justifyContent="flex-end" style={{ padding: 8 }}>
						<Button className="rde-action-btn" shape="circle" onClick={handleAdd}>
							<Icon name="plus" />
						</Button>
						<Button className="rde-action-btn" shape="circle" onClick={handleClear}>
							<Icon name="times" />
						</Button>
						<AnimationModal
							ref={modalRef}
							validateTitle={validateTitle}
							visible={visible}
							onOk={handleOk}
							animation={animation}
							onCancel={handleCancel}
							onChange={handleChange}
						/>
					</Flex>
					<AnimationList animations={animations} onEdit={handleEdit} onDelete={handleDelete} />
				</Flex>
			</Form>
		</Scrollbar>
	);
}
