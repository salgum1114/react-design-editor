import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Spin } from 'antd';

class Container extends Component {
    static propTypes = {
        title: PropTypes.any,
        leftSider: PropTypes.any,
        content: PropTypes.any,
        rightSider: PropTypes.any,
        className: PropTypes.string,
        loading: PropTypes.bool,
    }

    static defaultProps = {
        className: 'rde-content-layout-main',
        loading: false,
    }

    render() {
        const { title, leftSider, content, rightSider, className, loading } = this.props;
        return (
            <Spin spinning={loading}>
                <Layout className="rde-content-layout">
                    {title}
                    <Layout
                        style={{
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            minHeight: 'calc(100vh - 98px)',
                            height: 'calc(100vh - 98px)',
                        }}
                        className={className}
                    >
                        {leftSider}
                        {content}
                        {rightSider}
                    </Layout>
                </Layout>
            </Spin>
        );
    }
}

export default Container;
