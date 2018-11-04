import React, { Component } from 'react';

import ImageMapEditor from '../components/imagemap/ImageMapEditor';
import WorkflowEditor from '../components/workflow/WorkflowEditor';
import Title from './Title';

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
        return (
            <div className="rde-main">
                <div className="rde-title">
                    <Title onChangeMenu={this.onChangeMenu} current={this.state.current} />
                </div>
                <div className="rde-content">
                    {
                        this.state.current === 'imagemap' ? (
                            <ImageMapEditor />
                        ) : (
                            <WorkflowEditor />
                        )
                    }
                </div>
            </div>
        );
    }
}

export default App;
