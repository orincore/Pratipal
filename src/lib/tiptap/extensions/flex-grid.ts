import { Node, mergeAttributes } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { TextSelection, type EditorState } from "@tiptap/pm/state";

// ---------------------------------------------------------------------------
// Flexbox + Grid layout containers.
//
// Structure mirrors twoColumnSection/columnMedia: a selectable, isolating
// container node whose only children are cell nodes (flexItem / gridItem),
// each cell holding arbitrary block content — so any Elements-tab widget can
// be inserted or dropped inside a cell. All layout choices live in node
// attrs and render as inline styles (generateHTML on the public page uses
// the exact same renderHTML), except mobile stacking, which needs a media
// query and is done via the `ve-stack-mobile` class defined in globals.css.
// ---------------------------------------------------------------------------

export interface FlexboxAttrs {
  direction: "row" | "row-reverse" | "column" | "column-reverse";
  wrap: boolean;
  justifyContent: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  alignItems: "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
  gap: number;
  paddingX: number;
  paddingY: number;
  backgroundColor: string;
  borderRadius: number;
  minHeight: number;
  fullWidth: boolean;
  stackOnMobile: boolean;
}

export interface FlexItemAttrs {
  grow: number;
  shrink: number;
  // CSS flex-basis: "auto", a px value ("240px") or a percentage ("33%").
  basis: string;
  alignSelf: "auto" | "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  minWidth: number;
}

export interface GridAttrs {
  columns: number;
  // Raw grid-template-columns override (e.g. "2fr 1fr"); empty = use columns.
  customTemplate: string;
  gapX: number;
  gapY: number;
  // 0 = auto row height.
  rowMinHeight: number;
  justifyItems: "stretch" | "start" | "center" | "end";
  alignItems: "stretch" | "start" | "center" | "end";
  paddingX: number;
  paddingY: number;
  backgroundColor: string;
  borderRadius: number;
  minHeight: number;
  stackOnMobile: boolean;
}

export interface GridItemAttrs {
  colSpan: number;
  rowSpan: number;
  justifySelf: "auto" | "start" | "center" | "end" | "stretch";
  alignSelf: "auto" | "start" | "center" | "end" | "stretch";
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  minHeight: number;
}

export const DEFAULT_FLEXBOX_ATTRS: FlexboxAttrs = {
  direction: "row",
  wrap: false,
  justifyContent: "flex-start",
  alignItems: "stretch",
  gap: 24,
  paddingX: 16,
  paddingY: 16,
  backgroundColor: "transparent",
  borderRadius: 0,
  minHeight: 0,
  fullWidth: true,
  stackOnMobile: true,
};

export const DEFAULT_FLEX_ITEM_ATTRS: FlexItemAttrs = {
  grow: 1,
  shrink: 1,
  basis: "0%",
  alignSelf: "auto",
  backgroundColor: "transparent",
  padding: 0,
  borderRadius: 0,
  minWidth: 0,
};

export const DEFAULT_GRID_ATTRS: GridAttrs = {
  columns: 3,
  customTemplate: "",
  gapX: 24,
  gapY: 24,
  rowMinHeight: 0,
  justifyItems: "stretch",
  alignItems: "stretch",
  paddingX: 16,
  paddingY: 16,
  backgroundColor: "transparent",
  borderRadius: 0,
  minHeight: 0,
  stackOnMobile: true,
};

export const DEFAULT_GRID_ITEM_ATTRS: GridItemAttrs = {
  colSpan: 1,
  rowSpan: 1,
  justifySelf: "auto",
  alignSelf: "auto",
  backgroundColor: "transparent",
  padding: 0,
  borderRadius: 0,
  minHeight: 0,
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    flexGrid: {
      insertFlexbox: (opts?: { cells?: number } & Partial<FlexboxAttrs>) => ReturnType;
      // `pos`, when given, patches the node at exactly that position (must be
      // the matching type) instead of the one nearest the live selection —
      // lets the sidebar target one specific cell/container deterministically.
      updateFlexbox: (attrs: Partial<FlexboxAttrs>, pos?: number) => ReturnType;
      updateFlexItem: (attrs: Partial<FlexItemAttrs>, pos?: number) => ReturnType;
      insertGridBox: (opts?: { cells?: number } & Partial<GridAttrs>) => ReturnType;
      updateGridBox: (attrs: Partial<GridAttrs>, pos?: number) => ReturnType;
      updateGridItem: (attrs: Partial<GridItemAttrs>, pos?: number) => ReturnType;
      addLayoutCell: (containerType: "flexboxContainer" | "gridContainer") => ReturnType;
      removeLayoutCell: (containerType: "flexboxContainer" | "gridContainer") => ReturnType;
    };
  }
}

const emptyCell = (type: "flexItem" | "gridItem") => ({
  type,
  content: [{ type: "paragraph" }],
});

// Nearest ancestor of `typeName` around the selection (NodeSelection on the
// container itself also counts). Returns its pos + node, or null.
function findNearest(state: EditorState, typeName: string): { pos: number; node: PMNode } | null {
  const sel = state.selection as any;
  if (sel.node && sel.node.type.name === typeName) {
    return { pos: sel.from, node: sel.node };
  }
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === typeName) {
      return { pos: $from.before(depth), node };
    }
  }
  return null;
}

const CELL_OF: Record<string, "flexItem" | "gridItem"> = {
  flexboxContainer: "flexItem",
  gridContainer: "gridItem",
};

// Resolve which node an attribute update should patch. Prefer the explicit
// `pos` (the exact cell/container the sidebar is showing) when it still points
// at a node of the expected type; otherwise fall back to the nearest matching
// node around the selection. This is what makes per-cell editing reliable —
// sidebar inputs blur the editor, so the live selection can't be trusted to
// still be inside the intended cell.
function resolveTarget(
  state: EditorState,
  typeName: string,
  pos?: number
): { pos: number; node: PMNode } | null {
  if (pos != null && pos >= 0 && pos <= state.doc.content.size) {
    const node = state.doc.nodeAt(pos);
    if (node && node.type.name === typeName) return { pos, node };
  }
  return findNearest(state, typeName);
}

export const FlexboxContainer = Node.create({
  name: "flexboxContainer",
  group: "block",
  content: "flexItem+",
  defining: true,
  draggable: true,
  selectable: true,
  isolating: true,

  addAttributes() {
    return Object.fromEntries(
      Object.entries(DEFAULT_FLEXBOX_ATTRS).map(([k, v]) => [k, { default: v }])
    );
  },

  parseHTML() {
    return [{ tag: "div[data-flexbox]" }];
  },

  addCommands() {
    return {
      insertFlexbox:
        (opts = {}) =>
        ({ chain }) => {
          const { cells = 2, ...attrs } = opts;
          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { ...DEFAULT_FLEXBOX_ATTRS, ...attrs },
              content: Array.from({ length: Math.max(1, cells) }, () => emptyCell("flexItem")),
            })
            .run();
        },
      // updateAttributes(type, …) patches EVERY matching node overlapping
      // the selection — with nested containers (a flexbox inside a grid
      // cell) that would restyle the outer one too. These patch only the
      // innermost matching node around the cursor, mutating the command
      // chain's own `tr` (dispatching a self-made transaction from inside a
      // command desyncs the chain → "Applying a mismatched transaction").
      updateFlexbox:
        (attrs, pos) =>
        ({ state, tr, dispatch }) => {
          const found = resolveTarget(state, "flexboxContainer", pos);
          if (!found) return false;
          if (dispatch) tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, ...attrs });
          return true;
        },
      updateFlexItem:
        (attrs, pos) =>
        ({ state, tr, dispatch }) => {
          const found = resolveTarget(state, "flexItem", pos);
          if (!found) return false;
          if (dispatch) tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, ...attrs });
          return true;
        },
      addLayoutCell:
        (containerType) =>
        ({ state, tr, dispatch, editor }) => {
          const found = findNearest(state, containerType);
          if (!found) return false;
          if (dispatch) {
            const cellType = editor.schema.nodes[CELL_OF[containerType]];
            const paragraph = editor.schema.nodes.paragraph.create();
            const cell = cellType.create(null, paragraph);
            const insertPos = found.pos + found.node.nodeSize - 1; // before container's closing token
            tr.insert(insertPos, cell);
            // Put the caret inside the new cell so a follow-up insert/type
            // lands there.
            tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1)));
          }
          return true;
        },
      removeLayoutCell:
        (containerType) =>
        ({ state, tr, dispatch }) => {
          const cell = findNearest(state, CELL_OF[containerType]);
          if (!cell) return false;
          const container = findNearest(state, containerType);
          // Never delete the last remaining cell — remove the whole
          // container instead if that's what the user wants.
          if (!container || container.node.childCount <= 1) return false;
          if (dispatch) tr.delete(cell.pos, cell.pos + cell.node.nodeSize);
          return true;
        },
    };
  },

  renderHTML({ node }) {
    const a = { ...DEFAULT_FLEXBOX_ATTRS, ...(node.attrs as Partial<FlexboxAttrs>) };
    const style = [
      "display:flex",
      `flex-direction:${a.direction}`,
      `flex-wrap:${a.wrap ? "wrap" : "nowrap"}`,
      `justify-content:${a.justifyContent}`,
      `align-items:${a.alignItems}`,
      `gap:${a.gap}px`,
      `padding:${a.paddingY}px ${a.paddingX}px`,
      a.backgroundColor !== "transparent" ? `background-color:${a.backgroundColor}` : "",
      a.borderRadius > 0 ? `border-radius:${a.borderRadius}px` : "",
      a.minHeight > 0 ? `min-height:${a.minHeight}px` : "",
      a.fullWidth ? "width:100%" : "",
      "margin:1rem 0",
    ]
      .filter(Boolean)
      .join(";");
    return [
      "div",
      mergeAttributes({
        "data-flexbox": "",
        class: a.stackOnMobile ? "ve-stack-mobile" : undefined,
        style,
      }),
      0,
    ];
  },
});

export const FlexItem = Node.create({
  name: "flexItem",
  group: "",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return Object.fromEntries(
      Object.entries(DEFAULT_FLEX_ITEM_ATTRS).map(([k, v]) => [k, { default: v }])
    );
  },

  parseHTML() {
    return [{ tag: "div[data-flex-item]" }];
  },

  renderHTML({ node }) {
    const a = { ...DEFAULT_FLEX_ITEM_ATTRS, ...(node.attrs as Partial<FlexItemAttrs>) };
    const style = [
      `flex:${a.grow} ${a.shrink} ${a.basis || "0%"}`,
      "min-width:0",
      a.minWidth > 0 ? `min-width:${a.minWidth}px` : "",
      a.alignSelf !== "auto" ? `align-self:${a.alignSelf}` : "",
      a.backgroundColor !== "transparent" ? `background-color:${a.backgroundColor}` : "",
      a.padding > 0 ? `padding:${a.padding}px` : "",
      a.borderRadius > 0 ? `border-radius:${a.borderRadius}px` : "",
    ]
      .filter(Boolean)
      .join(";");
    return ["div", mergeAttributes({ "data-flex-item": "", style }), 0];
  },
});

export const GridContainer = Node.create({
  name: "gridContainer",
  group: "block",
  content: "gridItem+",
  defining: true,
  draggable: true,
  selectable: true,
  isolating: true,

  addAttributes() {
    return Object.fromEntries(
      Object.entries(DEFAULT_GRID_ATTRS).map(([k, v]) => [k, { default: v }])
    );
  },

  parseHTML() {
    return [{ tag: "div[data-grid]" }];
  },

  addCommands() {
    return {
      insertGridBox:
        (opts = {}) =>
        ({ chain }) => {
          const { cells, ...attrs } = opts;
          const a = { ...DEFAULT_GRID_ATTRS, ...attrs };
          const count = Math.max(1, cells ?? a.columns);
          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: a,
              content: Array.from({ length: count }, () => emptyCell("gridItem")),
            })
            .run();
        },
      updateGridBox:
        (attrs, pos) =>
        ({ state, tr, dispatch }) => {
          const found = resolveTarget(state, "gridContainer", pos);
          if (!found) return false;
          if (dispatch) tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, ...attrs });
          return true;
        },
      updateGridItem:
        (attrs, pos) =>
        ({ state, tr, dispatch }) => {
          const found = resolveTarget(state, "gridItem", pos);
          if (!found) return false;
          if (dispatch) tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, ...attrs });
          return true;
        },
    };
  },

  renderHTML({ node }) {
    const a = { ...DEFAULT_GRID_ATTRS, ...(node.attrs as Partial<GridAttrs>) };
    const template = a.customTemplate.trim() || `repeat(${Math.max(1, a.columns)}, minmax(0, 1fr))`;
    const style = [
      "display:grid",
      `grid-template-columns:${template}`,
      `gap:${a.gapY}px ${a.gapX}px`,
      a.rowMinHeight > 0 ? `grid-auto-rows:minmax(${a.rowMinHeight}px, auto)` : "",
      `justify-items:${a.justifyItems}`,
      `align-items:${a.alignItems}`,
      `padding:${a.paddingY}px ${a.paddingX}px`,
      a.backgroundColor !== "transparent" ? `background-color:${a.backgroundColor}` : "",
      a.borderRadius > 0 ? `border-radius:${a.borderRadius}px` : "",
      a.minHeight > 0 ? `min-height:${a.minHeight}px` : "",
      "margin:1rem 0",
    ]
      .filter(Boolean)
      .join(";");
    return [
      "div",
      mergeAttributes({
        "data-grid": "",
        class: a.stackOnMobile ? "ve-stack-mobile" : undefined,
        style,
      }),
      0,
    ];
  },
});

export const GridItem = Node.create({
  name: "gridItem",
  group: "",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return Object.fromEntries(
      Object.entries(DEFAULT_GRID_ITEM_ATTRS).map(([k, v]) => [k, { default: v }])
    );
  },

  parseHTML() {
    return [{ tag: "div[data-grid-item]" }];
  },

  renderHTML({ node }) {
    const a = { ...DEFAULT_GRID_ITEM_ATTRS, ...(node.attrs as Partial<GridItemAttrs>) };
    const style = [
      "min-width:0",
      a.colSpan > 1 ? `grid-column:span ${a.colSpan}` : "",
      a.rowSpan > 1 ? `grid-row:span ${a.rowSpan}` : "",
      a.justifySelf !== "auto" ? `justify-self:${a.justifySelf}` : "",
      a.alignSelf !== "auto" ? `align-self:${a.alignSelf}` : "",
      a.backgroundColor !== "transparent" ? `background-color:${a.backgroundColor}` : "",
      a.padding > 0 ? `padding:${a.padding}px` : "",
      a.borderRadius > 0 ? `border-radius:${a.borderRadius}px` : "",
      a.minHeight > 0 ? `min-height:${a.minHeight}px` : "",
    ]
      .filter(Boolean)
      .join(";");
    return ["div", mergeAttributes({ "data-grid-item": "", style }), 0];
  },
});
