import React, { Component } from 'react';
import { FlexBox, FlexItem } from '../flex';

class ImageMapTitle extends Component {
	render() {
		const { title, content, action, children } = this.props;
		return (
			children || (
				<FlexBox className="rde-content-layout-title" alignItems="center" flexWrap="wrap">
					<FlexItem flex="0 1 auto">
						<FlexBox
							className="rde-content-layout-title-title"
							justifyContent="flex-start"
							alignItems="center"
						>
							{title instanceof String ? <h3>{title}</h3> : title}
						</FlexBox>
					</FlexItem>
					<FlexItem flex="auto">
						<FlexBox className="rde-content-layout-title-content" alignItems="center">
							{content}
						</FlexBox>
					</FlexItem>
					<FlexItem flex="auto">
						<FlexBox
							className="rde-content-layout-title-action"
							justifyContent="flex-end"
							alignItems="center"
						>
							{action}
						</FlexBox>
					</FlexItem>
				</FlexBox>
			)
		);
	}
}

export default ImageMapTitle;
