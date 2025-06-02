import dagre from '@dagrejs/dagre';
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js';
import { AbstractHandler } from '.';
import { LinkObject, NodeObject } from '../objects';

export type LayoutType = 'dagre' | 'elk';
export type LayoutDirection = 'vertical' | 'horizontal';
export interface LayoutOptions {
	type: LayoutType;
	direction?: LayoutDirection;
	nodes: NodeObject[];
	links?: LinkObject[];
}

export default class LayoutHandler extends AbstractHandler {
	public runLayout(options: LayoutOptions) {
		const { type } = options;
		if (!type) {
			return;
		}
		if (type === 'dagre') {
			this.dagre(options);
		} else if (type === 'elk') {
			this.elk(options);
		}
	}

	private async elk(options: LayoutOptions) {
		const { nodes, links } = options;
		const elk = new ELK();
		const elkGraph: ElkNode = {
			id: 'root',
			layoutOptions: {
				'elk.algorithm': 'layered',
				'elk.direction': 'DOWN',
				'elk.spacing.nodeNode': '60',
				'elk.layered.spacing.nodeNodeBetweenLayers': '60',
				'elk.spacing.componentSpacing': '200',
				'elk.layered.nodePlacement.strategy': 'SIMPLEX',
			},
			children: nodes.map(node => ({
				id: node.id,
				width: node.width,
				height: node.height,
				layoutOptions: {
					'elk.portConstraints': 'FIXED_ORDER',
					'elk.portAlignment.default': 'CENTER',
				},
				ports: node.fromPort?.length
					? node.fromPort
							?.map(port => ({
								id: `${node.id}:${port.id}`,
								layoutOptions: { 'elk.port.side': 'SOUTH' },
							}))
							.concat(
								node.toPort
									? [
											{
												id: `${node.id}:${node.toPort.id}`,
												layoutOptions: {
													'elk.port.side': 'NORTH',
												},
											},
									  ]
									: [],
							)
					: [
							{
								id: `${node.id}:${node.toPort.id}`,
								layoutOptions: {
									'elk.port.side': 'NORTH',
								},
							},
					  ],
			})),
			edges: links.map(link => ({
				id: `${link.fromNode?.id}_${link.toNode?.id}`,
				sources: [`${link.fromNode?.id}:${link.fromPort?.id}`],
				targets: [`${link.toNode?.id}:${link.toPort?.id}`],
			})),
		};
		const layout = await elk.layout(elkGraph);
		const grid = this.handler.gridOption.grid || 20;

		layout.children.forEach(nodeLayout => {
			let { x: left, y: top } = nodeLayout;
			left = Math.round(left / grid) * grid;
			top = Math.round(top / grid) * grid;
			const node = this.handler.objectMap[nodeLayout.id] as NodeObject;
			node.set({ left, top });
			node.setCoords();
			this.handler.portHandler.setCoords(node);
		});

		this.handler.canvas.renderAll();
	}

	private dagre(options: LayoutOptions) {
		const { nodes, links } = options;
		const g = new dagre.graphlib.Graph();
		g.setGraph({ nodesep: 80, ranksep: 80, edgesep: 0, rankdir: 'TB' });
		g.setDefaultEdgeLabel(() => ({}));
		nodes.forEach(node =>
			g.setNode(node.id as string, { label: node.name, width: node.width, height: node.height }),
		);
		links?.forEach(link => g.setEdge(link.fromNode?.id as string, link.toNode?.id as string));
		dagre.layout(g);
		const grid = this.handler.gridOption.grid || 20;
		g.nodes().forEach(id => {
			let { x, y, width, height } = g.node(id);
			let left = x - width / 2;
			let top = y - height / 2;
			left = Math.round(left / grid) * grid;
			top = Math.round(top / grid) * grid;
			const node = this.handler.objectMap[id] as NodeObject;
			node.set({ left, top });
			node.setCoords();
			this.handler.portHandler.setCoords(node);
		});

		this.handler.canvas.renderAll();
	}
}
