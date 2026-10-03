/* global React */
// ============================================================
// Admin wireframes
// Same shell pattern — but admin has its own SECONDARY nav
// (the tab list / dropdown we built in v1.0.1) inside the page body.
// ============================================================

const MOBILE_W_ADMIN = 380;

function AdminMobile() {
    return (
        <div style={{
            width: MOBILE_W_ADMIN,
            border: "1.5px dashed var(--ink-3)",
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--paper)",
            boxShadow: "0 2px 0 var(--ink-3)",
            display: "flex", flexDirection: "column",
        }}>
            <NavTop w={MOBILE_W_ADMIN} />
            <div style={{ padding: "16px 14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                <Title size={22}>Admin</Title>

                {/* Section selector — native dropdown on mobile */}
                <Box dashed={false} fill="var(--paper-2)" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", height: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontFamily: "var(--sketch-font)", color: "var(--accent)", fontSize: 16 }}>▶</div>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, fontWeight: 700 }}>Løb</div>
                        <Pill accent>12</Pill>
                    </div>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, color: "var(--ink-3)" }}>▼</div>
                </Box>
                <Note>Dropdown · 7 sections behind one tap · no horizontal scroll</Note>

                {/* Action row */}
                <div style={{ display: "flex", gap: 8 }}>
                    <CTA fill style={{ flex: 1 }}>+ Nyt løb</CTA>
                    <IconBtn size={42} label="⤓" />
                </div>

                {/* List of editable items */}
                {[
                    ["Monaco GP", "Snart åbent", true],
                    ["Spanien GP", "Snart", false],
                    ["Emilia-Romagna", "Afsluttet", false],
                    ["Miami GP", "Afsluttet", false],
                ].map(([name, status, accent], i) => (
                    <Box key={i} dashed={false} fill="var(--paper-2)" style={{ padding: "10px 12px", flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, fontWeight: 700 }}>{name}</div>
                            <div style={{ fontFamily: "var(--sketch-font)", fontSize: 10, color: "var(--ink-3)" }}>{status}</div>
                        </div>
                        <IconBtn size={32} label="✎" />
                        <IconBtn size={32} label="⋯" />
                    </Box>
                ))}
            </div>
            <NavBottom w={MOBILE_W_ADMIN} loggedIn={true} />
        </div>
    );
}

function AdminDesktop() {
    const w = 760;
    return (
        <div style={{
            width: w,
            border: "1.5px dashed var(--ink-3)",
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--paper)",
            boxShadow: "0 2px 0 var(--ink-3)",
            display: "flex", flexDirection: "column",
        }}>
            <NavTop w={w} />
            <div style={{ padding: "22px 28px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
                <Title size={26}>Admin</Title>

                {/* Tabs at desktop — wrap, never scroll */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, borderBottom: "1.5px dashed var(--ink-3)" }}>
                    {[
                        ["Løb", 12, true],
                        ["Medlemmer", 24],
                        ["Kørere", 20],
                        ["Invitationer", 3],
                        ["Resultater"],
                        ["Indstillinger"],
                        ["Logs"],
                    ].map(([label, count, active], i) => (
                        <div key={i} className={"wf-tab" + (active ? " active" : "")}>
                            {label} {count && <Pill accent={active}>{count}</Pill>}
                        </div>
                    ))}
                </div>
                <Note>Tabs wrap to second row instead of scrolling · same component as mobile dropdown</Note>

                {/* Two-column body */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[1, 2, 3, 4].map(i => (
                        <Box key={i} dashed={false} fill="var(--paper-2)" style={{ padding: "14px 16px", gap: 6 }}>
                            <Bar w="60%" h={9} dark />
                            <Bar w="40%" h={6} />
                            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                <Pill accent>Status</Pill>
                                <Pill>tag</Pill>
                            </div>
                        </Box>
                    ))}
                </div>
            </div>
            <NavBottom w={w} loggedIn={true} />
        </div>
    );
}

Object.assign(window, { AdminMobile, AdminDesktop });
