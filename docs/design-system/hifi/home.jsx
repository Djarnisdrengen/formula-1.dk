/* global React */
// ============================================================
// HOME page — 5 layout variants by breakpoint
// ============================================================

function HomeHero({ bp }) {
    const big = bp.name === "LG" || bp.name === "XL";
    return (
        <div className="hf-hero">
            <div className="hf-container" style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                    display: big ? "grid" : "block",
                    gridTemplateColumns: big ? "1fr 0.9fr" : undefined,
                    gap: big ? 56 : 0,
                    alignItems: "center",
                }}>
                    <div>
                        <div className="hf-hero-eyebrow">{bp.name === "XS" ? "Næste løb · R12" : "Næste løb · runde 12 af 24"}</div>
                        <h1 className="hf-hero-title">Monaco<br/>Grand Prix</h1>
                        <div className="hf-hero-meta">
                            <span>Søndag 26. maj · 15:00</span>
                            <span className="dot" />
                            <span>Circuit de Monaco</span>
                            <span className="dot" />
                            <span>8 medlemmer har lagt bud</span>
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
    );
}

function LeaderboardPreview({ count = 3 }) {
    const rows = [
        ["1", "Ole H.", "14 bud · medlem siden 2019", 3, 142],
        ["2", "Bjarne K.", "14 bud · klubveteran", 1, 128],
        ["3", "Per S.", "13 bud", 0, 119],
        ["4", "Lars N.", "14 bud", 0, 108],
        ["5", "Henrik J.", "12 bud", 0, 101],
    ].slice(0, count);
    return (
        <>
            {rows.map(([rank, name, sub, stars, pts], i) => (
                <div className={"hf-row" + (i === 0 ? " self" : "")} key={rank}>
                    <div className={`hf-rank r${rank}`}>{rank}</div>
                    <div className="hf-avatar">{name[0]}</div>
                    <div className="hf-who">
                        <div className="hf-who-name">{name}</div>
                        <div className="hf-who-sub">{sub}</div>
                    </div>
                    <div className="hf-stars">{stars > 0 ? `★ ${stars}` : ""}</div>
                    <div className="hf-pts">{pts}p</div>
                </div>
            ))}
        </>
    );
}

function RecentResults() {
    const races = [
        ["Emilia-Romagna GP", "19. maj · Imola"],
        ["Miami GP", "5. maj · Miami Intl. Autodrome"],
        ["Kina GP", "21. apr · Shanghai"],
    ];
    return (
        <>
            {races.map(([name, meta], i) => (
                <div className="hf-racecard" key={name}>
                    <div className="hf-racenum">{11 - i}</div>
                    <div>
                        <div className="hf-racename">{name}</div>
                        <div className="hf-racemeta">{meta}</div>
                    </div>
                    <div className="hf-badge done">Afsluttet</div>
                </div>
            ))}
        </>
    );
}

function StatsStrip() {
    const stats = [
        ["12", "RUNDER GÅET"],
        ["12", "RUNDER TILBAGE"],
        ["1.240 kr", "PULJEN"],
    ];
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "20px 0" }}>
            {stats.map(([n, l]) => (
                <div className="hf-stat" key={l}>
                    <div className="hf-stat-n">{n}</div>
                    <div className="hf-stat-l">{l}</div>
                </div>
            ))}
        </div>
    );
}

function PageHome({ bp }) {
    const wide = bp.name === "MD" || bp.name === "LG" || bp.name === "XL";
    const lg = bp.name === "LG" || bp.name === "XL";

    return (
        <HfFrame bp={bp} active="home" drawerOpen={false}>
            <div style={{ overflowY: "auto", flex: 1 }}>
                <HomeHero bp={bp} />

                <div className="hf-container">
                    {lg && <StatsStrip />}

                    {wide ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: lg ? "1fr 1fr" : "1fr",
                            gap: 32,
                            paddingBottom: 24,
                        }}>
                            <section className="hf-section">
                                <div className="hf-section-h">
                                    <h2>Rangliste · top 5</h2>
                                    <a href="#">se hele →</a>
                                </div>
                                <LeaderboardPreview count={5} />
                            </section>
                            <section className="hf-section">
                                <div className="hf-section-h">
                                    <h2>Seneste resultater</h2>
                                    <a href="#">se alle →</a>
                                </div>
                                <RecentResults />
                            </section>
                        </div>
                    ) : (
                        <>
                            <section className="hf-section">
                                <div className="hf-section-h">
                                    <h2>Rangliste · top 3</h2>
                                    <a href="#">se hele →</a>
                                </div>
                                <LeaderboardPreview count={3} />
                            </section>
                            <section className="hf-section">
                                <div className="hf-section-h">
                                    <h2>Seneste resultater</h2>
                                    <a href="#">se alle →</a>
                                </div>
                                <RecentResults />
                            </section>
                        </>
                    )}
                    <div style={{ height: 24 }} />
                </div>
                <HfFooter />
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageHome });
