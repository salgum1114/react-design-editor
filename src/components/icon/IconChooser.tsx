import { Button, Col, Form, Input, Modal, Row } from 'antd';
import { debounce } from 'lodash-es';
import React from 'react';

import i18next from 'i18next';
import icons from '../../libs/fontawesome-5.2.0/metadata/icons.json';
import Icon from './Icon';
import styles from './IconChooser.module.css';

type IconMetadata = {
	search: {
		terms: string[];
	};
	styles: string[];
};

type IconMap = Record<string, IconMetadata>;
type IconValue = Record<string, IconMetadata>;

const iconRegistry = icons as IconMap;

interface IconChooserProps {
	onChange?: (icon: IconValue) => void;
	value?: IconValue;
	icon?: IconValue;
}

interface IconChooserState {
	icon: IconValue;
	textSearch: string;
	visible: boolean;
}

class IconChooser extends React.Component<IconChooserProps, IconChooserState> {
	static defaultProps = {
		icon: { 'map-marker-alt': iconRegistry['map-marker-alt'] },
	};

	getCurrentIcon = () => this.props.value || this.props.icon || { 'map-marker-alt': iconRegistry['map-marker-alt'] };

	state: IconChooserState = {
		icon: this.getCurrentIcon(),
		textSearch: '',
		visible: false,
	};

	componentDidUpdate(prevProps: IconChooserProps) {
		const nextIcon = this.getCurrentIcon();
		if (prevProps.value !== this.props.value || prevProps.icon !== this.props.icon) {
			this.setState({
				icon: nextIcon,
			});
		}
	}

	handlers = {
		onOk: () => {
			const { icon } = this.state;
			this.props.onChange?.(icon);
			this.setState({ visible: false });
		},
		onCancel: () => {
			this.modalHandlers.onHide();
		},
		onClick: () => {
			this.modalHandlers.onShow();
		},
		onClickIcon: (icon: IconValue) => {
			this.setState({ icon }, () => {
				this.props.onChange?.(icon);
				this.modalHandlers.onHide();
			});
		},
		onSearch: debounce((value: string) => {
			this.setState({ textSearch: value });
		}, 500),
	};

	modalHandlers = {
		onShow: () => {
			this.setState({ visible: true });
		},
		onHide: () => {
			this.setState({ visible: false });
		},
	};

	getPrefix = (style: string) => {
		if (style === 'brands') {
			return 'fab';
		}
		if (style === 'regular') {
			return 'far';
		}
		return 'fas';
	};

	getIcons = (textSearch: string) => {
		const lowerCase = textSearch.toLowerCase();
		return Object.keys(iconRegistry)
			.filter(
				icon =>
					icon.includes(lowerCase) || iconRegistry[icon].search.terms.some(term => term.includes(lowerCase)),
			)
			.map(icon => ({ [icon]: iconRegistry[icon] }));
	};

	render() {
		const { onOk, onCancel, onClick, onClickIcon, onSearch } = this.handlers;
		const { icon, visible, textSearch } = this.state;
		const selectedName = Object.keys(icon)[0];
		const selectedMetadata = icon[selectedName];
		const filteredIcons = this.getIcons(textSearch);
		const filteredIconsLength = filteredIcons.length;

		return (
			<React.Fragment>
				<Form.Item
					label={
						<React.Fragment>
							<span style={{ marginRight: 8 }}>{i18next.t('common.icon')}</span>
							<Icon name={selectedName} prefix={this.getPrefix(selectedMetadata.styles[0])} />
						</React.Fragment>
					}
					colon={false}
				>
					<Button onClick={onClick}>{i18next.t('imagemap.marker.choose-icon')}</Button>
				</Form.Item>
				<Modal
					onOk={onOk}
					onCancel={onCancel}
					width="80%"
					open={visible}
					title={
						<div style={{ padding: '0 24px' }}>
							<Input
								onChange={event => {
									onSearch(event.target.value);
								}}
								placeholder={i18next.t('imagemap.marker.search-icon', { length: filteredIconsLength })}
							/>
						</div>
					}
					bodyStyle={{ margin: 16, overflowY: 'auto', height: '600px' }}
				>
					<Row>
						{filteredIcons.map(iconEntry => {
							const name = Object.keys(iconEntry)[0];
							const metadata = iconEntry[name];
							const prefix = this.getPrefix(metadata.styles[0]);
							return (
								<Col
									onClick={() => onClickIcon(iconEntry)}
									key={name}
									span={4}
									className={styles.iconContainer}
								>
									<div className={styles.iconTop}>
										<Icon name={name} size={3} prefix={prefix} />
									</div>
									<div className={styles.iconBottom}>{name}</div>
								</Col>
							);
						})}
					</Row>
				</Modal>
			</React.Fragment>
		);
	}
}

export default IconChooser;
