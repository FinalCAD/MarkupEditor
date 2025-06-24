//
//  autoLink.js
//  MarkupEditor
//
//  Created by Antoine CHINAULT on 24/06/2025.
//

import { Plugin } from "prosemirror-state";

export const autoLinkPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    let tr = newState.tr;
    let modified = false;
    const linkMark = newState.schema.marks.link;

    const urlRegex = /\b(https?:\/\/[^\s]+|www\.[^\s]+)\b/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const phoneRegex = /\b(\+?\d[\d\s]{7,})\b/g;

    newState.doc.descendants((node, pos) => {
      if (!node.isText) return;

      let text = node.text;

      if (!text) return;

      let matches = [];
      let combinedRegex = new RegExp(`${urlRegex.source}|${emailRegex.source}|${phoneRegex.source}`, 'g');

      let match;
      while ((match = combinedRegex.exec(text)) !== null) {
        matches.push({ index: match.index, match: match[0] });
      }

      // Remove existing link marks to avoid duplicates
      const existingLink = node.marks.find(m => m.type === linkMark);
      if (existingLink && matches.length === 0) {
        tr = tr.removeMark(pos, pos + node.nodeSize, linkMark);
        modified = true;
      }

      for (let { index, match } of matches) {
        let href = match;

        if (emailRegex.test(match)) {
          href = `mailto:${match}`;
        } else if (phoneRegex.test(match)) {
          const digits = match.replace(/\s+/g, '');
          href = `tel:${digits}`;
        } else if (!/^https?:\/\//.test(match)) {
          href = `https://${match}`;
        }

        tr = tr.addMark(
          pos + index,
          pos + index + match.length,
          linkMark.create({ href })
        );
        modified = true;
      }
    });

    return modified ? tr : null;
  }
});
