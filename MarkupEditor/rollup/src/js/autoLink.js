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
    
    const textLinkPatterns = [
        {
            type: 'url',
            regex: /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9\-._~%]+(?:\.[a-z]{2,})(?:\/[^\s]*)?\b/gi,
            getHref: (match) => match.startsWith('http') ? match : `https://${match}`
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
        
        // Supprimer tous les anciens liens
        node.marks.forEach((mark) => {
            if (mark.type === linkMark) {
                tr.removeMark(pos, pos + node.nodeSize, linkMark);
                modified = true;
            }
        });
        
        textLinkPatterns.forEach(({ regex, getHref }) => {
            let match;
            while ((match = regex.exec(text)) !== null) {
                const fullMatch = match[0];
                const start = match.index;
                const end = start + fullMatch.length;
                const from = pos + start;
                const to = pos + end;
                const href = getHref(fullMatch);
                
                tr.addMark(from, to, linkMark.create({ href }));
                modified = true;
            }
        });
    });
    
    if (modified) view.dispatch(tr);
}

