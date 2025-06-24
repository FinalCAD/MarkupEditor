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

    const text = newState.doc.textBetween(0, newState.doc.content.size, ' ', '\0');

    const urlRegex = /\bhttps?:\/\/[^\s<>"']+\b/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const phoneRegex = /\b(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{1,4}\)?[ .-]?)*\d{2,4}\b/g;

    function applyLink(match, hrefPrefix = '') {
      const href = hrefPrefix + match[0];
      const start = text.indexOf(match[0]);
      const end = start + match[0].length;

      const mark = newState.schema.marks.link;
      if (!mark) return;

      let hasMark = false;
      newState.doc.nodesBetween(start, end, (node) => {
        if (node.marks.some(m => m.type === mark && m.attrs.href === href)) {
          hasMark = true;
        }
      });

      if (!hasMark) {
        tr = tr.addMark(start, end, mark.create({ href }));
        modified = true;
      }
    }

    for (const match of text.matchAll(urlRegex)) {
      applyLink(match, '');
    }

    for (const match of text.matchAll(emailRegex)) {
      applyLink(match, 'mailto:');
    }

    for (const match of text.matchAll(phoneRegex)) {
      const cleaned = match[0].replace(/[ .()-]/g, '');
      if (cleaned.length >= 8 && /\d/.test(cleaned)) {
        applyLink(match, 'tel:');
      }
    }

    return modified ? tr : null;
  }
});

