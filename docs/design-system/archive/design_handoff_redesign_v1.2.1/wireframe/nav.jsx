/* global React */
// ============================================================
// Navigation system wireframes
//
// Pattern: TOP BAR (logo + hamburger) + BOTTOM BAR (profile + togglers)
// Drawer slides down from the top bar when hamburger is tapped.
// Mirrored at all viewport widths (desktop sees the same shell).
// ============================================================

// Shared top bar: logo on the left, hamburger on the right.
function NavTop({ w, drawerOpen = false }) {
    return (
        <div className="wf-shell-top" style={{ width: w }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconBtn size={32} label="F1" />
                <div>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>Frederikssund F1 Klub</div>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>SÆSON 2026</div>
                </div>
            </div>
            <IconBtn size={36} label={drawerOpen ? "✕" : "≡"} />
        </div>
    );
}

// One bottom-bar slot — circle button with a tiny label underneath.
function BBarItem({ label, icon, accent, onClick }) {
    return (
        <div className="wf-bbar-item" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
            <IconBtn size={32} round label={icon} accent={accent} />
            <div style={{
                fontFamily: "var(--sketch-font)", fontSize: 10,
                color: accent ? "var(--ink)" : "var(--ink-3)",
            }}>{label}</div>
        </div>
    );
}

// Shared bottom bar: profile/login + theme + language + font toggle.
function NavBottom({ w, loggedIn = true }) {
    return (
        <div className="wf-shell-bottom" style={{ width: w }}>
            {loggedIn ? (
                <div className="wf-bbar-item">
                    <Avatar size={28} letter="O" />
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11 }}>Ole H.</div>
                </div>
            ) : (
                <BBarItem label="Log ind" icon="→" accent />
            )}
            <BBarItem label="theme" icon="☀" />
            <BBarItem label="DA" icon="🌐" />
            <BBarItem
                label="font"
                icon="Aa"
                onClick={() => window.__toggleFont && window.__toggleFont()}
            />
        </div>
    );
}

// The slide-down drawer that opens from the top bar.
function NavDrawer({ w, isAdmin = false, isLoggedIn = true, active = "home" }) {
    const items = [
        { key: "home", label: "Hjem", icon: "⌂" },
        { key: "races", label: "Løb", icon: "▶" },
        { key: "leaderboard", label: "Rangliste", icon: "♔" },
    ];
    if (isLoggedIn) items.push({ key: "rules", label: "Regler", icon: "§" });
    if (isAdmin) items.push({ key: "admin", label: "Admin", icon: "⚙" });

    return (
        <div className="wf-drawer" style={{ width: w }}>
            {items.map(it => (
                <div key={it.key} className={"wf-drawer-row" + (it.key === active ? " active" : "")}>
                    <div className="wf-drawer-icon">{it.icon}</div>
                    <div className="wf-drawer-label">{it.label}</div>
                    {it.key === active && <div className="wf-drawer-rule" />}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// Self-contained nav explorations for the canvas
// ============================================================

// "Anatomy" — show the three pieces stacked with annotations.
function NavAnatomy() {
    return (
        <div style={{ width: 720, display: "flex", flexDirection: "column", gap: 24 }}>
            <Title size={28}>Nav anatomy · top hamburger + bottom toggler bar</Title>
            <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, maxWidth: "60ch" }}>
                Three pieces. Top bar holds <b>identity</b>. Bottom bar holds <b>you</b> (your profile + how you like the site). The drawer holds <b>where you're going</b>. Each lives in its own zone — they can't collide, can't wrap, and can't fight each other for space.
            </div>

            <div style={{ display: "flex", gap: 30, alignItems: "flex-start", marginTop: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, color: "var(--ink-2)" }}>1 · TOP BAR (always)</div>
                    <NavTop w={340} />
                    <Note style={{ marginTop: 4 }}>Logo + season tag · hamburger right-hand thumb reach</Note>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, color: "var(--ink-2)" }}>2 · DRAWER (on tap)</div>
                    <NavDrawer w={340} isAdmin={false} active="home" />
                    <Note style={{ marginTop: 4 }}>5 items max · admin only appears if user is admin</Note>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, color: "var(--ink-2)" }}>3 · BOTTOM BAR (always)</div>
                <NavBottom w={340} loggedIn={true} />
                <Note style={{ marginTop: 4 }}>Logged-in state · profile / theme / lang · stays visible during scroll</Note>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div style={{ display: "flex", gap: 30 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, color: "var(--ink-2)" }}>Bottom bar · logged out</div>
                    <NavBottom w={340} loggedIn={false} />
                    <Note style={{ marginTop: 4 }}>"Log ind" replaces avatar · same shape, same position</Note>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, color: "var(--ink-2)" }}>Drawer · admin user</div>
                    <NavDrawer w={340} isAdmin={true} active="admin" />
                    <Note style={{ marginTop: 4 }}>Admin row appears at the end only for admins</Note>
                </div>
            </div>
        </div>
    );
}

// "Pattern at 5 widths" — show the same shell at XS / SM / MD / LG / XL.
function NavScaling() {
    const widths = [
        { label: "XS · 360", w: 360 },
        { label: "SM · 480", w: 480 },
        { label: "MD · 768", w: 600 }, // truncated for visual fit
        { label: "LG · 1024", w: 700 },
        { label: "XL · 1440", w: 760 },
    ];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 820 }}>
            <Title size={26}>Same shell at every breakpoint</Title>
            <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, maxWidth: "60ch" }}>
                Per your brief: mirror the mobile pattern at all widths. The top/bottom bars only get wider — they never restructure. The DRAWER stays the same width (max 380) and just anchors right. No more "top nav breaks into 2 lines" because the nav was never inline in the first place.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                {widths.map(({ label, w }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <div style={{
                            fontFamily: "var(--sketch-font)", fontWeight: 700,
                            fontSize: 13, color: "var(--ink-2)", minWidth: 90,
                        }}>{label}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <NavTop w={w} />
                            <NavBottom w={w} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

Object.assign(window, {
    NavTop, NavBottom, NavDrawer, NavAnatomy, NavScaling,
});
