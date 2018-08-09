import React, { Component } from 'react';

import { FlexBox } from '../flex';
import StylesModal from './StylesModal';
import StylesList from './StylesList';

class Styles extends Component {
    state = {
        styles: [],
    }

    render() {
        const { styles } = this.state;
        return (
            <FlexBox flexDirection="column">
                <FlexBox justifyContent="flex-end">
                    <StylesModal />
                </FlexBox>
                <StylesList styles={styles} />
            </FlexBox>
        );
    }
}

export default Styles;
