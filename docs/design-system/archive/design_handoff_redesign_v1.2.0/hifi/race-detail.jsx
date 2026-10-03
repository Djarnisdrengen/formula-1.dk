/* global React */
// ============================================================
// RACE DETAIL — single race + your bet + all bets (locked until start)
// ============================================================

function PageRaceDetail({ bp }) {
    const big = bp.name === "LG" || bp.name === "XL";
    const md = bp.name === "MD";

    return (
        <HfFrame bp={bp} active="races" drawerOpen={false}>
            <div style={{ overflowY: "auto", flex: 1 }}>
                {/* Hero — same pattern as Home, but tuned for a single race context */}
                <div className="hf-hero">
                    <div className="hf-container" style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <a href="#" style={{
                                color: "var(--text-muted)", fontFamily: "var(--display)",
                                fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
                                textTransform: "uppercase", textDecoration: "none",
                            }}>← Alle løb</a>
                        </div>
                        <div style={{
                            display: big ? "grid" : "block",
                            gridTemplateColumns: big ? "1fr 0.9fr" : undefined,
                            gap: big ? 56 : 0, alignItems: "center",
                        }}>
                            <div>
                                <div className="hf-hero-eyebrow">Åbent for bud · runde 13 af 24</div>
                                <h1 className="hf-hero-title">Monaco<br/>Grand Prix</h1>
                                <div className="hf-hero-meta">
                                    <span>Søndag 26. maj · 15:00</span>
                                    <span className="dot" />
                                    <span>Circuit de Monaco</span>
                                </div>
                                {!big && (
                                    <div className="hf-countdown">
                                        {[["02","DAG"],["14","TIM"],["37","MIN"],["12","SEK"]].map(([n,l]) => (
                                            <div className="hf-cd-cell" key={l}>
                                                <div className="hf-cd-num">{n}</div>
                                                <div className="hf-cd-label">{l}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className="hf-cta-primary">
                                    Læg dit bud <span className="arrow">→</span>
                                </button>
                            </div>
                            {big && (
                                <div className="hf-countdown" style={{ marginTop: 0 }}>
                                    {[["02","DAG"],["14","TIMER"],["37","MIN"],["12","SEK"]].map(([n,l]) => (
                                        <div className="hf-cd-cell" key={l}>
                                            <div className="hf-cd-num">{n}</div>
                                            <div className="hf-cd-label">{l}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="hf-container">
                    {/* Your bet — placed already, can still be edited */}
                    <section className="hf-section">
                        <div className="hf-section-h">
                            <h2>Dit bud</h2>
                            <a href="#">Redigér →</a>
                        </div>
                        <div style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-soft)",
                            borderRadius: 12,
                            padding: 16,
                            display: "grid",
                            gridTemplateColumns: big ? "repeat(3, 1fr)" : md ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
                            gap: 10,
                        }}>
                            {[
                                ["1.", "VER", "Max Verstappen", "1"],
                                ["2.", "NOR", "Lando Norris",   "2"],
                                ["3.", "LEC", "Charles Leclerc", "3"],
                            ].map(([pos, init, name, rank]) => (
                                <div key={pos} style={{
                                    display: "flex", flexDirection: "column", alignItems: "center",
                                    gap: 6, padding: 12, border: "1px solid var(--border-soft)",
                                    borderRadius: 10, background: "var(--bg-secondary)",
                                }}>
                                    <div className={`hf-rank r${rank}`} style={{
                                        width: 38, height: 38, borderRadius: 50, fontSize: 15,
                                    }}>{pos.replace(".","")}</div>
                                    <div className="hf-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>{init}</div>
                                    <div style={{
                                        fontFamily: "var(--display)", fontWeight: 700,
                                        fontSize: 12, color: "var(--text-primary)", textAlign: "center",
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                        maxWidth: "100%",
                                    }}>{name}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{
                            color: "var(--text-muted)", fontSize: 12, marginTop: 10,
                            fontFamily: "var(--display)", fontWeight: 500,
                        }}>
                            Lukker {bp.name === "XS" ? "1 min" : "ét minut"} før lights out · sidst gemt 14:32
                        </div>
                    </section>

                    {/* All bets — locked until start */}
                    <section className="hf-section">
                        <div className="hf-section-h">
                            <h2>Alle bud (8)</h2>
                            <span style={{
                                color: "var(--text-muted)", fontSize: 12,
                                fontFamily: "var(--display)", fontWeight: 600,
                            }}>🔒 Skjult indtil løbet starter</span>
                        </div>
                        {[
                            ["Ole H.", "O"], ["Bjarne K.", "B"], ["Per S.", "P"],
                            ["Lars N.", "L"], ["Henrik J.", "H"], ["Niels P.", "N"],
                        ].map(([name, init], i) => (
                            <div className="hf-row" key={name} style={{
                                gridTemplateColumns: "32px 1fr auto",
                                cursor: "default",
                            }}>
                                <div className="hf-avatar">{init}</div>
                                <div className="hf-who">
                                    <div className="hf-who-name">{name}</div>
                                    <div className="hf-who-sub">Bud låst {12 + i} maj · 21:0{i}</div>
                                </div>
                                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>🔒</div>
                            </div>
                        ))}
                    </section>
                    <div style={{ height: 24 }} />
                    <HfFooter />
                </div>
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageRaceDetail });
