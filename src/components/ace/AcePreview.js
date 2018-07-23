import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

class AcePreview extends Component {
    static propTypes = {
        html: PropTypes.string,
        css: PropTypes.string,
        js: PropTypes.string,
    }

    static defaultProps = {
        html: '',
        css: '',
        js: '',
    }

    componentDidUpdate() {
        const { html, css, js } = this.props;
        if (this.previewRef) {
            if (html.length || js.length) {
                this.previewRef.contentWindow.document.body.innerHTML = `${html}<script>${js}</script>`;
            }
            if (css.length) {
                this.previewRef.contentWindow.document.head.innerHTML = `<style type="text/css">${css}</style>`;
            }
        }
    }

    render() {
        return (
            <Form.Item label="Preview" colon={false}>
                <iframe ref={(c) => { this.previewRef = c; }} width="100%" height="200px" />
            </Form.Item>
        );
    }
}

export default AcePreview;
