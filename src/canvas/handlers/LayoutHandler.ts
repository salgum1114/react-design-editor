import dagre from '@dagrejs/dagre';
import { AbstractHandler } from '.';
import { LinkObject, NodeObject } from '../objects';

export type LayoutType = 'dagre' | 'elkjs';
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
		}
	}

	// private dagre(options: LayoutOptions) {
	// 	const { nodes, links } = options;
	// 	const g = new dagre.graphlib.Graph();

	// 	g.setGraph({ nodesep: 80, ranksep: 80, edgesep: 0 });
	// 	g.setDefaultEdgeLabel(() => ({}));

	// 	// 1️⃣ 노드 & 엣지 추가
	// 	nodes.forEach(node =>
	// 		g.setNode(node.id as string, {
	// 			id: node.id,
	// 			label: node.name,
	// 			width: node.width,
	// 			height: node.height,
	// 		}),
	// 	);

	// 	links?.forEach(link => g.setEdge(link.fromNode?.id as string, link.toNode?.id as string));

	// 	// 2️⃣ dagre 레이아웃 계산
	// 	dagre.layout(g);

	// 	// 3️⃣ 플로우 단위 그룹화 (연결된 노드들 찾기)
	// 	const flows = this.findFlows(nodes, links);

	// 	// 4️⃣ 각 플로우별 rank 중심 보정 (부모 기준 + width 고려)
	// 	flows.forEach(flowNodeIds => {
	// 		const rankGroups: Record<number, dagre.Node[]> = {};

	// 		flowNodeIds.forEach(id => {
	// 			const node = g.node(id);
	// 			if (!rankGroups[node.rank]) rankGroups[node.rank] = [];
	// 			rankGroups[node.rank].push({ ...node, id });
	// 		});

	// 		Object.entries(rankGroups).forEach(([rankStr, nodesInRank]) => {
	// 			const rank = parseInt(rankStr, 10);
	// 			if (rank % 2 !== 0) return; // 엣지 공간 제외

	// 			// 부모 x 좌표 평균 계산
	// 			const parentXs: number[] = [];
	// 			const parentToChild: Record<string, number[]> = {};

	// 			nodesInRank.forEach(node => {
	// 				const inEdges = g.inEdges(node.id) || [];
	// 				inEdges.forEach(edge => {
	// 					const parentNode = g.node(edge.v);
	// 					parentXs.push(parentNode.x);
	// 					if (!parentToChild[edge.v]) parentToChild[edge.v] = [];
	// 					parentToChild[edge.v].push(node.x);
	// 				});
	// 			});

	// 			let targetCenterX: number;

	// 			if (parentXs.length > 0) {
	// 				const uniqueParents = Object.keys(parentToChild);
	// 				if (uniqueParents.length === 1) {
	// 					const childXs = parentToChild[uniqueParents[0]];
	// 					targetCenterX = childXs.reduce((sum, x) => sum + x, 0) / childXs.length;
	// 				} else {
	// 					targetCenterX = parentXs.reduce((sum, x) => sum + x, 0) / parentXs.length;
	// 				}
	// 			} else {
	// 				const widestNode = nodesInRank.reduce((a, b) => (a.width > b.width ? a : b));
	// 				targetCenterX = widestNode.x;
	// 			}

	// 			// rank 그룹의 좌측-우측 끝 계산 (넓이 포함)
	// 			const minLeft = Math.min(...nodesInRank.map(n => n.x - n.width / 2));
	// 			const maxRight = Math.max(...nodesInRank.map(n => n.x + n.width / 2));
	// 			const groupCenterX = (minLeft + maxRight) / 2;

	// 			// shift 계산: 그룹 중심 → targetCenterX
	// 			const shift = targetCenterX - groupCenterX;

	// 			// 보정 적용: 중심 x만 옮기지 말고, bounding box 맞추기
	// 			nodesInRank.forEach(node => {
	// 				node.x += shift;
	// 			});
	// 		});
	// 	});

	// 	const grid = this.handler.gridOption.grid || 20;
	// 	// 5️⃣ 최종 좌표 적용 (20 단위 snap)
	// 	g.nodes().forEach(id => {
	// 		let { x, y } = g.node(id);
	// 		const node = this.handler.objectMap[id] as NodeObject;
	// 		if (node.type === 'SwitchNode') {
	// 		}
	// 		// snap to grid
	// 		x = Math.round(x / grid) * grid;
	// 		y = Math.round(y / grid) * grid;

	// 		node.set({ left: x, top: y });
	// 		node.setCoords();
	// 		this.handler.portHandler.setCoords(node);
	// 	});

	// 	this.handler.canvas.renderAll();
	// }

	// // 🔍 플로우 추출 함수 (연결된 노드 그룹 찾기)
	// private findFlows(nodes: any[], links: any[]): string[][] {
	// 	const visited = new Set<string>();
	// 	const flows: string[][] = [];

	// 	nodes.forEach(node => {
	// 		if (visited.has(node.id)) return;

	// 		const stack = [node.id];
	// 		const flow = [];
	// 		visited.add(node.id);

	// 		while (stack.length) {
	// 			const current = stack.pop();
	// 			flow.push(current);

	// 			links.forEach(link => {
	// 				const from = link.fromNode.id;
	// 				const to = link.toNode.id;

	// 				if (from === current && !visited.has(to)) {
	// 					visited.add(to);
	// 					stack.push(to);
	// 				}
	// 				if (to === current && !visited.has(from)) {
	// 					visited.add(from);
	// 					stack.push(from);
	// 				}
	// 			});
	// 		}

	// 		flows.push(flow);
	// 	});

	// 	return flows;
	// }

	private dagre(options: LayoutOptions) {
		const { nodes, links } = options;
		const g = new dagre.graphlib.Graph();
		g.setGraph({ nodesep: 80, ranksep: 80, edgesep: 0 });
		g.setDefaultEdgeLabel(() => ({}));
		nodes.forEach(node =>
			g.setNode(node.id as string, { label: node.name, width: node.width, height: node.height }),
		);
		links?.forEach(link => g.setEdge(link.fromNode?.id as string, link.toNode?.id as string));
		dagre.layout(g);
		const grid = this.handler.gridOption.grid || 20;
		g.nodes().forEach(id => {
			let { x: left, y: top } = g.node(id);
			const node = this.handler.objectMap[id] as NodeObject;
			left = Math.round(left / grid) * grid;
			top = Math.round(top / grid) * grid;
			if (node.type === 'TimerNode') {
				console.log(node.type, left);
			}
			if (node.type === 'SwitchNode') {
				const isEven = node.fromPort.length % 2;
				left =
					left -
					(node.fromPort.length >= 3
						? node.fromPort.length > 3
							? (node.fromPort.length * 40) / 2 - (isEven ? 0 : 20)
							: 20
						: 0);
				console.log(node.type, left);
			}
			node.set({ left, top });
			node.setCoords();
			this.handler.portHandler.setCoords(node);
		});

		this.handler.canvas.renderAll();
	}
}
