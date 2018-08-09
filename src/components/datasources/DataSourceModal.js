import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';

import Icon from '../Icon';

class DataSourceModal extends Component {
    render() {
        return (
            <div style={{ padding: 8 }}>
                <Button className="rde-action-btn" shape="circle">
                    <Icon name="plus" />
                </Button>
                <Button className="rde-action-btn" shape="circle">
                    <Icon name="times" />
                </Button>
                <Modal>
                    test
                </Modal>
            </div>
        );
    }
}

export default DataSourceModal;
