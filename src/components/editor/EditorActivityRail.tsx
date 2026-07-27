import clsx from 'clsx';
import React from 'react';
import Icon from '../icon/Icon';

export interface EditorActivityItem {
	key: string;
	label: string;
	icon: string;
	badge?: number;
	disabled?: boolean;
}

interface EditorActivityRailProps {
	activeKey: string;
	items: EditorActivityItem[];
	footerItems?: EditorActivityItem[];
	onChange: (key: string) => void;
	label: string;
}

const ActivityButton = ({
	active,
	item,
	onChange,
}: {
	active: boolean;
	item: EditorActivityItem;
	onChange: (key: string) => void;
}) => (
	<button
		type="button"
		className={clsx('rde-activity-rail-button', { active })}
		disabled={item.disabled}
		aria-pressed={active}
		aria-label={item.label}
		title={item.label}
		onClick={() => onChange(item.key)}
	>
		<span className="rde-activity-rail-icon">
			<Icon name={item.icon} />
			{item.badge ? <span className="rde-activity-rail-badge">{item.badge}</span> : null}
		</span>
		<span className="rde-activity-rail-label">{item.label}</span>
	</button>
);

export default function EditorActivityRail({
	activeKey,
	items,
	footerItems = [],
	onChange,
	label,
}: EditorActivityRailProps) {
	return (
		<nav className="rde-activity-rail" aria-label={label}>
			<div className="rde-activity-rail-primary">
				{items.map(item => (
					<ActivityButton
						key={item.key}
						item={item}
						active={activeKey === item.key}
						onChange={onChange}
					/>
				))}
			</div>
			{footerItems.length ? (
				<div className="rde-activity-rail-footer">
					{footerItems.map(item => (
						<ActivityButton
							key={item.key}
							item={item}
							active={activeKey === item.key}
							onChange={onChange}
						/>
					))}
				</div>
			) : null}
		</nav>
	);
}
