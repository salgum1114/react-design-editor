import { Layout, Spin } from 'antd';
import React, { Component } from 'react';

interface IProps {
	title?: React.ReactNode;
	leftSider?: React.ReactNode;
	content?: React.ReactNode;
	rightSider?: React.ReactNode;
	className?: string;
	loading?: boolean;
	children?: React.ReactNode;
}

class Content extends Component<IProps> {
	static defaultProps = {
		className: 'rde-content-layout-main',
		loading: false,
	};

	render() {
		const { title, leftSider, content, rightSider, className, loading, children } = this.props;
		return (
			<Spin spinning={loading}>
				<Layout className="rde-content-layout">
					{title}
					<Layout className={className}>
						{leftSider}
						{content || children}
						{rightSider}
					</Layout>
				</Layout>
			</Spin>
		);
	}
}

export default Content;
