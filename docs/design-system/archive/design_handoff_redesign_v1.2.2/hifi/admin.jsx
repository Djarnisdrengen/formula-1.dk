/* global React */
// ============================================================
// ADMIN — tabs at MD+, dropdown at XS/SM (v1.0.1 pattern)
// ============================================================

const ADMIN_TABS = [
    { key: "races",    label: "Løb",          icon: "▶", count: 12 },
    { key: "members",  label: "Medlemmer",    icon: "♚", count: 18 },
    { key: "drivers",  label: "Kørere",       icon: "F", count: 20 },
    { key: "invites",  label: "Invitationer", icon: "✉", count: 3  },
    { key: "results",  label: "Resultater",   icon: "◔" },
    { key: "settings", label: "Indstillinger", icon: "⚙" },
];

function PageAdmin({ bp }) {
    const wide = bp.name === "MD" || bp.name === "LG" || bp.name === "XL";
    const big = bp.name === "LG" || bp.name === "XL";
    const active = "races";

    return (
        <HfFrame bp={bp} active="admin" drawerOpen={false} isAdmin={true}>
            <div style={{ overflowY: "auto", flex: 1 }}>
                <div className="hf-container">
                    <header className="hf-pageh">
                        <div className="crumb">Administrator · sæson 2026</div>
                        <h1>Admin</h1>
                    </header>

                    {wide ? (
                        /* Desktop: wrapping tabs */
                        <div style={{
                            display: "flex", flexWrap: "wrap", gap: 2,
                            borderBottom: "1px solid var(--border-soft)",
                            margin: "12px 0 24px",
                        }}>
                            {ADMIN_TABS.map(t => (
                                <button
                                    key={t.key}
                                    className={"hf-tabs-btn" + (t.key === active ? " active" : "")}
                                    style={{
                                        background: "none", border: "none",
                                        padding: "10px 14px",
                                        color: t.key === active ? "var(--f1-red)" : "var(--text-muted)",
                                        fontFamily: "var(--display)", fontWeight: 600, fontSize: 13,
                                        borderBottom: t.key === active ? "2px solid var(--f1-red)" : "2px solid transparent",
                                        marginBottom: -1,
                                        cursor: "pointer",
                                        display: "inline-flex", alignItems: "center", gap: 8,
                                        transition: "color 0.15s, border-color 0.15s",
                                    }}
                                >
                                    <span style={{ opacity: 0.7 }}>{t.icon}</span>
                                    {t.label}
                                    {t.count != null && (
                                        <span style={{
                                            background: t.key === active ? "var(--f1-red)" : "var(--bg-hover)",
                                            color: t.key === active ? "white" : "var(--text-muted)",
                                            padding: "1px 7px", borderRadius: 999,
                                            fontFamily: "ui-monospace, Menlo, monospace",
                                            fontSize: 11, fontWeight: 700,
                                        }}>{t.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Mobile: dropdown */
                        <div style={{ margin: "12px 0 20px" }}>
                            <button style={{
                                width: "100%",
                                padding: "12px 14px",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-color)",
                                borderRadius: 10,
                                color: "var(--text-primary)",
                                fontFamily: "var(--display)", fontWeight: 700, fontSize: 14,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                cursor: "pointer",
                            }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ color: "var(--f1-red)" }}>▶</span>
                                    Løb
                                    <span style={{
                                        background: "var(--f1-red)", color: "white",
                                        padding: "1px 7px", borderRadius: 999,
                                        fontFamily: "ui-monospace, Menlo, monospace",
                                        fontSize: 10, fontWeight: 700,
                                    }}>12</span>
                                </span>
                                <span style={{ color: "var(--text-muted)" }}>▾</span>
                            </button>
                        </div>
                    )}

                    {/* Action row */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                        <button className="hf-cta-primary" style={{ margin: 0, height: 42, fontSize: 14 }}>
                            + Nyt løb
                        </button>
                        {big && (
                            <div style={{
                                marginLeft: "auto",
                                display: "flex", alignItems: "center", gap: 8,
                                color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--display)",
                            }}>
                                <span>filtrer:</span>
                                <select style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    color: "var(--text-primary)",
                                    padding: "6px 10px", borderRadius: 7,
                                    fontFamily: "var(--display)", fontSize: 12,
                                }}>
                                    <option>Alle</option>
                                    <option>Kommende</option>
                                    <option>Afsluttede</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Race admin list — table-like at LG+, cards at smaller */}
                    {big ? (
                        <div style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-soft)",
                            borderRadius: 12,
                            overflow: "hidden",
                        }}>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "60px 1fr 140px 120px 120px auto",
                                gap: 16, padding: "12px 16px",
                                background: "var(--bg-secondary)",
                                color: "var(--text-muted)",
                                fontFamily: "var(--display)", fontWeight: 700,
                                fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                                borderBottom: "1px solid var(--border-soft)",
                            }}>
                                <div>#</div><div>Navn</div><div>Dato</div><div>Status</div><div>Bud</div><div></div>
                            </div>
                            {[
                                [13, "Monaco GP",         "26. maj 15:00",  "open", 8],
                                [14, "Spanien GP",        "2. jun 15:00",   "soon", 0],
                                [15, "Canada GP",         "16. jun 19:00",  "soon", 0],
                                [12, "Emilia-Romagna GP", "19. maj 15:00",  "done", 14],
                                [11, "Miami GP",          "5. maj 21:30",   "done", 14],
                            ].map(([n, name, date, status, bets]) => (
                                <div key={n} style={{
                                    display: "grid",
                                    gridTemplateColumns: "60px 1fr 140px 120px 120px auto",
                                    gap: 16, padding: "12px 16px",
                                    alignItems: "center",
                                    borderBottom: "1px solid var(--border-soft)",
                                    transition: "background 0.15s",
                                }}>
                                    <div className="hf-racenum" style={{ width: 32, height: 32, fontSize: 12 }}>{n}</div>
                                    <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>{name}</div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{date}</div>
                                    <div><span className={`hf-badge ${status}`}>{status === "open" ? "Åbent" : status === "soon" ? "Snart" : "Afsluttet"}</span></div>
                                    <div style={{ color: "var(--text-primary)", fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>
                                        {bets > 0 ? bets : "—"}
                                    </div>
                                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                                        <button style={{
                                            width: 32, height: 32, borderRadius: 7,
                                            background: "transparent", border: "1px solid var(--border-soft)",
                                            color: "var(--text-secondary)", cursor: "pointer", fontSize: 13,
                                        }}>✎</button>
                                        <button style={{
                                            width: 32, height: 32, borderRadius: 7,
                                            background: "transparent", border: "1px solid var(--border-soft)",
                                            color: "var(--text-secondary)", cursor: "pointer", fontSize: 13,
                                        }}>⋯</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                [13, "Monaco GP",         "26. maj · åbent for bud",     "open"],
                                [14, "Spanien GP",        "2. jun · snart",              "soon"],
                                [15, "Canada GP",         "16. jun · snart",             "soon"],
                                [12, "Emilia-Romagna GP", "19. maj · 14 bud · afsluttet", "done"],
                                [11, "Miami GP",          "5. maj · 14 bud · afsluttet",  "done"],
                            ].map(([n, name, sub, status]) => (
                                <div key={n} className="hf-racecard" style={{ gridTemplateColumns: "auto 1fr auto auto" }}>
                                    <div className="hf-racenum">{n}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="hf-racename">{name}</div>
                                        <div className="hf-racemeta">{sub}</div>
                                    </div>
                                    <div className={`hf-badge ${status}`}>{status === "open" ? "Åbent" : status === "soon" ? "Snart" : "Done"}</div>
                                    <button style={{
                                        width: 36, height: 36, borderRadius: 7,
                                        background: "transparent", border: "1px solid var(--border-soft)",
                                        color: "var(--text-secondary)", cursor: "pointer",
                                    }}>✎</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ height: 24 }} />
                    <HfFooter />
                </div>
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageAdmin });
