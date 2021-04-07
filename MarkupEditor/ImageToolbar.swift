//
//  SwiftUIView.swift
//  
//
//  Created by Steven Harris on 3/24/21.
//

import SwiftUI

public struct ImageToolbar: View {
    @Binding var showImageToolbar: Bool
    @Binding private var selectedWebView: MarkupWKWebView?
    @ObservedObject private var selectionState: SelectionState
    private var markupUIDelegate: MarkupUIDelegate?
    private var initialSrc: String?
    private var initialAlt: String?
    private var initialScale: Int?
    private let scaleStep: Int = 5
    // The src, alt, and scale values are the state for the toolbar
    @State private var src: String
    @State private var alt: String
    @State private var scale: Int
    // The previewed values hold on to what has been previewed, to
    // avoid doing the insert/modify unnecessarily
    @State private var previewedSrc: String
    @State private var previewedAlt: String
    @State private var previewedScale: Int
    // The "arg" equivalent is for scale passed to create/modifyImage
    private var argSrc: String? { src.isEmpty ? nil : src }
    private var argAlt: String? { alt.isEmpty ? nil : alt }
    private var argScale: Int? { scale == 100 ? nil : scale }
    @State private var saving: Bool = false
    @State private var endedEditing: Bool = false
    
    public var body: some View {
            HStack(alignment: .bottom) {
                ToolbarTextField(label: "Image URL", placeholder: "Enter URL", text: $src, commitHandler: { save() }, isEditingHandler: { isEditing in })
                ToolbarTextField(label: "Description", placeholder: "Enter Description", text: $alt)
                //
                //VStack(spacing: 2) {
                //    Text("Image URL")
                //        .font(.system(size: 10, weight: .light))
                //    //TextField("Enter URL", text: $src, onCommit: { preview() })
                //    //    .textFieldStyle(RoundedBorderTextFieldStyle())
                //    MarkupTextField(text: $src, endedEditing: $endedEditing, placeholder: "Enter URL") //, isFirstResponder: true)
                //        .onChange(of: endedEditing, perform: { value in if value { preview() }})
                //}
                //VStack(spacing: 2) {
                //    Text("Description")
                //        .font(.system(size: 10, weight: .light))
                //    //TextField("Enter Description", text: $alt, onCommit: { preview() })
                //    //    .textFieldStyle(RoundedBorderTextFieldStyle())
                //    MarkupTextField(text: $alt, endedEditing: $endedEditing, placeholder: "Enter Description")
                //        .onChange(of: endedEditing, perform: { value in if value { preview() }})
                //}
                Divider()
                VStack(spacing: 2) {
                    Text("Scale")
                        .font(.system(size: 10, weight: .light))
                    Stepper(onIncrement: incrementScale, onDecrement: decrementScale) {
                        Text("\(scale)%")
                            .frame(width: 50, alignment: .trailing)
                    }
                    .scaledToFit()
                }
                Divider()
                HStack(alignment: .bottom) {
                    ToolbarTextButton(title: "Save", action: { self.save() }, width: 80)
                    ToolbarTextButton(title: "Cancel", action: { self.cancel() }, width: 80)
                }
            }
            .onChange(of: selectionState.src, perform: { value in
                src = selectionState.src ?? ""
                alt = selectionState.alt ?? ""
                scale = selectionState.scale ?? 100
                previewedSrc = src
                previewedAlt = alt
                previewedScale = scale
            })
            .padding([.leading, .trailing], 8)
            .padding([.top], 2)
            .fixedSize(horizontal: false, vertical: true)
            .frame(idealHeight: 54, maxHeight: 54)
            Divider()
    }
    
    public init(selectionState: SelectionState, selectedWebView: Binding<MarkupWKWebView?>, showImageToolbar: Binding<Bool>) {
        self.selectionState = selectionState
        _selectedWebView = selectedWebView
        _showImageToolbar = showImageToolbar
        initialSrc = selectionState.src
        initialAlt = selectionState.alt
        initialScale = selectionState.scale
        _previewedSrc = State(initialValue: selectionState.src ?? "")
        _previewedAlt = State(initialValue: selectionState.alt ?? "")
        _previewedScale = State(initialValue: selectionState.scale ?? 100)
        _src = State(initialValue: selectionState.src ?? "")
        _alt = State(initialValue: selectionState.alt ?? "")
        _scale = State(initialValue: selectionState.scale ?? 100)
    }
    
    private func incrementScale() {
        // We need to reset scale and then set it back to avoid this bug:
        // https://stackoverflow.com/questions/58960251/strange-behavior-of-stepper-in-swiftui
        scale += scaleStep
        if scale > 100 {
            scale = 100
        } else {
            guard let view = selectedWebView, argSrc != nil else {
                scale -= scaleStep
                return
            }
            view.modifyImage(src: argSrc, alt: argAlt, scale: argScale)
        }
    }
    
    private func decrementScale() {
        // We need to reset scale and then set it back to avoid this bug:
        // https://stackoverflow.com/questions/58960251/strange-behavior-of-stepper-in-swiftui
        scale -= scaleStep
        if scale < scaleStep {
            scale = scaleStep
        } else {
            guard let view = selectedWebView, argSrc != nil else {
                scale += scaleStep
                return
            }
            view.modifyImage(src: argSrc, alt: argAlt, scale: argScale)
        }
    }
    
    private func previewed() -> Bool {
        // Return whether what we are seeing on the screen is the same as is in the toolbar
        return src == previewedSrc && alt == previewedAlt && scale == previewedScale
    }
    
    private func insertOrModify(handler: (()->Void)? = nil) {
        guard !previewed() else {
            handler?()
            return
        }
        if previewedSrc.isEmpty && !src.isEmpty {
            selectedWebView?.insertImage(src: argSrc, alt: argAlt)
        } else {
            selectedWebView?.modifyImage(src: argSrc, alt: argAlt, scale: argScale)
        }
        previewedSrc = src
        previewedAlt = alt
        previewedScale = scale
        handler?()
    }
    
    private func preview() {
        // The onChange event can fire and cause preview during the save operation.
        // So, if we are saving, then never preview.
        guard !saving else { return }
        insertOrModify()
    }
    
    private func save() {
        // Save src, alt, scale if they haven't been previewed, and then close
        saving = true
        insertOrModify() {
            // TODO: The animation causes problems in UIKit. Need to figure it out
            showImageToolbar.toggle()
            //withAnimation { showImageToolbar.toggle() }
        }
    }
    
    private func cancel() {
        // Restore src, alt, and scale to their initial values, put things back the way they were, and then close
        saving = true
        src = initialSrc ?? ""
        alt = initialAlt ?? ""
        scale = initialScale ?? 100
        insertOrModify() {
            // TODO: The animation causes problems in UIKit. Need to figure it out
            showImageToolbar.toggle()
            //withAnimation { showImageToolbar.toggle() }
        }
    }
    
}

struct ImageToolbar_Previews: PreviewProvider {
    
    static var previews: some View {
        // src: "https://polyominoes.files.wordpress.com/2019/10/logo-1024.png", alt: "Polyominoes logo", scale: 100
        ImageToolbar(selectionState: SelectionState(), selectedWebView: .constant(nil), showImageToolbar: .constant(true))
    }
}