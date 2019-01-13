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
        const { current } = this.state;
        return (
            <div className="rde-main">
                <div className="rde-title">
                    <Title onChangeMenu={this.onChangeMenu} current={current} />
                </div>
                <div className="rde-content">
                    {
                        current === 'imagemap' ? (
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
