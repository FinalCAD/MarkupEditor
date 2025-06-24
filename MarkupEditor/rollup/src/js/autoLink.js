//
//  autoLink.js
//  MarkupEditor
//
//  Created by Antoine CHINAULT on 24/06/2025.
//

export function applyAutoLink(view) {
  const { state } = view;
  const { tr } = state;
  let modified = false;
  const linkMark = state.schema.marks.link;
  if (!linkMark) return;

  const URL_REGEX = /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9\-._~%]+(?:\.[a-z]{2,})(?:\/[^\s]*)?\b/gi;

  state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    const text = node.text;

    // Supprimer tous les anciens liens
    node.marks.forEach((mark) => {
      if (mark.type === linkMark) {
        tr.removeMark(pos, pos + node.nodeSize, linkMark);
        modified = true;
      }
    });

    // Rechercher les URLs valides
    let match;
    while ((match = URL_REGEX.exec(text)) !== null) {
      const url = match[0];
      const start = match.index;
      const end = start + url.length;
      const from = pos + start;
      const to = pos + end;
      const href = url.startsWith("http") ? url : `https://${url}`;

      tr.addMark(from, to, linkMark.create({ href }));
      modified = true;
    }
  });

  if (modified) view.dispatch(tr);
}
