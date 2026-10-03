/* global React */
// ============================================================
// BET MODAL — full-screen on XS/SM, centered card on MD+
// Driver picker sheet appears when a position row is tapped
// ============================================================

const PICKER_DRIVERS = [
    ["VER", "Max Verstappen",     "Red Bull",   "1"],
    ["NOR", "Lando Norris",       "McLaren",    "2"],
    ["LEC", "Charles Leclerc",    "Ferrari",    "3"],
    ["SAI", "Carlos Sainz",       "Ferrari",    "4"],
    ["PIA", "Oscar Piastri",      "McLaren",    "5"],
    ["RUS", "George Russell",     "Mercedes",   "6"],
];

function ModalShell({ bp, children }) {
    const full = bp.name === "XS" || bp.name === "SM";
    const w = bp.w;
    return (
        <div style={{
            position: "relative",
            width: w, height: "100%",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: full ? "stretch" : "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: 20,
            border: "1px solid var(--border-soft)",
        }}>
            {/* Background page (faked — solid bg + faint nav) */}
            <div style={{
                position: "absolute", inset: 0,
                background: "var(--bg-primary)",
                opacity: 0.25,
            }} />
            {children(full)}
        </div>
    );
}

function PageBetModal({ bp }) {
    const md = bp.name === "MD";
    const lg = bp.name === "LG" || bp.name === "XL";
    const big = md || lg;

    return (
        <div className={"hifi-frame " + bp.cls} style={{
            width: bp.w, height: "100%", minHeight: "100%",
            background: "var(--bg-primary)",
        }}>
            <ModalShell bp={bp}>
                {(full) => (
                    <div style={{
                        position: "relative",
                        background: "var(--bg-card)",
                        border: full ? "none" : "1px solid var(--border-color)",
                        borderRadius: full ? 0 : 16,
                        width: full ? "100%" : Math.min(560, bp.w - 64),
                        maxHeight: full ? "100%" : "calc(100% - 64px)",
                        display: "flex", flexDirection: "column",
                        boxShadow: full ? "none" : "0 24px 64px rgba(0,0,0,0.6)",
                        zIndex: 1,
                        animation: "hf-drop 220ms cubic-bezier(.2,.7,.3,1.1)",
                    }}>
                        {/* Header */}
                        <header style={{
                            padding: full ? "18px 18px 16px" : "20px 24px 16px",
                            borderBottom: "1px solid var(--border-soft)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 12,
                        }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{
                                    color: "var(--f1-red-light)",
                                    fontFamily: "var(--display)",
                                    fontWeight: 700, fontSize: 11,
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                    marginBottom: 4,
                                }}>Læg bud</div>
                                <h2 style={{
                                    fontFamily: "var(--display)", fontWeight: 800,
                                    fontSize: big ? 22 : 18, letterSpacing: "-0.01em",
                                }}>Monaco Grand Prix</h2>
                                <div style={{
                                    color: "var(--text-muted)", fontSize: 12, marginTop: 4,
                                }}>
                                    Søndag 26. maj · 15:00 · Lukker om 02d 14t 37m
                                </div>
                            </div>
                            <button className="hf-hamburger" style={{ width: 36, height: 36 }}>
                                <span style={{ fontSize: 18 }}>✕</span>
                            </button>
                        </header>

                        {/* Body — 3 position rows + picker sheet */}
                        <div style={{
                            padding: full ? "18px" : "24px",
                            display: "flex", flexDirection: "column", gap: 14,
                            overflowY: "auto",
                            flex: 1,
                        }}>
                            <div style={{
                                color: "var(--text-secondary)",
                                fontSize: 13, lineHeight: 1.55,
                                paddingBottom: 4,
                            }}>
                                Vælg dine top-3. Eksakt podium giver en stjerne.
                            </div>

                            {/* 1st (active — picker open below) */}
                            <div>
                                <label style={{
                                    fontFamily: "var(--display)", fontWeight: 700,
                                    fontSize: 11, color: "var(--f1-red-light)",
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    display: "block", marginBottom: 6,
                                }}>1. plads</label>
                                <button style={{
                                    width: "100%", height: 56, padding: "0 16px",
                                    background: "var(--bg-secondary)",
                                    border: "2px solid var(--f1-red)",
                                    borderRadius: 10,
                                    display: "flex", alignItems: "center", gap: 12,
                                    cursor: "pointer", color: "var(--text-primary)",
                                    boxShadow: "0 0 0 4px rgba(225,6,0,0.15)",
                                }}>
                                    <div className="hf-avatar" style={{ width: 36, height: 36 }}>VER</div>
                                    <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                                        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>Max Verstappen</div>
                                        <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>Red Bull · #1</div>
                                    </div>
                                    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>▼</span>
                                </button>
                            </div>

                            {/* Picker sheet — inline below active position */}
                            <div style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-soft)",
                                borderRadius: 10,
                                padding: 6,
                                display: "flex", flexDirection: "column", gap: 2,
                            }}>
                                {PICKER_DRIVERS.map(([init, name, team, num], i) => (
                                    <button key={init} style={{
                                        display: "flex", alignItems: "center", gap: 12,
                                        padding: "8px 10px",
                                        background: i === 0 ? "var(--bg-hover)" : "transparent",
                                        border: "none",
                                        borderRadius: 7,
                                        textAlign: "left", color: "var(--text-primary)",
                                        cursor: "pointer",
                                    }}>
                                        <div className="hf-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{init}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 13 }}>{name}</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{team} · #{num}</div>
                                        </div>
                                        {i === 0 && <span style={{ color: "var(--f1-red)", fontSize: 14 }}>✓</span>}
                                    </button>
                                ))}
                            </div>

                            {/* 2nd */}
                            <div>
                                <label style={{
                                    fontFamily: "var(--display)", fontWeight: 700,
                                    fontSize: 11, color: "var(--text-muted)",
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    display: "block", marginBottom: 6,
                                }}>2. plads</label>
                                <button style={{
                                    width: "100%", height: 56, padding: "0 16px",
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: 10,
                                    display: "flex", alignItems: "center", gap: 12,
                                    cursor: "pointer", color: "var(--text-primary)",
                                }}>
                                    <div className="hf-avatar" style={{ width: 36, height: 36 }}>NOR</div>
                                    <div style={{ textAlign: "left", flex: 1 }}>
                                        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>Lando Norris</div>
                                        <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>McLaren · #2</div>
                                    </div>
                                    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>▼</span>
                                </button>
                            </div>

                            {/* 3rd */}
                            <div>
                                <label style={{
                                    fontFamily: "var(--display)", fontWeight: 700,
                                    fontSize: 11, color: "var(--text-muted)",
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    display: "block", marginBottom: 6,
                                }}>3. plads</label>
                                <button style={{
                                    width: "100%", height: 56, padding: "0 16px",
                                    background: "var(--bg-secondary)",
                                    border: "1px dashed var(--border-color)",
                                    borderRadius: 10,
                                    display: "flex", alignItems: "center", gap: 12,
                                    cursor: "pointer", color: "var(--text-muted)",
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 50,
                                        border: "1px dashed var(--border-color)",
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 18,
                                    }}>＋</div>
                                    <div style={{ textAlign: "left", flex: 1 }}>
                                        <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 14 }}>Vælg kører</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <footer style={{
                            padding: full ? "14px 18px 18px" : "18px 24px",
                            borderTop: "1px solid var(--border-soft)",
                            display: "flex", gap: 10,
                            background: "var(--bg-card)",
                        }}>
                            <button style={{
                                flex: 1, height: 46, borderRadius: 10,
                                background: "transparent",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                                fontFamily: "var(--display)", fontWeight: 600, fontSize: 14,
                                cursor: "pointer",
                            }}>Annuller</button>
                            <button className="hf-cta-primary" style={{
                                flex: 2, height: 46, margin: 0,
                            }}>
                                Læg bud <span className="arrow">→</span>
                            </button>
                        </footer>
                    </div>
                )}
            </ModalShell>
        </div>
    );
}

Object.assign(window, { PageBetModal });
