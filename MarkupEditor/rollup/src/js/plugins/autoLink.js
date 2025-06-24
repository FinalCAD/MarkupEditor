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
    if (!linkMark) return;

    const patterns = [
      { type: 'url', regex: /\b(?:https?:\/\/|www\.)[^\s<>"']+\b/g, getHref: t => t.startsWith('www.') ? 'https://' + t : t },
      { type: 'email', regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, getHref: t => 'mailto:' + t },
      { type: 'tel', regex: /\b(?:\+?\d[\d\s.-]{7,}\d)\b/g, getHref: t => 'tel:' + t.replace(/\D/g, '') }
    ];

    newState.doc.descendants((node, pos) => {
      if (!node.isTextblock) return;

      const text = node.textContent;
      if (!text) return;

      let marksToRemove = [];

     node.descendants((child, offset) => {
        if (!child.isText) return;

        child.marks.forEach(mark => {
          if (mark.type.name === 'link') {
            const linkText = child.text;
            const isStillValid = patterns.some(p => p.regex.test(linkText));
            if (!isStillValid) {
              tr = tr.removeMark(pos + offset, pos + offset + child.nodeSize, mark.type);
              modified = true;
            }
          }
        });
      });

      for (let { regex, getHref } of patterns) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          const full = match[0];
          const start = match.index;
          const end = start + full.length;

          const from = pos + 1 + start;
          const to = pos + 1 + end;

          let hasMark = false;
          newState.doc.nodesBetween(from, to, (n) => {
            if (n.isText && n.marks.some(m => m.type === linkMark && m.attrs.href === getHref(full))) {
              hasMark = true;
            }
          });

          if (!hasMark) {
            tr = tr.addMark(from, to, linkMark.create({ href: getHref(full) }));
            modified = true;
          }
        }
      }
    });

    return modified ? tr : null;
  }
});
