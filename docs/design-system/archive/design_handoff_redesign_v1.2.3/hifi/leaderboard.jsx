/* global React */
// ============================================================
// LEADERBOARD page — self-row pinned, segmented filter, full standings
// ============================================================

const STANDINGS = [
    ["Ole H.",     "★3", 142, 14, "siden 2019"],
    ["Bjarne K.",  "★1", 128, 14, "klubveteran"],
    ["Per S.",     "—",  119, 13, "siden 2021"],
    ["Lars N.",    "—",  108, 14, "siden 2018"],
    ["Henrik J.",  "—",  101, 12, "siden 2022"],
    ["Niels P.",   "—",   97, 13, "siden 2023"],
    ["Dig",        "★1",  94, 12, "siden 2024"],
    ["Søren M.",   "—",   88, 11, "siden 2020"],
    ["Mikael H.",  "—",   82, 10, "ny i år"],
    ["Tom W.",     "—",   76, 11, "siden 2022"],
];

function StatsTop3() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
            {STANDINGS.slice(0, 3).map(([name, stars, pts], i) => (
                <div className="hf-stat" key={name} style={{
                    alignItems: "center",
                    textAlign: "center",
                    background: i === 0
                        ? "linear-gradient(135deg, rgba(251,191,36,0.18), var(--bg-card) 60%)"
                        : i === 1 ? "linear-gradient(135deg, rgba(156,163,175,0.14), var(--bg-card) 60%)"
                        : "linear-gradient(135deg, rgba(205,124,47,0.14), var(--bg-card) 60%)",
                    borderColor: i === 0 ? "rgba(251,191,36,0.4)" : i === 1 ? "rgba(156,163,175,0.3)" : "rgba(205,124,47,0.3)",
                }}>
                    <div className={`hf-rank r${i+1}`} style={{ width: 40, height: 40, marginBottom: 8, fontSize: 16 }}>{i+1}</div>
                    <div className="hf-stat-n" style={{ fontSize: 36 }}>{pts}p</div>
                    <div style={{
                        fontFamily: "var(--display)", fontWeight: 700, fontSize: 14,
                        color: "var(--text-primary)", marginTop: 6,
                    }}>{name}</div>
                    <div style={{ color: "var(--gold)", fontFamily: "var(--display)", fontSize: 12, fontWeight: 700, marginTop: 2 }}>
                        {stars}
                    </div>
                </div>
            ))}
        </div>
    );
}

function StandingsList({ pinSelf = true, count = 10 }) {
    const rows = STANDINGS.slice(0, count);
    return (
        <>
            {rows.map(([name, stars, pts, bets, sub], i) => {
                const rank = i + 1;
                const isSelf = name === "Dig";
                const rankCls = rank <= 3 ? `hf-rank r${rank}` : "hf-rank";
                return (
                    <div className={"hf-row" + (isSelf ? " self" : "")} key={name}>
                        <div className={rankCls}>{rank}</div>
                        <div className="hf-avatar">{name[0]}</div>
                        <div className="hf-who">
                            <div className="hf-who-name">{name}</div>
                            <div className="hf-who-sub">{bets} bud · {sub}</div>
                        </div>
                        <div className="hf-stars">{stars !== "—" ? stars : ""}</div>
                        <div className="hf-pts">{pts}p</div>
                    </div>
                );
            })}
        </>
    );
}

function PageLeaderboard({ bp }) {
    const lg = bp.name === "LG" || bp.name === "XL";
    const md = bp.name === "MD";
    const wide = lg || md;

    return (
        <HfFrame bp={bp} active="leaderboard" drawerOpen={false}>
            <div style={{ overflowY: "auto", flex: 1 }}>
                <div className="hf-container">
                    <header className="hf-pageh">
                        <div className="crumb">Sæson 2026 · runde 12 af 24</div>
                        <h1>Rangliste</h1>
                        <p className="lede">Stjerner bryder tie-breaks. Halvvejs gennem sæsonen — der er stadig 12 runder tilbage.</p>
                    </header>

                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "8px 0 16px" }}>
                        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--display)" }}>
                            Opdateret 19. maj · 21:14
                        </div>
                    </div>

                    {wide && <StatsTop3 />}

                    {lg ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1.6fr",
                            gap: 32,
                            paddingTop: 24,
                            paddingBottom: 32,
                            alignItems: "start",
                        }}>
                            <aside>
                                <div className="hf-stat" style={{
                                    background: "linear-gradient(135deg, rgba(225,6,0,0.18), var(--bg-card) 60%)",
                                    borderColor: "rgba(225,6,0,0.45)",
                                    padding: 22,
                                }}>
                                    <div style={{
                                        fontFamily: "var(--display)", fontWeight: 700,
                                        fontSize: 11, letterSpacing: "0.12em",
                                        textTransform: "uppercase", color: "var(--f1-red-light)",
                                    }}>Din position</div>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                                        <div className="hf-stat-n" style={{ fontSize: 64 }}>7</div>
                                        <div style={{ color: "var(--text-muted)", fontFamily: "var(--display)", fontSize: 16 }}>/ 18</div>
                                    </div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 8 }}>
                                        ↑ 2 pladser siden sidste runde
                                    </div>
                                    <div style={{
                                        marginTop: 16, paddingTop: 16,
                                        borderTop: "1px solid rgba(255,255,255,0.08)",
                                        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
                                    }}>
                                        <div>
                                            <div className="hf-stat-l" style={{ marginBottom: 2 }}>POINT</div>
                                            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20 }}>94</div>
                                        </div>
                                        <div>
                                            <div className="hf-stat-l" style={{ marginBottom: 2 }}>STJERNER</div>
                                            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: "var(--gold)" }}>★1</div>
                                        </div>
                                        <div>
                                            <div className="hf-stat-l" style={{ marginBottom: 2 }}>BUD</div>
                                            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20 }}>12</div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                            <div>
                                <StandingsList count={10} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ paddingTop: 16, paddingBottom: 32 }}>
                            {!wide && (
                                <div className="hf-row self" style={{ marginBottom: 16 }}>
                                    <div className="hf-rank">7</div>
                                    <div className="hf-avatar">D</div>
                                    <div className="hf-who">
                                        <div className="hf-who-name">Dig</div>
                                        <div className="hf-who-sub">↑ 2 pladser · 12 bud i sæsonen</div>
                                    </div>
                                    <div className="hf-stars">★ 1</div>
                                    <div className="hf-pts">94p</div>
                                </div>
                            )}
                            <StandingsList count={10} />
                        </div>
                    )}
                    <HfFooter />
                </div>
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageLeaderboard });
