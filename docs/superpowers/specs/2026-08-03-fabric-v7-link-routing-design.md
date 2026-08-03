# Fabric v7 Workflow Link Routing Design

## Problem

Fabric v6 exposed workflow node `left` as the node's left edge. Fabric v7 uses a center origin, but `Link.calculateGeometry` still treats `node.left` as the left edge. With a 240px node this introduces a 120px error: a left-side detour enters the node and a right-side detour extends 120px too far.

SwitchNode makes the defect more visible because its named output ports are offset from the node center. The route boxes and ports are aligned correctly; the shared link detour calculation is not.

## Desired behavior

- Preserve Fabric v7 center origins.
- Preserve the Fabric v6 routing shape and direction.
- Place a side detour exactly 40px, or two 20px workflow grid cells, outside the source node's rendered boundary.
- Apply the same rule to regular nodes and SwitchNode route ports.
- Keep curved links used for downward connections unchanged.

## Design

`Link.calculateGeometry` will resolve each node's scene-space bounds through Fabric's `getBoundingRect()` API. Direction comparisons will use the bounds' centers. The detour coordinate will use `sourceBounds.left - 40` or `sourceBounds.left + sourceBounds.width + 40` rather than combining `node.left` and `node.width` under a v6 origin assumption.

The calculation will retain a property-based fallback for partial serialized node data that is not a live Fabric object. No SwitchNode-specific routing offset will be added: centralizing the correction in `Link` keeps all node types consistent and avoids compensating twice.

## Tests

Regression tests will cover:

1. A center-origin source to the left of its target, with the detour 40px beyond the source's left edge.
2. A center-origin source to the right of its target, with the detour 40px beyond the source's right edge.
3. A SwitchNode-like output port offset from the source center, proving that the same node-boundary clearance is retained.

The complete unit suite, TypeScript checks, library build, and a local Workflow visual check will be run before completion.
