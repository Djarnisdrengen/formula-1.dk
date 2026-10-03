/* global React */
// ============================================================
// LOGIN — auth landing
// ============================================================

function PageLogin({ bp }) {
    const big = bp.name === "LG" || bp.name === "XL";
    const md = bp.name === "MD";

    const card = (
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: 16,
            padding: "32px 28px 28px",
            display: "flex", flexDirection: "column", gap: 16,
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
            <header style={{ marginBottom: 4 }}>
                <div className="hf-hero-eyebrow" style={{ marginBottom: 12 }}>Velkommen tilbage</div>
                <h1 style={{
                    fontFamily: "var(--display)", fontWeight: 900,
                    fontSize: big ? 36 : 26, letterSpacing: "-0.02em", lineHeight: 1.05,
                }}>Log ind</h1>
                <p style={{
                    color: "var(--text-secondary)",
                    fontSize: 14, lineHeight: 1.5, marginTop: 8, maxWidth: "40ch",
                }}>
                    Klubmedlem? Log ind og læg dit bud før Monaco starter på søndag.
                </p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
                <div>
                    <label style={{
                        fontFamily: "var(--display)", fontWeight: 600,
                        fontSize: 11, color: "var(--text-muted)",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        display: "block", marginBottom: 6,
                    }}>Email</label>
                    <div style={{
                        width: "100%", height: 48, padding: "0 14px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: 10,
                        display: "flex", alignItems: "center",
                        color: "var(--text-primary)",
                        fontFamily: "var(--body)", fontSize: 14,
                    }}>ole@klubben.dk</div>
                </div>

                <div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                        <label style={{
                            fontFamily: "var(--display)", fontWeight: 600,
                            fontSize: 11, color: "var(--text-muted)",
                            letterSpacing: "0.1em", textTransform: "uppercase",
                        }}>Adgangskode</label>
                        <a href="#" style={{
                            fontFamily: "var(--display)", fontWeight: 600,
                            fontSize: 12, color: "var(--f1-red-light)", textDecoration: "none",
                        }}>Glemt?</a>
                    </div>
                    <div style={{
                        width: "100%", height: 48, padding: "0 14px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--f1-red)",
                        borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        color: "var(--text-primary)",
                        fontFamily: "var(--mono)", fontSize: 14, letterSpacing: "0.2em",
                        boxShadow: "0 0 0 4px rgba(225,6,0,0.12)",
                    }}>
                        <span>•••••••••</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--display)" }}>vis</span>
                    </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>
                    <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: "1.5px solid var(--f1-red)",
                        background: "var(--f1-red)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: 12,
                    }}>✓</span>
                    Husk mig på denne enhed
                </label>

                <button className="hf-cta-primary" style={{ width: "100%", margin: "8px 0 0", height: 50 }}>
                    Log ind <span className="arrow">→</span>
                </button>
            </div>
            <div style={{ borderTop: "1px solid var(--border-soft)", marginTop: 18, paddingTop: 14, textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--display)", fontSize: 11 }}>
                <span style={{ fontFamily: "var(--mono)", padding: "1px 6px", borderRadius: 3, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>v1.2.3</span>
            </div>
        </div>
    );

    return (
        <HfFrame bp={bp} active="home" drawerOpen={false} isLoggedIn={false}>
            <div style={{ overflowY: "auto", flex: 1, display: "flex", alignItems: big ? "center" : "stretch" }}>
                <div className="hf-container" style={{
                    paddingTop: big ? 0 : 32, paddingBottom: big ? 0 : 32,
                    width: "100%",
                }}>
                    {big ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1.1fr 1fr",
                            gap: 64, alignItems: "center",
                            minHeight: "calc(100% - 64px)",
                        }}>
                            {/* Editorial intro */}
                            <div>
                                <div className="hf-hero-eyebrow" style={{ marginBottom: 18 }}>Sæson 2026 · 12 af 24 runder</div>
                                <h1 style={{
                                    fontFamily: "var(--display)", fontWeight: 900,
                                    fontSize: bp.name === "XL" ? 80 : 64,
                                    letterSpacing: "-0.02em", lineHeight: 0.95,
                                }}>
                                    Søndag<br/>igen, drenge.
                                </h1>
                                <p style={{
                                    color: "var(--text-secondary)",
                                    fontSize: 17, lineHeight: 1.55, marginTop: 18, maxWidth: "44ch",
                                }}>
                                    Ét bud per medlem, point for top-3, en stjerne hvis du rammer plet. Kaffen er sat over.
                                </p>
                                <div style={{ marginTop: 28, display: "flex", gap: 28, flexWrap: "wrap" }}>
                                    {[
                                        ["18", "MEDLEMMER"],
                                        ["1.240 kr", "I PULJEN"],
                                        ["★ 12", "STJERNER UDDELT"],
                                    ].map(([n, l]) => (
                                        <div key={l}>
                                            <div style={{
                                                fontFamily: "var(--display)", fontWeight: 900,
                                                fontSize: 32, lineHeight: 1, letterSpacing: "-0.01em",
                                            }}>{n}</div>
                                            <div style={{
                                                fontFamily: "var(--display)", fontWeight: 600,
                                                fontSize: 11, color: "var(--text-muted)",
                                                letterSpacing: "0.12em", marginTop: 6,
                                            }}>{l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ maxWidth: 440, justifySelf: "end", width: "100%" }}>{card}</div>
                        </div>
                    ) : (
                        <div style={{ maxWidth: md ? 460 : "100%", margin: "0 auto", paddingTop: 24 }}>
                            {card}
                        </div>
                    )}
                </div>
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageLogin });
