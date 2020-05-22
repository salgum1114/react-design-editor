import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

class Scrollbar extends Component {
	renderTrack = props => <div {...props} className="rde-track-vertical" />;

	render() {
		return <Scrollbars renderTrackVertical={this.renderTrack}>{this.props.children}</Scrollbars>;
	}
}

export default Scrollbar;
