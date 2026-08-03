# Fabric v7 Workflow Link Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore Fabric v6's 40px workflow-link clearance for center-origin Fabric v7 nodes, including SwitchNode route ports.

**Architecture:** Resolve live node geometry from Fabric's scene-space bounding rectangle, then derive the left edge, right edge, and center from that single source. Keep the existing path shape and port coordinates unchanged, with a property-based fallback for non-live partial node data.

**Tech Stack:** TypeScript 6, Fabric.js 7.4, Vitest 4, jsdom

## Global Constraints

- Preserve Fabric v7 `center/center` origins.
- Preserve the Fabric v6 routing shape and direction.
- Keep each side detour exactly 40px outside the rendered source-node boundary.
- Apply the same calculation to regular nodes and SwitchNode offset output ports.
- Do not push the branch.

---

### Task 1: Use scene-space node bounds for link detours

**Files:**
- Create: `src/canvas/objects/Link.test.ts`
- Modify: `src/canvas/objects/Link.ts:52-119`

**Interfaces:**
- Consumes: Fabric objects exposing `getBoundingRect(): { left: number; width: number }`, plus serialized `Partial<NodeObject>` values.
- Produces: `Link.getNodeBounds(node): { left: number; width: number; centerX: number }` for `calculateGeometry`.

- [ ] **Step 1: Write the failing routing tests**

```ts
// @vitest-environment jsdom

import * as fabric from 'fabric';
import { describe, expect, it } from 'vitest';

import Link from './Link';

const calculateDetour = (sourceX: number, targetX: number, sourcePortX = sourceX) => {
	const fromNode = new fabric.Rect({
		height: 60,
		left: sourceX,
		strokeWidth: 0,
		top: 200,
		width: 240,
	});
	const toNode = new fabric.Rect({
		height: 60,
		left: targetX,
		strokeWidth: 0,
		top: 70,
		width: 240,
	});
	const fromPort = { height: 0, left: sourcePortX, strokeWidth: 0, top: 230, width: 0 };
	const toPort = { height: 0, left: targetX, strokeWidth: 0, top: 100, width: 0 };
	return new Link(fromNode as any, fromPort as any, toNode as any, toPort as any, {
		stroke: '#94a3b8',
	}).calculatePath(fromPort as any, toPort as any);
};

describe('workflow link routing', () => {
	it('keeps the left detour 40px outside a center-origin source', () => {
		expect(calculateDetour(400, 800).midX).toBe(240);
	});

	it('keeps the right detour 40px outside a center-origin source', () => {
		expect(calculateDetour(800, 400).midX).toBe(960);
	});

	it('uses the node boundary for an offset SwitchNode output port', () => {
		const geometry = calculateDetour(400, 800, 320);

		expect(geometry.path).toMatch(/^M 320 /);
		expect(geometry.midX).toBe(240);
	});
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- --run src/canvas/objects/Link.test.ts`

Expected: all three tests fail because the current code returns detours based on `node.left` (`360` or `1080`) instead of the rendered bounds (`240` or `960`).

- [ ] **Step 3: Implement scene-space bounds**

Add a private helper in `Link` and consume it in `calculateGeometry`:

```ts
private static getNodeBounds(node: Partial<NodeObject>) {
	if (typeof node.getBoundingRect === 'function') {
		const { left, width } = node.getBoundingRect();
		return { left, width, centerX: left + width / 2 };
	}
	const width = node.width ?? 240;
	const originOffset = node.originX === 'center' ? width / 2 : node.originX === 'right' ? width : 0;
	const left = (node.left ?? 0) - originOffset;
	return { left, width, centerX: left + width / 2 };
}
```

In `calculateGeometry`, replace raw `fromNodeLeft`, `toNodeLeft`, and width arithmetic with:

```ts
const fromBounds = Link.getNodeBounds(fromNode);
const toBounds = Link.getNodeBounds(toNode);
let x3 = x2 - (fromPort.left || 0) + fromBounds.left - offset;
const nodeCenterGap = fromBounds.centerX - toBounds.centerX;
if (nodeCenterGap > 0) {
	x3 = fromBounds.left + fromBounds.width + offset;
}
```

- [ ] **Step 4: Run focused and full automated verification**

Run: `npm run test:unit -- --run src/canvas/objects/Link.test.ts`

Expected: 3 tests pass.

Run: `npm run test:unit && npm run typecheck && npm run build:lib`

Expected: all unit tests pass; TypeScript and the library build exit with code 0.

- [ ] **Step 5: Verify the Workflow UI**

Open the local Workflow editor and verify these layouts at 100% zoom:

1. Regular source left of target: detour is 40px left of the source boundary.
2. Regular source right of target: detour is 40px right of the source boundary.
3. SwitchNode `normal` output linked to a node above and to either side: detour remains 40px outside the SwitchNode boundary and does not cross its route boxes.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- src/canvas/objects/Link.ts src/canvas/objects/Link.test.ts
git commit -m "fix: restore workflow link clearance"
```
