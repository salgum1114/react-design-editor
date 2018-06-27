import React, { Component } from 'react';

class FooterToolbar extends Component {
    render() {
        const { width } = this.props;
        return (
            <div style={{ width }}>
                Footer
            </div>
        );
    }
}

export default FooterToolbar;
