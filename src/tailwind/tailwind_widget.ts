import { tailwindAttributesBuilder } from "./tailwind_builder";
import { mostFrequentString } from "./tailwind_helpers";

import {
  convertPxToTailwindAttr,
  mapWidthHeightSize,
} from "./tailwind_wrappers";

export const rowColumnProps = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  // ROW or COLUMN
  const rowOrColumn =
    node.layoutMode === "HORIZONTAL" ? "flex-row " : "flex-col ";

  // https://tailwindcss.com/docs/space/
  // space between items
  const spacing = convertPxToTailwindAttr(node.itemSpacing, mapWidthHeightSize);
  const spaceDirection = node.layoutMode === "HORIZONTAL" ? "x" : "y";
  const space = `space-${spaceDirection}-${spacing} `;

  // align according to the most frequent way the children are aligned.
  const layoutAlign =
    mostFrequentString(node.children.map((d) => d.layoutAlign)) === "MIN"
      ? ""
      : "justify-center ";

  return `flex ${rowOrColumn}${space}${layoutAlign}`;
};

export const getContainerSizeProp = (
  node: DefaultFrameMixin | DefaultShapeMixin
): string => {
  /// WIDTH AND HEIGHT
  /// Will the width and height be necessary?

  // when the child has the same size as the parent, don't set the size twice
  if ("layoutMode" in node) {
    if (node.children.length === 1) {
      const child = node.children[0];
      if (child.width === node.width && child.height && node.height) {
        return "";
      }
    }
  }

  let nodeHeight = node.height;
  let nodeWidth = node.width;

  // tailwind doesn't support OUTSIDE or CENTER, only INSIDE.
  // Therefore, to give the same feeling, the height and width will be slighly increased.
  // node.strokes.lenght is necessary because [strokeWeight] can exist even without strokes.
  if (node.strokes.length) {
    if (node.strokeAlign === "OUTSIDE") {
      nodeHeight += node.strokeWeight * 2;
      nodeWidth += node.strokeWeight * 2;
    } else if (node.strokeAlign === "CENTER") {
      nodeHeight += node.strokeWeight;
      nodeWidth += node.strokeWeight;
    }
  }

  const propHeight = `h-${convertPxToTailwindAttr(
    nodeHeight,
    mapWidthHeightSize
  )} `;

  const propWidth = `w-${convertPxToTailwindAttr(
    nodeWidth,
    mapWidthHeightSize
  )} `;

  if ("layoutMode" in node) {
    // if counterAxisSizingMode === "AUTO", width and height won't be set. For every other case, it will be.
    if (node.counterAxisSizingMode === "FIXED") {
      // when AutoLayout is HORIZONTAL, width is set by Figma and height is auto.
      if (node.layoutMode === "HORIZONTAL") {
        return `${propHeight}`;
      } else if (node.layoutMode === "VERTICAL") {
        // when AutoLayout is VERTICAL, height is set by Figma and width is auto.
        return `${propWidth}`;
      }
      return `${propWidth}${propHeight}`;
    }
  } else {
    return `${propWidth}${propHeight}`;
  }

  return "";
};