/* global React */
// ============================================================
// PROFILE page — me + my stats + my bets/history
// ============================================================

const MY_BETS = [
    { race: "Emilia-Romagna GP", date: "19. maj", pred: "Verstappen · Norris · Leclerc", stars: 1, pts: 25 },
    { race: "Miami GP",         date: "5. maj",  pred: "Verstappen · Sainz · Norris",   stars: 0, pts: 10 },
    { race: "Kina GP",          date: "21. apr", pred: "Verstappen · Pérez · Norris",   stars: 0, pts: 15 },
    { race: "Australien GP",    date: "24. mar", pred: "Sainz · Pérez · Norris",        stars: 0, pts: 0  },
    { race: "Saudi-Arabien GP", date: "9. mar",  pred: "Verstappen · Pérez · Leclerc",  stars: 0, pts: 25 },
    { race: "Bahrain GP",       date: "2. mar",  pred: "Verstappen · Pérez · Sainz",    stars: 0, pts: 15 },
];

function ProfileHead({ name = "Ole Hansen", initial = "O", sub = "Medlem siden 2019" }) {
    return (
        <div className="hf-profile-head">
            <div className="hf-profile-avatar">{initial}</div>
            <div className="hf-profile-id">
                <div className="hf-profile-name">{name}</div>
                <div className="hf-profile-sub">{sub} · <span className="star">★3 i sæsonen</span></div>
            </div>
        </div>
    );
}

function StatsRow({ wide = false }) {
    const stats = [
        ["14", "BUD"],
        ["9", "TOP-3"],
        ["3", "STJERNER"],
        ["142p", "POINT"],
    ];
    const cols = wide ? "repeat(4, 1fr)" : "repeat(3, 1fr)";
    const visible = wide ? stats : stats.slice(0, 3);
    return (
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12 }}>
            {visible.map(([n, l]) => (
                <div className="hf-stat" key={l}>
                    <div className="hf-stat-n">{n}</div>
                    <div className="hf-stat-l">{l}</div>
                </div>
            ))}
        </div>
    );
}

function BetRow({ b, compact = false }) {
    return (
        <div className="hf-racecard" style={{
            gridTemplateColumns: compact ? "auto 1fr auto" : "auto 1fr auto auto",
            alignItems: "flex-start",
        }}>
            <div className="hf-racenum">{b.date.split(".")[0].trim()}</div>
            <div style={{ minWidth: 0 }}>
                <div className="hf-racename">{b.race}</div>
                <div className="hf-racemeta" style={{
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontSize: 11,
                    marginTop: 4,
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>{b.pred}</div>
            </div>
            {b.stars > 0 && !compact && (
                <div className="hf-stars" style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(251,191,36,0.12)",
                    border: "1px solid rgba(251,191,36,0.35)",
                }}>★ {b.stars}</div>
            )}
            <div className="hf-pts" style={{
                color: b.pts === 0 ? "var(--text-muted)" : "var(--text-primary)",
                minWidth: 40,
            }}>{b.pts}p</div>
        </div>
    );
}

function AccountCard() {
    // Read-only display of editable fields. Buttons reveal that the
    // "Rediger profil" action covers display-name + language; password
    // sits in its own action since it's a security operation.
    return (
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: 12,
            padding: 16,
            display: "flex", flexDirection: "column", gap: 12,
        }}>
            <div style={{
                fontFamily: "var(--display)", fontWeight: 700,
                fontSize: 11, color: "var(--text-muted)",
                letterSpacing: "0.12em", textTransform: "uppercase",
            }}>Konto</div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 16px", alignItems: "baseline" }}>
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--display)", fontWeight: 600 }}>Visningsnavn</div>
                <div style={{ color: "var(--text-primary)", fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>Ole Hansen</div>

                <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--display)", fontWeight: 600 }}>Sprog</div>
                <div style={{ color: "var(--text-primary)", fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <Flag code="da" size={14} />
                    Dansk
                </div>

                <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--display)", fontWeight: 600 }}>Adgangskode</div>
                <div style={{
                    color: "var(--text-muted)",
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontSize: 13, letterSpacing: "0.15em",
                }}>••••••••</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
                <button style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontFamily: "var(--display)",
                    fontWeight: 600, fontSize: 13,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <span>Rediger profil</span>
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                </button>
                <button style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    borderRadius: 10,
                    color: "var(--text-primary)",
                    fontFamily: "var(--display)",
                    fontWeight: 600, fontSize: 13,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <span>Skift adgangskode</span>
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                </button>
            </div>
        </div>
    );
}

function PageProfile({ bp }) {
    const lg = bp.name === "LG" || bp.name === "XL";
    const md = bp.name === "MD";

    return (
        <HfFrame bp={bp} active="profile" drawerOpen={false}>
            <div style={{ overflowY: "auto", flex: 1 }}>
                <div className="hf-container">
                    {lg ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "320px 1fr",
                            gap: 48,
                            paddingBottom: 32,
                            alignItems: "start",
                        }}>
                            <aside style={{ position: "sticky", top: 72 }}>
                                <ProfileHead />
                                <div style={{ height: 16 }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div className="hf-stat"><div className="hf-stat-n">14</div><div className="hf-stat-l">BUD</div></div>
                                    <div className="hf-stat"><div className="hf-stat-n">9</div><div className="hf-stat-l">TOP-3</div></div>
                                    <div className="hf-stat" style={{
                                        background: "linear-gradient(135deg, rgba(251,191,36,0.18), var(--bg-card) 60%)",
                                        borderColor: "rgba(251,191,36,0.4)",
                                    }}>
                                        <div className="hf-stat-n" style={{ color: "var(--gold)" }}>★3</div>
                                        <div className="hf-stat-l">STJERNER</div>
                                    </div>
                                    <div className="hf-stat"><div className="hf-stat-n">142p</div><div className="hf-stat-l">POINT</div></div>
                                </div>
                                <div style={{ height: 16 }} />
                                <AccountCard />
                            </aside>
                            <main>
                                <header className="hf-pageh" style={{ paddingTop: 28 }}>
                                    <div className="crumb">Min historik · sæson 2026</div>
                                    <h1 style={{ fontSize: 36 }}>Dine bud</h1>
                                </header>
                                <div className="hf-tabs">
                                    <button className="active">Alle ({MY_BETS.length})</button>
                                    <button>Med stjerne (1)</button>
                                    <button>Top-3 (5)</button>
                                </div>
                                <div>
                                    {MY_BETS.map(b => <BetRow key={b.race} b={b} />)}
                                </div>
                            </main>
                        </div>
                    ) : (
                        <>
                            <ProfileHead />
                            <div style={{ paddingBottom: 16 }}>
                                <StatsRow wide={md} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <AccountCard />
                            </div>

                            <section className="hf-section">
                                <div className="hf-section-h">
                                    <h2>Dine bud</h2>
                                    <a href="#">{MY_BETS.length} i alt</a>
                                </div>
                                <div className="hf-tabs">
                                    <button className="active">Alle</button>
                                    <button>Med stjerne</button>
                                    <button>Top-3</button>
                                </div>
                                {MY_BETS.slice(0, md ? 6 : 4).map(b => <BetRow key={b.race} b={b} compact={!md} />)}
                            </section>
                            <div style={{ height: 24 }} />
                        </>
                    )}
                    <HfFooter />
                </div>
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageProfile });
