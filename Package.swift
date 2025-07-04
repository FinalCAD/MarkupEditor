// swift-tools-version:5.7
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "MarkupEditor",
    defaultLocalization: "en",
    platforms: [.iOS("16.0")],
    products: [
        // Products define the executables and libraries a package produces, and make them visible to other packages.
        .library(
            name: "MarkupEditor",
            targets: ["MarkupEditor"]),
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
        // .package(url: /* package url */, from: "1.0.0"),
    ],
    targets: [
        // Resources include the html, css, and js files that are loaded when a MarkupWKWebView is instantiated
        .target(
            name: "MarkupEditor",
            dependencies: [],
            path: "MarkupEditor",
            exclude: ["rollup"],
            resources: [
                .copy("Resources/Font"),
                .process("Resources/Html")
            ]),
        .testTarget(
            name: "BasicTests",
            dependencies: ["MarkupEditor"],
            path: "MarkupEditorTests/BasicTests"),
    ],
    swiftLanguageVersions: [.v5]
)
