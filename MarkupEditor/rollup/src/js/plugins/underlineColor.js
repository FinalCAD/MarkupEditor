//
//  underlineColor.js
//  MarkupEditor
//
//  Created by Antoine CHINAULT on 24/06/2025.
//

import { Plugin } from "prosemirror-state";

export const autoSyncUnderlineColorPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    let tr = newState.tr;
    let modified = false;

    newState.doc.descendants((node, pos) => {
      if (!node.isText) return;

      const spanMark = node.marks.find(m => m.type.name === 'span');
      if (!spanMark) return;

      const underlineMark = node.marks.find(m => m.type.name === 'underline');
      if (!underlineMark) return;

      const style = spanMark.attrs.style || '';
      const colorMatch = style.match(/color:\s*([^;]+)/);
      const spanColor = colorMatch ? colorMatch[1].trim() : null;

      const underlineColor = underlineMark.attrs?.color || null;

      if (spanColor && spanColor !== underlineColor) {
        console.log(`[sync plugin] pos ${pos}: ${underlineColor} → ${spanColor}`);
        tr = tr.removeMark(pos, pos + node.nodeSize, underlineMark.type);
        tr = tr.addMark(pos, pos + node.nodeSize, underlineMark.type.create({ color: spanColor }));
        modified = true;
      }
    });

    if (modified) {
      return tr;
    }
    return null;
  }
});
