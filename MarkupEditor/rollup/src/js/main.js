import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "./schema/index.js"
import {markupSetup} from "./setup/index.js"

import {
  DivView,
  ImageView,
  setTopLevelAttributes,
  setMessageHandler,
  loadUserFiles,
  searchFor,
  deactivateSearch,
  cancelSearch,
  pasteText,
  pasteHTML,
  emptyDocument,
  getHTML,
  getTestHTML,
  setHTML,
  setTestHTML,
  setPlaceholder,
  getHeight,
  padBottom,
  focus,
  focusOn,
  resetSelection,
  addDiv,
  removeDiv,
  addButton,
  removeButton,
  removeAllDivs,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleCode,
  toggleStrike,
  toggleSubscript,
  toggleSuperscript,
  setStyle,
  replaceStyle,
  toggleListItem,
  indent,
  outdent,
  setColor,
  setTextAlignment,
  toggleSelectionToLink,
  getTextAlignment,
  getLinkAttributes,
  getSpanAttributes,
  startModalInput,
  endModalInput,
  getSelectionState,
  selectionChanged,
  clicked,
  stateChanged,
  undoCommand,
  redoCommand,
  resetSelectedID,
  outermostOfTypeAt,
  testBlockquoteEnter,
  testListEnter,
  testExtractContents,
  testPasteHTMLPreprocessing,
  testPasteTextPreprocessing,
  insertLink,
  deleteLink,
  insertImage,
  modifyImage,
  cutImage,
  insertTable,
  addRow,
  addCol,
  addHeader,
  deleteTableArea,
  borderTable,
  triggerEmptyTransaction,
  getCursorPosition,
} from "./markup.js"

/**
 * The public MarkupEditor API callable from Swift as "MU.<function name>"
 */
export {
  setTopLevelAttributes,
  setMessageHandler,
  loadUserFiles,
  searchFor,
  deactivateSearch,
  cancelSearch,
  pasteText,
  pasteHTML,
  emptyDocument,
  getHTML,
  getTestHTML,
  setHTML,
  setTestHTML,
  setPlaceholder,
  getHeight,
  padBottom,
  focus,
  focusOn,
  resetSelection,
  addDiv,
  removeDiv,
  addButton,
  removeButton,
  removeAllDivs,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleCode,
  toggleStrike,
  toggleSubscript,
  toggleSuperscript,
  setStyle,
  replaceStyle,
  toggleListItem,
  indent,
  outdent,
  setColor,
  setTextAlignment,
  toggleSelectionToLink,
  getTextAlignment,
  getLinkAttributes,
  getSpanAttributes,
  startModalInput,
  endModalInput,
  getSelectionState,
  undoCommand,
  redoCommand,
  testBlockquoteEnter,
  testListEnter,
  testExtractContents,
  testPasteHTMLPreprocessing,
  testPasteTextPreprocessing,
  insertLink,
  deleteLink,
  insertImage,
  modifyImage,
  cutImage,
  insertTable,
  addRow,
  addCol,
  addHeader,
  deleteTableArea,
  borderTable,
  triggerEmptyTransaction,
  getCursorPosition,
}

const muSchema = new Schema({
  nodes: schema.spec.nodes,
  marks: schema.spec.marks
})

/**
 * Return whether to show the menubar in the web view.
 * 
 * The markupConfig var must be defined in an earlier script that is loaded into the 
 * web view that markup.js (or dist/markupeditor.umd.js) is loaded into. For example:
 * 
 *   var markupConfig = {
 *     menuBar: true,
 *   }
 * 
 * By default, if markupConfig is not defined, returns false and the menuBar is not shown.
 * 
 * @returns {bool} Whether markupConfig?.menuBar is present and true.
 */
function menuBar() {
  try {
    return markupConfig?.menuBar ?? false
  } catch {
    return false
  };
}

window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    // For the MarkupEditor, we can just use the editor element. 
    // There is mo need to use a separate content element.
    doc: DOMParser.fromSchema(muSchema).parse(document.querySelector("#editor")),
    plugins: markupSetup({
      menuBar: menuBar(),    // Show the menubar only if markupConfig?.menuBar is defined and true
      schema: muSchema
    })
  }),
    dispatchTransaction(tr) {
      const newState = window.view.state.apply(tr);
      window.view.updateState(newState);
      stateChanged();
    },
  nodeViews: {
    image(node, view, getPos) { return new ImageView(node, view, getPos) },
    div(node, view, getPos) { return new DivView(node, view, getPos) },
  },
  // All text input notifies Swift that the document state has changed.
  handleTextInput() {
    return false; // All the default behavior should occur
  },
  // Use createSelectionBetween to handle selection and click both.
  // Here we guard against selecting across divs.
  createSelectionBetween(view, $anchor, $head) {
    const divType = view.state.schema.nodes.div;
    const range = $anchor.blockRange($head);
    // Find the divs that the anchor and head reside in.
    // Both, one, or none can be null.
    const fromDiv = outermostOfTypeAt(divType, range.$from);
    const toDiv = outermostOfTypeAt(divType, range.$to);
    // If selection is all within one div, then default occurs; else return existing selection
    if ((fromDiv || toDiv) && !$anchor.sameParent($head)) {
      if (fromDiv != toDiv) {
        return view.state.selection;    // Return the existing selection
      }
    };
    resetSelectedID(fromDiv?.attrs.id ?? toDiv?.attrs.id ?? null)  // Set the selectedID to the div's id or null.
    selectionChanged();
    clicked();
    return null;                        // Default behavior should occur
  },
    handleDOMEvents: {
      mousedown(view, event) {
        clicked();
        return false;
      }
    }
})
