import React, { Component } from 'react';
import PropertyFrom from './properties/PropertyForm';

class Properties extends Component {
    render() {
        const { type } = this.props;
        return (
            <PropertyFrom type={type} />
        );
    }
}

export default Properties;
