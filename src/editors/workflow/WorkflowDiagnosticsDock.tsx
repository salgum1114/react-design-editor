import React from 'react';
import type { WorkflowSummary } from '../../components/editor';
import Icon from '../../components/icon/Icon';

export type WorkflowDockTab = 'overview' | 'validation' | 'history';

interface WorkflowDiagnosticsDockProps {
	activeTab: WorkflowDockTab;
	canRedo: boolean;
	canUndo: boolean;
	editing: boolean;
	open: boolean;
	summary: WorkflowSummary;
	onChangeTab: (tab: WorkflowDockTab) => void;
	onRedo: () => void;
	onToggle: () => void;
	onUndo: () => void;
}

const tabs: Array<{ key: WorkflowDockTab; label: string }> = [
	{ key: 'overview', label: 'Canvas status' },
	{ key: 'validation', label: 'Validation' },
	{ key: 'history', label: 'History' },
];

export default function WorkflowDiagnosticsDock({
	activeTab,
	canRedo,
	canUndo,
	editing,
	onChangeTab,
	onRedo,
	onToggle,
	onUndo,
	open,
	summary,
}: WorkflowDiagnosticsDockProps) {
	const renderContent = () => {
		if (activeTab === 'validation') {
			return (
				<div className="rde-workflow-dock-validation">
					<span className={`rde-workflow-validation-icon ${summary.validationState}`}>
						<Icon name={summary.validationState === 'valid' ? 'check' : 'exclamation'} />
					</span>
					<div>
						<strong>{summary.validationState === 'valid' ? 'No configuration issues' : 'Review required'}</strong>
						<span>
							{summary.errorCount
								? `${summary.errorCount} node${summary.errorCount === 1 ? '' : 's'} need attention`
								: 'All configured nodes are ready to export'}
						</span>
					</div>
				</div>
			);
		}

		if (activeTab === 'history') {
			return (
				<div className="rde-workflow-dock-history">
					<div className="rde-workflow-history-state">
						<span className="rde-workflow-history-dot" />
						<div>
							<strong>{editing ? 'Unsaved canvas changes' : 'Canvas is at the saved state'}</strong>
							<span>Configuration edits and canvas operations are tracked independently.</span>
						</div>
					</div>
					<div className="rde-workflow-history-actions">
						<button type="button" disabled={!canUndo} onClick={onUndo}>
							<Icon name="undo-alt" /> Undo
						</button>
						<button type="button" disabled={!canRedo} onClick={onRedo}>
							Redo <Icon name="redo-alt" />
						</button>
					</div>
				</div>
			);
		}

		return (
			<div className="rde-workflow-dock-overview">
				<div className="rde-workflow-metric">
					<span>Nodes</span>
					<strong>{summary.nodeCount}</strong>
				</div>
				<div className="rde-workflow-metric">
					<span>Connections</span>
					<strong>{summary.linkCount}</strong>
				</div>
				<div className="rde-workflow-metric">
					<span>Issues</span>
					<strong className={summary.errorCount ? 'has-issues' : ''}>{summary.errorCount}</strong>
				</div>
				<div className="rde-workflow-dock-message">
					<Icon name={editing ? 'circle' : 'check-circle'} />
					<span>{editing ? 'Changes are ready to export' : 'Workflow canvas is ready'}</span>
				</div>
			</div>
		);
	};

	return (
		<section className={`rde-workflow-dock ${open ? 'open' : 'collapsed'}`} aria-label="Workflow diagnostics">
			<header className="rde-workflow-dock-header">
				<div className="rde-workflow-dock-tabs" role="tablist" aria-label="Workflow diagnostics">
					{tabs.map(tab => (
						<button
							key={tab.key}
							type="button"
							role="tab"
							aria-selected={activeTab === tab.key}
							className={activeTab === tab.key ? 'active' : ''}
							onClick={() => onChangeTab(tab.key)}
						>
							{tab.label}
							{tab.key === 'validation' && summary.errorCount ? (
								<span className="rde-workflow-dock-count">{summary.errorCount}</span>
							) : null}
						</button>
					))}
				</div>
				<button
					type="button"
					className="rde-workflow-dock-toggle"
					onClick={onToggle}
					aria-expanded={open}
					title={open ? 'Collapse diagnostics' : 'Expand diagnostics'}
				>
					<Icon name={open ? 'chevron-down' : 'chevron-up'} />
				</button>
			</header>
			{open ? <div className="rde-workflow-dock-content">{renderContent()}</div> : null}
		</section>
	);
}
