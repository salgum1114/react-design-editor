import { Button, Form, Modal } from 'antd';
import i18n from 'i18next';
import React from 'react';
import AceCodeEditor from '../ace/AceCodeEditor';

import Icon from '../icon/Icon';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

interface ChartModalProps {
	value?: string;
	onChange?: (value: string) => void;
	form?: any;
}

interface ChartModalState {
	chartOption?: string;
	tempChartOption?: string;
	visible: boolean;
}

class ChartModal extends React.Component<ChartModalProps, ChartModalState> {
	state: ChartModalState = {
		chartOption: this.props.value,
		tempChartOption: this.props.value,
		visible: false,
	};

	componentDidUpdate(prevProps: ChartModalProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({
				chartOption: this.props.value,
				tempChartOption: this.props.value,
			});
		}
	}

	handlers = {
		onOk: () => {
			const { onChange } = this.props;
			const { tempChartOption } = this.state;
			onChange?.(tempChartOption || '');
			this.setState({
				visible: false,
				chartOption: tempChartOption,
			});
		},
		onCancel: () => {
			this.modalHandlers.onHide();
		},
		onClick: () => {
			this.modalHandlers.onShow();
		},
	};

	modalHandlers = {
		onShow: () => {
			this.setState(prevState => ({
				visible: true,
				tempChartOption: prevState.chartOption,
			}));
		},
		onHide: () => {
			this.setState({
				visible: false,
			});
		},
	};

	render() {
		const { onOk, onCancel, onClick } = this.handlers;
		const { visible, chartOption, tempChartOption } = this.state;
		const label = (
			<React.Fragment>
				<span style={{ marginRight: 8 }}>{i18n.t('common.code')}</span>
				<Button onClick={onClick} shape="circle" className="rde-action-btn">
					<Icon name="edit" />
				</Button>
			</React.Fragment>
		);
		const codeLabel = <span>Code (value, styles, animations, userProperty)</span>;

		return (
			<React.Fragment>
				<Form.Item label={label} colon={false}>
					<pre style={{ wordBreak: 'break-all', lineHeight: '1.2em' }}>{chartOption}</pre>
				</Form.Item>
				<Modal onCancel={onCancel} onOk={onOk} open={visible} style={{ minWidth: 800 }}>
					<Form.Item label={codeLabel} colon={false}>
						<AceCodeEditor
							mode="javascript"
							theme="github"
							width="100%"
							height="600px"
							defaultValue={chartOption}
							value={tempChartOption}
							editorProps={{
								$blockScrolling: true,
							}}
							onChange={text => {
								this.setState({ tempChartOption: text });
							}}
						/>
					</Form.Item>
				</Modal>
			</React.Fragment>
		);
	}
}

export default ChartModal;
