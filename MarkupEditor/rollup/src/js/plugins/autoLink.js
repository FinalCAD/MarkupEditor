//
//  autoLink.js
//  MarkupEditor
//
//  Created by Antoine CHINAULT on 24/06/2025.
//

import { Plugin } from "prosemirror-state"
import { MarkType } from "prosemirror-model"

const URL_REGEX = /\b(?:https?:\/\/|www\.)[^\s<>"']+\.[^\s<>"']{2,}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /\b(?:\+?\d[\d\s.-]{7,}\d)\b/g;

export const autoLinkPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    let tr = newState.tr;
    let modified = false;
    const linkMark = newState.schema.marks.link;
    if (!linkMark) return null;

    newState.doc.descendants((node, pos) => {
      if (!node.isText) return;
      const text = node.text;
      if (!text) return;

      // Supprime les liens existants si invalides
      node.marks.forEach((mark) => {
        if (mark.type === linkMark) {
          if (
            !URL_REGEX.test(text) &&
            !EMAIL_REGEX.test(text) &&
            !PHONE_REGEX.test(text)
          ) {
            tr = tr.removeMark(pos, pos + node.nodeSize, linkMark);
            modified = true;
          }
        }
      });

      // Recherche et ajoute les liens complets uniquement
      const combinedRegex = new RegExp(
        `${URL_REGEX.source}|${EMAIL_REGEX.source}|${PHONE_REGEX.source}`,
        'g'
      );
      let match;
      while ((match = combinedRegex.exec(text)) !== null) {
        const raw = match[0];
        const start = match.index;
        const end = start + raw.length;
        const href = EMAIL_REGEX.test(raw)
          ? `mailto:${raw}`
          : PHONE_REGEX.test(raw)
          ? `tel:${raw.replace(/\D/g, "")}`
          : raw.startsWith("http")
          ? raw
          : `https://${raw}`;

        const from = pos + start;
        const to = pos + end;

        // Ajout le lien uniquement s'il n'existe pas déjà
        let already = false;
        newState.doc.nodesBetween(from, to, (n) => {
          if (
            n.isText &&
            n.marks.some(
              (m) => m.type === linkMark && m.attrs.href === href
            )
          ) {
            already = true;
          }
        });
        if (!already) {
          tr = tr.addMark(from, to, linkMark.create({ href }));
          modified = true;
        }
      }
    });

    return modified ? tr : null;
  },
});


