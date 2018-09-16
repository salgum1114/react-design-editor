import React, { Component } from 'react';

import ImageMap from '../components/imagemap/Editor';
import Workflow from '../components/workflow/Editor';

class App extends Component {
    state = {
        current: 'imagemap',
    }

    onChangeMenu = ({ key }) => {
        this.setState({
            current: key,
        });
    }

    render() {
        return this.state.current === 'imagemap' ? (
            <ImageMap current={this.state.current} onChangeMenu={this.onChangeMenu} />
        ) : (
            <Workflow current={this.state.current} onChangeMenu={this.onChangeMenu} />
        );
    }
}

export default App;
