/* global React */
// ============================================================
// Wireframe primitives — low-fi shapes for early layout exploration
// Pure visual atoms. No real data, no semantic naming —
// just shapes, bars, and labels arranged like a sketchbook.
// ============================================================

const { useState } = React;

// A neutral box with optional dashed/solid border, label, and slot.
function Box({ h, w, label, dashed = true, fill, children, style, className = "" }) {
    const s = {
        width: w,
        height: h,
        border: `1.5px ${dashed ? "dashed" : "solid"} var(--ink-2)`,
        background: fill || "transparent",
        borderRadius: 4,
        padding: label ? "10px 12px" : 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxSizing: "border-box",
        position: "relative",
        ...style,
    };
    return (
        <div className={"wf-box " + className} style={s}>
            {label && <div className="wf-label">{label}</div>}
            {children}
        </div>
    );
}

// Solid gray bar — stand-in for a line of text.
function Bar({ w = "70%", h = 8, dark = false, style }) {
    return (
        <div style={{
            width: w, height: h,
            background: dark ? "var(--ink)" : "var(--ink-3)",
            borderRadius: 2,
            ...style,
        }} />
    );
}

// Stack of bars approximating a paragraph.
function TextBlock({ lines = 3, last = "60%" }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Bar key={i} w={i === lines - 1 ? last : "100%"} h={6} />
            ))}
        </div>
    );
}

// Big handwritten-style title placeholder.
function Title({ children, size = 22, style }) {
    return (
        <div className="wf-title" style={{ fontSize: size, ...style }}>
            {children}
        </div>
    );
}

// Annotation note pointing at a spot.
function Note({ children, style }) {
    return (
        <div className="wf-note" style={style}>{children}</div>
    );
}

// Hand-drawn divider line.
function Divider({ style }) {
    return <div className="wf-divider" style={style} />;
}

// Pill / chip placeholder.
function Pill({ children, accent = false, style }) {
    return (
        <span className={"wf-pill" + (accent ? " accent" : "")} style={style}>
            {children}
        </span>
    );
}

// Square / circle button placeholder.
function IconBtn({ size = 40, round = false, accent = false, label, style }) {
    return (
        <div className={"wf-iconbtn" + (accent ? " accent" : "")} style={{
            width: size, height: size,
            borderRadius: round ? "50%" : 6,
            ...style,
        }}>{label}</div>
    );
}

// "Primary CTA" button — outlined with optional fill.
function CTA({ children, w, fill = false, style }) {
    return (
        <div className={"wf-cta" + (fill ? " fill" : "")} style={{ width: w, ...style }}>
            {children}
        </div>
    );
}

// Avatar placeholder.
function Avatar({ size = 32, letter = "O" }) {
    return (
        <div className="wf-avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
            {letter}
        </div>
    );
}

// A "page artboard" — fixed-width frame holding a full page mockup.
// `w` is the logical width (e.g. 375 for mobile).
function Page({ w, h, label, children, style }) {
    return (
        <div className="wf-page" style={{ width: w, minHeight: h, ...style }}>
            {label && <div className="wf-page-label">{label}</div>}
            <div className="wf-page-body">{children}</div>
        </div>
    );
}

// Make the primitives global so other Babel scripts can use them.
Object.assign(window, {
    Box, Bar, TextBlock, Title, Note, Divider, Pill, IconBtn, CTA, Avatar, Page,
});
