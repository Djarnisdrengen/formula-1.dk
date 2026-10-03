/* global React */
// ============================================================
// Hi-fi shell — Top bar, Bottom bar, Drawer
// Used by every page artboard; the artboard sets its own
// .hf-frame-{xs|sm|md|lg|xl} class for breakpoint-specific tweaks.
// ============================================================

// Breakpoint-name helper for declarative use in page components.
const BP = {
    XS: { name: "XS", w: 380,  cls: "hf-frame-xs" },
    SM: { name: "SM", w: 600,  cls: "hf-frame-sm" },
    MD: { name: "MD", w: 880,  cls: "hf-frame-md" },
    LG: { name: "LG", w: 1200, cls: "hf-frame-lg" },
    XL: { name: "XL", w: 1480, cls: "hf-frame-xl" },
};

// Tiny inline flag SVGs — readable at 16-22px, scale to any size.
// Wave-tilt and shadow purposefully omitted; we want crisp at small sizes.
function Flag({ code, size = 20, style }) {
    const aspect = 4 / 3; // 4:3 looks balanced as a UI chip at small sizes
    const w = size * aspect;
    const common = { width: w, height: size, viewBox: "0 0 60 45", style: { borderRadius: 2, display: "block", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)", ...style } };
    if (code === "da") {
        // Dannebrog — red field, white cross offset left (Nordic style).
        return (
            <svg {...common}>
                <rect width="60" height="45" fill="#C60C30" />
                <rect x="0" y="19" width="60" height="7" fill="#fff" />
                <rect x="19" y="0" width="7" height="45" fill="#fff" />
            </svg>
        );
    }
    // Union Jack — simplified (centred saltire). Recognizable as British
    // without modelling the proper off-centre counter-changed diagonals.
    return (
        <svg {...common}>
            <defs>
                <clipPath id="uk-clip"><rect width="60" height="45" /></clipPath>
            </defs>
            <g clipPath="url(#uk-clip)">
                <rect width="60" height="45" fill="#012169" />
                {/* saltire: white then red overlay */}
                <path d="M0,0 L60,45 M60,0 L0,45" stroke="#fff" strokeWidth="9" />
                <path d="M0,0 L60,45 M60,0 L0,45" stroke="#C8102E" strokeWidth="4" />
                {/* cross of St George: white then red overlay */}
                <path d="M30,0 v45 M0,22.5 h60" stroke="#fff" strokeWidth="13" />
                <path d="M30,0 v45 M0,22.5 h60" stroke="#C8102E" strokeWidth="7" />
            </g>
        </svg>
    );
}

function HfTop({ drawerOpen, onToggleDrawer, compact = false }) {
    return (
        <div className="hf-top">
            <a className="hf-logo" href="#">
                <span className="hf-logo-mark">F1</span>
                {!compact && (
                    <span className="hf-logo-text">
                        Frederikssund F1 Klub
                        <span className="yr">2026</span>
                    </span>
                )}
                {compact && (
                    <span className="hf-logo-text">F1 Klub <span className="yr">2026</span></span>
                )}
            </a>
            <button className="hf-hamburger" onClick={onToggleDrawer} aria-label="Menu">
                {drawerOpen ? (
                    <span style={{ fontSize: 18, lineHeight: 1 }}>✕</span>
                ) : (
                    <span className="bars">
                        <span /><span /><span />
                    </span>
                )}
            </button>
        </div>
    );
}

function HfDrawer({ active = "home", isAdmin = false, isLoggedIn = true, onLinkClick }) {
    const items = [
        { key: "home", label: "Hjem", icon: "⌂" },
        { key: "races", label: "Løb", icon: "▶" },
        { key: "leaderboard", label: "Rangliste", icon: "♔" },
    ];
    if (isLoggedIn) items.push({ key: "rules", label: "Regler", icon: "§" });
    if (isAdmin) items.push({ key: "admin", label: "Admin", icon: "⚙" });

    return (
        <div className="hf-drawer">
            {items.map(it => (
                <a
                    key={it.key}
                    href="#"
                    className={"hf-drawer-row" + (it.key === active ? " active" : "")}
                    onClick={(e) => { e.preventDefault(); onLinkClick && onLinkClick(it.key); }}
                >
                    <i>{it.icon}</i>
                    <span>{it.label}</span>
                </a>
            ))}
        </div>
    );
}

// Page footer — versioned, sits at the bottom of every page's content,
// above the sticky bottom bar. Use inside the scroll container.
function HfFooter() {
    return (
        <footer className="hf-footer">
            <div className="hf-container">
                <span className="name">Frederikssund F1 Klub</span>
                <span className="v">v1.2.0</span>
                <span>· Sæson 2026</span>
            </div>
        </footer>
    );
}

function HfBottom({ loggedIn = true, current = "profile" }) {
    return (
        <nav className="hf-bottom">
            {loggedIn ? (
                <button className={"hf-bb-item" + (current === "profile" ? " active" : "")}>
                    <div className="hf-bb-avatar">O</div>
                    <span>OLE</span>
                </button>
            ) : (
                <button className="hf-bb-item">
                    <div className="hf-bb-icon" style={{ color: "var(--f1-red)" }}>→</div>
                    <span>LOG IND</span>
                </button>
            )}
            <button className="hf-bb-item" title="Theme">
                <div className="hf-bb-icon">☀</div>
                <span>THEME</span>
            </button>
            <button className="hf-bb-item" title="Language">
                <div className="hf-bb-icon" style={{ overflow: "hidden" }}>
                    <Flag code="da" size={18} />
                </div>
                <span>DANSK</span>
            </button>
            <button className="hf-bb-item" title="Font">
                <div className="hf-bb-icon" style={{ fontFamily: "var(--display)" }}>Aa</div>
                <span>FONT</span>
            </button>
        </nav>
    );
}

// The HfFrame wraps page content with the correct breakpoint class
// + shell at the artboard's logical width. `active` selects the drawer item.
function HfFrame({ bp, active, drawerOpen = false, isAdmin = false, isLoggedIn = true, current, children }) {
    return (
        <div
            className={"hifi-frame " + bp.cls}
            style={{ width: bp.w, height: "100%", minHeight: "100%" }}
        >
            <HfTop drawerOpen={drawerOpen} compact={bp.name === "XS"} />
            {drawerOpen && <HfDrawer active={active} isAdmin={isAdmin} isLoggedIn={isLoggedIn} />}
            <div className="hf-body">{children}</div>
            <HfBottom loggedIn={isLoggedIn} current={current || active} />
        </div>
    );
}

Object.assign(window, { BP, HfTop, HfBottom, HfDrawer, HfFrame, HfFooter, Flag });
