//
//  UIColor+Extensions.swift
//  MarkupEditor
//
//  Created by Julien SMOLARECK on 28/04/2025.
//

import UIKit

extension UIColor {
    
    /// Create color from RGB(A)
    ///
    /// Parameters:
    ///  - absoluteRed: Red value (between 0 - 255)
    ///  - green:       Green value (between 0 - 255)
    ///  - blue:        Blue value (between 0 - 255)
    ///  - alpha:       Blue value (between 0 - 255)
    ///
    /// Returns: UIColor instance.
    convenience init(absoluteRed red: Int, green: Int, blue: Int, alpha: Int = 255) {
        let normalizedRed = CGFloat(red) / 255.0
        let normalizedGreen = CGFloat(green) / 255.0
        let normalizedBlue = CGFloat(blue) / 255.0
        let normalizedAlpha = CGFloat(alpha) / 255.0
        
        self.init(
            red: normalizedRed,
            green: normalizedGreen,
            blue: normalizedBlue,
            alpha: normalizedAlpha
        )
    }
    
    convenience init(rgba: String) throws {
        let startIndex = rgba.index(rgba.startIndex, offsetBy: "rgb(".count)
        let endIndex = rgba.index(rgba.endIndex, offsetBy: -")".count)
        
        let components = rgba[startIndex..<endIndex].split(separator: ",").map { Int($0.trimmingCharacters(in: .whitespacesAndNewlines)) }
        
        
        self.init(absoluteRed: components[0] ?? 0, green: components[1] ?? 0, blue: components[2] ?? 0)
        
    }
    
    /// Create color from an hexadecimal integer value (e.g. 0xFFFFFF)
    ///
    /// Note:
    ///  - Based on: http://stackoverflow.com/a/24263296
    ///
    /// Parameters:
    ///  - hex: Hexadecimal integer for color
    ///
    /// Returns: UIColor instance.
    convenience init(hex: Int) {
        self.init(
            absoluteRed: (hex >> 16) & 0xff,
            green: (hex >> 8) & 0xff,
            blue: hex & 0xff
        )
    }
    
    /// Create color from an hexadecimal string value (e.g. "#FFFFFF" / "FFFFFF")
    ///
    /// Note:
    ///  - Based on: http://stackoverflow.com/a/27203691
    ///
    /// Parameters:
    ///  - hex: Hexadecimal string for color
    ///
    /// Returns: UIColor instance.
    convenience init(hex: String) {
        var normalizedHexColor = hex
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .uppercased()
        
        if normalizedHexColor.hasPrefix("#") {
            normalizedHexColor = String(normalizedHexColor.dropFirst())
        }
        
        // Convert to hexadecimal color (string) to integer
        var hex: UInt32 = 0
        Scanner(string: normalizedHexColor).scanHexInt32(&hex)
        
        self.init(
            hex: Int(hex)
        )
    }
    
    func toWebRgb() -> String {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        if self.getRed(&r, green: &g, blue: &b, alpha: &a) {
            let rInt = Int(round(r * 255))
            let gInt = Int(round(g * 255))
            let bInt = Int(round(b * 255))
            let aStr = String(format: "%.2f", a)
            print("UIColor toWebRgb rgba(\(rInt),\(gInt),\(bInt),\(aStr))")
            return "rgba(\(rInt),\(gInt),\(bInt),\(aStr))"
        } else {
            return "rgba(0,0,0,1.00)"
        }
    }
}
