import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

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
                <Helmet>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-97485289-3"></script>
                    <script>
                        {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'UA-97485289-3');
                        `}
                    </script>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="manifest" href="./manifest.json" />
                    <link rel="shortcut icon" href="./favicon.ico" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/earlyaccess/notosanskr.css" />
                    <title>React Design Editor</title>
                </Helmet>
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
