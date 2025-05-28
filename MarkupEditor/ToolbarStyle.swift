//
//  ToolbarStyle.swift
//  MarkupEditor
//
//  Created by Steven Harris on 8/8/22.
//

import UIKit

@MainActor
public class ToolbarStyle: @unchecked Sendable, ObservableObject {
    
    static let compact = ToolbarStyle(.compact)
    static let labeled = ToolbarStyle(.labeled)
    static let custom = ToolbarStyle(.custom)
    
    var style: Style

    public enum Style {
        case compact
        case labeled
        case custom
    }
    
    public init(_ style: Style = .labeled) {
        self.style = style
    }
    
    public func height() -> CGFloat {
        switch style {
        case .compact:
            if UIDevice.current.userInterfaceIdiom == .mac {
                return 30
            } else {
                return 69
            }
        case .labeled:
            return 69
        case .custom:
            return 49
        }
    }
    
    public func buttonHeight() -> CGFloat {
        switch style {
        case .compact:
            if UIDevice.current.userInterfaceIdiom == .mac {
                return 24
            } else {
                return 34
            }
        case .labeled:
            return 30
        case .custom:
            return 40
        }
    }
    
    public static func symbolScale(for style: Style) -> UIImage.SymbolScale {
        switch style {
        case .compact, .custom:
            if UIDevice.current.userInterfaceIdiom == .mac {
                return .medium
            } else {
                return .large
            }
        case .labeled:
            return .large
        }
    }
    
}
