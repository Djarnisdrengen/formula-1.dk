/* global React */
// ============================================================
// Reference card — 5 breakpoints + grid rules
// ============================================================

function BreakpointCard() {
    const rows = [
        ["XS", "< 480px", "Phone portrait", "1 col · stacked · full-bleed hero"],
        ["SM", "480 – 767px", "Phone landscape / small tablet portrait", "1 col · larger touch targets"],
        ["MD", "768 – 1023px", "Tablet · split screens", "2 col where useful · drawer becomes 360 anchored right"],
        ["LG", "1024 – 1439px", "Desktop", "Content max-width 1080 · drawer same as mobile (anchored)"],
        ["XL", "≥ 1440px", "Wide desktop", "Content max-width 1280 · extra side gutters"],
    ];

    return (
        <div style={{ width: 820, display: "flex", flexDirection: "column", gap: 16 }}>
            <Title size={28}>5 breakpoints</Title>
            <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, maxWidth: "60ch" }}>
                Standard XS/SM/MD/LG/XL. Layout stays the same shell at every width — only content density and gutters change. No special tablet mode; tablets just look like big phones (which matches your "mirror at all widths" brief).
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 6, border: "1.5px solid var(--ink-3)", borderRadius: 8 }}>
                <div className="wf-bprow head">
                    <div>Name</div><div>Range</div><div>Device</div><div>Layout</div>
                </div>
                {rows.map(([k, range, dev, layout], i) => (
                    <div key={k} className="wf-bprow">
                        <div style={{ fontWeight: 800 }}>{k}</div>
                        <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>{range}</div>
                        <div>{dev}</div>
                        <div>{layout}</div>
                    </div>
                ))}
            </div>

            <Divider style={{ margin: "10px 0" }} />

            <Title size={20}>Grid &amp; gutters</Title>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                    ["Content gutter", "16px (XS) → 24px (SM/MD) → 32px (LG/XL)"],
                    ["Top bar height", "56px constant · padded by safe-area on iOS"],
                    ["Bottom bar height", "64px + safe-area · stays during scroll"],
                    ["Drawer width", "min(380px, calc(100vw - 24px)) · anchored right"],
                    ["Content max-width", "1080px (LG) · 1280px (XL)"],
                    ["Card radius", "12 · CTA radius 8 · drawer radius 16"],
                ].map(([k, v]) => (
                    <Box key={k} dashed={false} fill="var(--paper-2)" style={{ padding: "10px 12px", gap: 4 }}>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)", letterSpacing: 1 }}>
                            {k.toUpperCase()}
                        </div>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 13, fontWeight: 600 }}>{v}</div>
                    </Box>
                ))}
            </div>
        </div>
    );
}

Object.assign(window, { BreakpointCard });
