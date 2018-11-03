import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18next';

import CommonButton from '../../common/CommonButton';
import { FlexBox, FlexItem } from '../../flex';

class NodeAction extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
    }

    render() {
        const { canvasRef, selectedItem } = this.props;
        return (
            <FlexBox justifyContent="center" alignItems="flex-end" flex="1">
                <FlexItem alignSelf="flex-start">
                    <CommonButton
                        icon="clone"
                        onClick={() => { canvasRef.handlers.duplicate(); }}
                    >
                        {i18n.t('action.clone')}
                    </CommonButton>
                </FlexItem>
                <FlexItem alignSelf="flex-end">
                    <CommonButton
                        icon="trash"
                        type="danger"
                        onClick={() => { canvasRef.handlers.remove(); }}
                    >
                        {i18n.t('action.delete')}
                    </CommonButton>
                </FlexItem>
            </FlexBox>
        );
    }
}

export default NodeAction;
