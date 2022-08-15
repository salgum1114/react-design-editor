import { Canvas } from '@react-design-editor/canvas';
import React from 'react';

const ImageMap = () => {
	return (
		<div>
			<Canvas canvasOption={{ backgroundColor: 'red' }} workareaOption={{ backgroundColor: 'blue' }} />
		</div>
	);
};

export default ImageMap;
