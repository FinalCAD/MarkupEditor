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
      const underlineMark = node.marks.find(m => m.type.name === 'underline');
      if (!spanMark || !underlineMark) return;

      const style = spanMark.attrs.style || '';
      const colorMatch = style.match(/color:\s*([^;]+)/);
      const spanColor = colorMatch ? colorMatch[1].trim() : null;

      const underlineColor = underlineMark.attrs?.color || null;

      if (spanColor && spanColor !== underlineColor) {
        const from = pos;
        const to = pos + node.nodeSize;

        const otherMarks = node.marks.filter(m => m.type.name !== 'underline');
        const updatedUnderline = underlineMark.type.create({ color: spanColor });
        const allMarks = [...otherMarks, updatedUnderline];

        tr = tr.removeMark(from, to, underlineMark.type);
        allMarks.forEach(mark => {
          tr = tr.addMark(from, to, mark);
        });

        modified = true;
      }
    });

    return modified ? tr : null;
  }
});
