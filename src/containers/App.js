import React, { Component } from 'react';

import Title from '../components/Title';
import Editor from '../components/Editor';

class App extends Component {
    render() {
        return (
            <div className="rde-main" flexDirection="column">
                <div className="rde-title">
                    <Title />
                </div>
                <div className="rde-content">
                    <Editor />
                </div>
            </div>
        );
    }
}

export default App;
