import React, { Component } from 'react';

import ImageMap from '../components/imagemap/Editor';
import WorkflowEditor from '../components/workflow/WorkflowEditor';
import Title from '../components/workflow/Title';

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
            <div className="rde-main">
                <div className="rde-title">
                    <Title onChangeMenu={this.onChangeMenu} current={this.state.current} />
                </div>
                <div className="rde-content">
                    <WorkflowEditor />
                </div>
            </div>
        );
    }
}

export default App;
