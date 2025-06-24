//
//  autoLink.js
//  MarkupEditor
//
//  Created by Antoine CHINAULT on 24/06/2025.
//

import { Plugin } from "prosemirror-state"
import { MarkType } from "prosemirror-model"

const urlRegex = /((https?:\/\/)?(www\.)?[\w-]+\.[\w]{2,}(\/[\w#?&=.-]*)*)/gi;
const emailRegex = /[\w.-]+@[\w.-]+\.[a-z]{2,}/gi;
const phoneRegex = /\b(\+?\d[\d\s.-]{7,}\d)\b/g;

function getHref(text) {
  if (emailRegex.test(text)) return `mailto:${text}`;
  if (phoneRegex.test(text)) return `tel:${text.replace(/\D/g, '')}`;
  if (!text.startsWith("http")) return `https://${text}`;
  return text;
}

export const autoLinkPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    const { schema } = newState;
    const linkMark = schema.marks.link;
    if (!linkMark) return null;

    let tr = newState.tr;
    let modified = false;

    newState.doc.descendants((node, pos) => {
      if (!node.isText) return;

      const text = node.text;
      if (!text) return;

      const combinedRegex = new RegExp(
        `${urlRegex.source}|${emailRegex.source}|${phoneRegex.source}`,
        "gi"
      );

      let match;
      while ((match = combinedRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const from = pos + start;
        const to = pos + end;

        const existing = linkMark.isInSet(node.marks);
        const href = getHref(match[0]);

        if (!existing || existing.attrs.href !== href) {
          tr = tr.removeMark(from, to, linkMark);
          tr = tr.addMark(from, to, linkMark.create({ href }));
          modified = true;
        }
      }

      // Si le texte ne correspond plus à un lien valide, on retire le mark
      if (!combinedRegex.test(text)) {
        const linkMarkInSet = linkMark.isInSet(node.marks);
        if (linkMarkInSet) {
          tr = tr.removeMark(pos, pos + node.nodeSize, linkMark);
          modified = true;
        }
      }
    });

    return modified ? tr : null;
  }
});

