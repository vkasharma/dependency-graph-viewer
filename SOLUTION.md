# SOLUTION.md

## How to Run

```bash
cd my-app
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # TypeScript check + production build
pnpm lint      # ESLint
```

## Model Used

Claude Opus 4.6 (`global.anthropic.claude-opus-4-6-v1`) via Claude Code.

## Implementation Summary

A dependency graph viewer for a business continuity platform, built with React 19, TypeScript (strict mode), React Flow (@xyflow/react v12), Tailwind CSS v4, and Vite 8. No backend; data is loaded from `public/data/graph.json` via fetch.

### Features Implemented

| Requirement | Implementation |
|---|---|
| Graph rendering with directed edges | React Flow canvas with `<Background>` and `<Controls>` |
| Activities and resources visually distinct | Activities: rounded-lg, priority-colored borders (red/orange/yellow/gray), priority badge. Resources: rounded-md, blue border, resource-type icon. |
| Click node to highlight connections | Selected node + immediate neighbors stay full opacity; everything else dims to 25%. Connected edges turn blue and animate. |
| Click background or same node to clear | `onPaneClick` clears; `handleNodeClick` toggles if same node ID. |
| SPOF detection | Resource nodes with >1 dependent flagged in `processGraph.ts`. |
| SPOF visually distinct at a glance | Red border + red ring + bold "SPOF" badge on the node itself, visible without any interaction. |
| Info panel on selection | Right sidebar with all dataset fields, "Selected" label, SPOF banner with dependent count, connections list. |
| Reload data button | Re-fetches `graph.json` with cache-busting `?_t=timestamp` query param. |
| Order activities by criticality | Checkbox toggle. Sort: priority rank (critical first) > lower RTO first > name. |
| Order resources by criticality | Checkbox toggle. Sort: more dependents first > highest dependent priority > lowest dependent RTO > name. |
| React 19 + TypeScript strict, no `any` | `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`. |
| Tailwind CSS | Configured via `@tailwindcss/vite` plugin (Tailwind v4 approach, no PostCSS/init). |

## Architecture

```
src/
  types/
    graph.ts                        # All domain + component data types (centralized)
  features/
    graph/
      components/
        ActivityNode.tsx            # Custom React Flow node for activities
        ResourceNode.tsx            # Custom React Flow node for resources
        GraphViewer.tsx             # React Flow canvas, builds nodes/edges from ProcessedGraph
        InfoPanel.tsx               # Selected node details sidebar
        Legend.tsx                  # Floating legend overlay
      hooks/
        useGraphData.ts            # Fetch + process graph.json with cache-busting reload
      utils/
        processGraph.ts            # Adjacency, SPOF detection, resource criticality scoring
        layout.ts                  # Two-column positioning + activity/resource sorting
        selection.ts               # Highlight set computation for node selection
  components/
    ui/
      Toolbar.tsx                  # Header with sort toggles, reload button, stats
  App.tsx                          # Root: state management, layout composition
  main.tsx                         # Entry point (StrictMode)
  index.css                        # Tailwind import + global focus-visible styles
```

**Why this structure:**
- `types/graph.ts` centralizes all interfaces to avoid duplication across files.
- `features/graph/` groups all React Flow logic (components, hooks, utils) as a cohesive feature module. If the app grew, other features would follow the same pattern.
- `components/ui/` holds reusable UI that isn't graph-specific.
- Utils are split by concern: data processing, layout, and selection are each small focused files.

**Data flow:** `useGraphData` fetches JSON and calls `processGraphData()`, which builds a `ProcessedGraph` (node map, adjacency, SPOF set, criticality scores). `GraphViewer` converts this into React Flow `Node[]` and `Edge[]`, applying layout positions and dimming based on selection state. `InfoPanel` reads directly from the `ProcessedGraph` to display details and connections.

## SPOF Detection

A resource node is flagged as a Single Point of Failure if it has **more than one node depending on it** (in-degree > 1 in the dependency graph). This is computed in `processGraph.ts:findSpofIds()` by iterating resource nodes and checking their `dependedBy` set size.

SPOF nodes are visually flagged in two places:
1. **On the graph node itself**: red border (`border-red-600`), red ring (`ring-2 ring-red-300`), and a bold "SPOF" badge — visible without any interaction.
2. **In the info panel**: a red banner reading "Single Point of Failure — depended on by N nodes" when a SPOF resource is selected.

## Resource Criticality Derivation

Resources do not have an explicit `priority` field in the dataset. Criticality is derived from their dependents using a multi-key sort (implemented in `layout.ts:sortResourcesByCriticality()`):

1. **Number of dependents** (descending) — more dependents = more critical
2. **Highest priority among dependent activities** (critical > high > medium > low)
3. **Lowest RTO among dependent activities** (lower RTO = more time-sensitive dependency)
4. **Name** (alphabetical tiebreaker)

## Activity-to-Activity Dependency

The dataset contains `{ from: "act-8", to: "act-6" }` — IT Service Desk depends on Employee Payroll. This is an activity-to-activity edge, which the README's type spec describes as activity-to-resource only.

**How the app handles it:**
- The `Dependency` type uses generic `from`/`to` string IDs with no type constraint, so any node-to-node edge works.
- `buildAdjacency()` processes all edges regardless of source/target node type.
- Both `ActivityNode` and `ResourceNode` components have both `source` and `target` React Flow handles, so edges can connect in either direction.
- SPOF detection explicitly checks `node.type === "resource"`, so activity nodes are never incorrectly flagged.
- The info panel and selection highlighting work correctly for all node types.

## Assumptions and Tradeoffs

1. **Layout**: Simple two-column (activities left, resources right) with vertical stacking. No automatic layout library — keeps the bundle small and the layout deterministic and readable.
2. **Reload**: Re-fetches the same static JSON with a cache-busting param. In production this would hit an API endpoint, but the mechanism is the same.
3. **Sorting toggles**: Independent checkboxes that reorder node positions within their column. The graph re-renders with `fitView` on each change.
4. **Responsive**: Side-by-side on `lg:` screens, stacked on smaller screens. The graph canvas has a minimum height of 300px.
5. **No `any`**: All props are fully typed. React Flow's `Node` type uses `Record<string, unknown>` for data, so custom node components accept typed `data` props via their own interfaces.

## Progress Log

### M1: Types & Data
- Configured Tailwind v4 via `@tailwindcss/vite` plugin.
- Created centralized domain types in `types/graph.ts`.
- Built `processGraph.ts` with adjacency computation, SPOF detection, and resource criticality scoring.
- Built `useGraphData.ts` fetch hook with discriminated union state and cache-busting reload.

### M2-M3: Graph Layout + SPOF Visualization
- Custom `ActivityNode` and `ResourceNode` React Flow components with distinct visual treatment.
- Deterministic two-column layout in `layout.ts`.
- SPOF nodes flagged with red border + ring + badge.

### M4-M5: Selection & Info Panel
- Click-to-highlight with adjacency-based subgraph computation.
- Dimming via `opacity-25` on nodes, `opacity: 0.15` on edges.
- Info panel with all dataset fields, SPOF banner, connections list.

### M6: Controls
- Reload Data button, activity sort toggle, resource sort toggle in Toolbar component.
- Resource criticality derived from dependency impact (see section above).

### M7: Polish
- Legend component with visual key for all node/edge states.
- Responsive layout (stacked on mobile, side-by-side on desktop).
- Loading spinner, error state with retry.
- Accessibility: `aria-label`, `role` attributes, `focus-visible` outlines.

### Refactor: Project Structure
- Reorganized flat `src/` into feature-based structure with `types/`, `features/graph/`, `components/ui/`.
- Removed unused scaffold assets.
- All imports updated, zero dead code.

### Final Review
- All 13 required features verified against README.md.
- `pnpm build` and `pnpm lint` pass with zero errors.
- TypeScript strict mode enforced: no `any`, no enums, `import type` for type-only imports.
