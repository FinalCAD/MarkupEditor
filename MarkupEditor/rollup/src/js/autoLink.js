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

  const hasTLD = (text) => {
    try {
      let domain = text
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split(/[\/?#]/)[0]; // Get only the domain
      return /\.[a-z]{2,}$/.test(domain);
    } catch {
      return false;
    }
  };

  const textLinkPatterns = [
    {
      type: 'url',
      regex: /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9\-._~%]+(?:\.[a-z]{2,})(?:\/[^\s]*)?\b/gi,
      getHref: (match) => {
        if (!hasTLD(match)) return null;
        return match.startsWith('http') ? match : `https://${match}`;
      }
    },
    {
      type: 'email',
      regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      getHref: (match) => `mailto:${match}`
    },
    {
      type: 'phone',
      regex: /\b\+?[0-9]{1,3}?[-.\s]?(\(?\d{1,4}\)?[-.\s]?)*\d{3,4}[-.\s]?\d{3,4}\b/g,
      getHref: (match) => `tel:${match.replace(/[^\d+]/g, '')}`
    }
  ];

  state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    const text = node.text;
    let linkRanges = [];

    for (const { regex, getHref } of textLinkPatterns) {
      regex.lastIndex = 0;

      let match;
      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const start = match.index;
        const end = start + fullMatch.length;
        const from = pos + start;
        const to = pos + end;
        const href = getHref(fullMatch);

        if (!href) continue;

        linkRanges.push({ from, to, href });
      }
    }

    // Remove all existing link marks in the text node
    node.marks.forEach((mark) => {
      if (mark.type === linkMark) {
        tr.removeMark(pos, pos + text.length, linkMark);
        modified = true;
      }
    });

    // Add valid links back
    linkRanges.forEach(({ from, to, href }) => {
      tr.addMark(from, to, linkMark.create({ href }));
      modified = true;
    });
  });

  if (modified) view.dispatch(tr);
}
