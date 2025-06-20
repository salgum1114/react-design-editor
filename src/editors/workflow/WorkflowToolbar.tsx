import { Button } from 'antd';
import clsx from 'clsx';
import i18n from 'i18next';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CanvasInstance, LinkObject, NodeObject } from '../../canvas';
import { code } from '../../canvas/constants';
import { CommonButton } from '../../components/common';

interface IProps {
	instance: CanvasInstance;
	zoomRatio: number;
	debugEnabled?: boolean;
	setDebugEnabled?: any;
}

class WorkflowToolbar extends Component<IProps> {
	static propTypes = {
		instance: PropTypes.any,
		selectedItem: PropTypes.object,
		zoomRatio: PropTypes.number,
	};

	state = {
		interactionMode: 'selection',
	};

	componentDidMount() {
		const { instance } = this.props;
		this.waitForCanvasRender(instance);
	}

	componentWillUnmount() {
		const { instance } = this.props;
		this.detachEventListener(instance);
	}

	handlers = {
		selection: () => {
			this.props.instance.handler.interactionHandler.selection();
			this.setState({ interactionMode: 'selection' });
		},
		grab: () => {
			this.props.instance.handler.interactionHandler.grab();
			this.setState({ interactionMode: 'grab' });
		},
	};

	events = {
		keydown: e => {
			if (this.props.instance.canvas.wrapperEl !== document.activeElement) {
				return false;
			}
			if (e.code === code.KEY_Q) {
				this.handlers.selection();
			} else if (e.code === code.KEY_W) {
				this.handlers.grab();
			}
		},
	};

	waitForCanvasRender = canvas => {
		setTimeout(() => {
			if (canvas) {
				this.attachEventListener(canvas);
				return;
			}
			const { instance } = this.props;
			this.waitForCanvasRender(instance);
		}, 5);
	};

	attachEventListener = instance => {
		instance.canvas.wrapperEl.addEventListener('keydown', this.events.keydown, false);
	};

	detachEventListener = instance => {
		instance.canvas.wrapperEl.removeEventListener('keydown', this.events.keydown);
	};

	render() {
		const { instance, zoomRatio, debugEnabled, setDebugEnabled } = this.props;
		const { interactionMode } = this.state;
		const { selection, grab } = this.handlers;
		const zoomValue = parseInt((zoomRatio * 100).toFixed(2), 10);
		return (
			<React.Fragment>
				<div className={clsx('rde-editor-toolbar', 'interaction')}>
					<Button.Group>
						<CommonButton
							type={interactionMode === 'selection' ? 'primary' : 'default'}
							style={{ borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px' }}
							onClick={() => {
								selection();
							}}
							icon="mouse-pointer"
							tooltipTitle={i18n.t('action.selection')}
						/>
						<CommonButton
							type={interactionMode === 'grab' ? 'primary' : 'default'}
							style={{ borderBottomRightRadius: '8px', borderTopRightRadius: '8px' }}
							onClick={() => {
								grab();
							}}
							tooltipTitle={i18n.t('action.grab')}
							icon="hand-rock"
						/>
					</Button.Group>
				</div>
				<div className={clsx('rde-editor-toolbar', 'zoom')}>
					<Button.Group>
						<CommonButton
							style={{ borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px' }}
							onClick={() => {
								instance.handler.zoomHandler.zoomIn();
							}}
							icon="search-plus"
							tooltipTitle={i18n.t('action.zoom-in')}
						/>
						<CommonButton
							onClick={() => instance.handler.zoomHandler.zoomToFitWithObject()}
							tooltipTitle={i18n.t('action.one-to-one')}
						>
							{`${zoomValue}%`}
						</CommonButton>
						<CommonButton
							style={{ borderBottomRightRadius: '8px', borderTopRightRadius: '8px' }}
							onClick={() => {
								instance.handler.zoomHandler.zoomOut();
							}}
							icon="search-minus"
							tooltipTitle={i18n.t('action.zoom-out')}
						/>
					</Button.Group>
				</div>
				<div className={clsx('rde-editor-toolbar', 'layout')}>
					<Button.Group>
						<CommonButton
							icon="bezier-curve"
							tooltipTitle={i18n.t('action.run-layout')}
							onClick={async () => {
								instance.canvas.discardActiveObject();
								await instance.handler.layoutHandler.runLayout({
									type: 'elk',
									nodes: instance.handler
										.getObjects()
										.filter(obj => obj.superType === 'node') as NodeObject[],
									links: instance.handler
										.getObjects()
										.filter(obj => obj.superType === 'link') as LinkObject[],
								});
								instance.handler.zoomHandler.zoomToFitWithObject();
							}}
						/>
					</Button.Group>
				</div>
			</React.Fragment>
		);
	}
}

export default WorkflowToolbar;
