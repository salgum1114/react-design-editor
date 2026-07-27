export interface EditorObjectLike {
	id?: string;
	type?: string;
	superType?: string;
	errors?: unknown;
}

export interface WorkflowSummary {
	nodeCount: number;
	linkCount: number;
	errorCount: number;
	validationState: 'valid' | 'issues';
}

export interface ImageMapSummary {
	objectCount: number;
	selectedType: string;
	hasSelection: boolean;
}

const hasErrors = (errors: unknown) => {
	if (Array.isArray(errors)) {
		return errors.length > 0;
	}
	return Boolean(errors);
};

export const summarizeWorkflow = (objects: EditorObjectLike[] = []): WorkflowSummary => {
	const nodes = objects.filter(object => object.superType === 'node');
	const errorCount = nodes.filter(node => hasErrors(node.errors)).length;

	return {
		nodeCount: nodes.length,
		linkCount: objects.filter(object => object.superType === 'link').length,
		errorCount,
		validationState: errorCount ? 'issues' : 'valid',
	};
};

export const summarizeImageMap = (
	objects: EditorObjectLike[] = [],
	selectedItem?: EditorObjectLike | null,
): ImageMapSummary => {
	const objectCount = objects.filter(object => object.id !== 'workarea' && object.superType !== 'port').length;

	return {
		objectCount,
		selectedType: selectedItem?.type || selectedItem?.superType || 'map',
		hasSelection: Boolean(selectedItem?.id && selectedItem.id !== 'workarea'),
	};
};

export const resolveInspectorMode = (selectedItem?: EditorObjectLike | null) =>
	selectedItem?.superType === 'node' ? 'node' : 'workflow';
