//
//  autoLink.js
//  MarkupEditor
//
//  Created by Antoine CHINAULT on 24/06/2025.
//

import { Plugin } from "prosemirror-state"
import { MarkType } from "prosemirror-model"

export const autoLinkPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    const tr = newState.tr
    let modified = false

    const linkMark = newState.schema.marks.link
    if (!linkMark) return null

    const urlRegex = /\bhttps?:\/\/[^\s<>{}()[\]]+\b|www\.[^\s<>{}()[\]]+\b/g
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
    const phoneRegex = /\b(?:\+?\d[\d\s.-]{7,}\d)\b/g

    function applyMatches(regex, getHref) {
      newState.doc.descendants((node, pos) => {
        if (!node.isText) return

        const text = node.text
        if (!text) return

        let match
        while ((match = regex.exec(text)) !== null) {
          const start = match.index
          const end = start + match[0].length

          const from = pos + start
          const to = pos + end

          const existing = linkMark.isInSet(node.marks)
          if (!existing || existing.attrs.href !== getHref(match[0])) {
            tr.removeMark(from, to, linkMark)
            tr.addMark(from, to, linkMark.create({ href: getHref(match[0]) }))
            modified = true
          }
        }
      })
    }

    applyMatches(urlRegex, url => url.startsWith('http') ? url : 'https://' + url)
    applyMatches(emailRegex, email => 'mailto:' + email)
    applyMatches(phoneRegex, phone => 'tel:' + phone.replace(/\D/g, ''))

    return modified ? tr : null
  }
})
