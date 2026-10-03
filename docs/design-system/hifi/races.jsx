/* global React */
// ============================================================
// RACES list — all races in season, filterable
// ============================================================

const SEASON_RACES = [
    { n: 13, name: "Monaco GP",         date: "26. maj",  loc: "Circuit de Monaco",     status: "open",  bets: 8  },
    { n: 14, name: "Spanien GP",        date: "2. jun",   loc: "Circuit de Barcelona",  status: "soon",  bets: 0  },
    { n: 15, name: "Canada GP",         date: "16. jun",  loc: "Circuit Gilles-Villeneuve", status: "soon", bets: 0 },
    { n: 16, name: "Østrig GP",         date: "30. jun",  loc: "Red Bull Ring",         status: "soon",  bets: 0  },
    { n: 17, name: "Storbritannien GP", date: "7. jul",   loc: "Silverstone",           status: "soon",  bets: 0  },
    { n: 12, name: "Emilia-Romagna GP", date: "19. maj",  loc: "Imola",                 status: "done",  bets: 14, podium: "Norris · Verstappen · Leclerc" },
    { n: 11, name: "Miami GP",          date: "5. maj",   loc: "Miami Intl. Autodrome", status: "done",  bets: 14, podium: "Verstappen · Sainz · Norris" },
    { n: 10, name: "Kina GP",           date: "21. apr",  loc: "Shanghai",              status: "done",  bets: 13, podium: "Verstappen · Pérez · Norris" },
    { n: 9,  name: "Japan GP",          date: "7. apr",   loc: "Suzuka",                status: "done",  bets: 14, podium: "Verstappen · Norris · Pérez" },
];

const STATUS_LABEL = { open: "Åbent", soon: "Snart", done: "Afsluttet", live: "LIVE" };

function RaceCard({ r, wide = false }) {
    return (
        <div className="hf-racecard" style={{
            gridTemplateColumns: wide ? "auto 1fr auto auto" : "auto 1fr auto",
            alignItems: "center",
            opacity: r.status === "done" ? 0.85 : 1,
        }}>
            <div className="hf-racenum">{r.n}</div>
            <div style={{ minWidth: 0 }}>
                <div className="hf-racename">{r.name}</div>
                <div className="hf-racemeta">{r.date} · {r.loc}</div>
                {wide && r.podium && (
                    <div style={{
                        marginTop: 6, color: "var(--text-muted)",
                        fontSize: 11, fontFamily: "var(--mono)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        🏆 {r.podium}
                    </div>
                )}
            </div>
            {wide && (
                <div style={{ color: "var(--text-muted)", fontFamily: "var(--display)", fontSize: 12, fontWeight: 600 }}>
                    {r.bets > 0 ? `${r.bets} bud` : "—"}
                </div>
            )}
            <div className={`hf-badge ${r.status}`}>{STATUS_LABEL[r.status]}</div>
        </div>
    );
}

function PageRaces({ bp }) {
    const lg = bp.name === "LG" || bp.name === "XL";
    const md = bp.name === "MD";
    const wide = lg || md;

    const upcoming = SEASON_RACES.filter(r => r.status !== "done");
    const past = SEASON_RACES.filter(r => r.status === "done");

    return (
        <HfFrame bp={bp} active="races" drawerOpen={false}>
            <div style={{ overflowY: "auto", flex: 1 }}>
                <div className="hf-container">
                    <header className="hf-pageh">
                        <div className="crumb">Sæson 2026 · 12 af 24 runder gået</div>
                        <h1>Løb</h1>
                        <p className="lede">12 runder tilbage. Næste op: Monaco på søndag — buddet lukker ét minut før lights out.</p>
                    </header>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 20px" }}>
                        <div className="hf-seg">
                            <button className="active">Alle</button>
                            <button>Kommende</button>
                            <button>Åbne for bud</button>
                            <button>Afsluttede</button>
                        </div>
                    </div>

                    <section style={{ paddingBottom: 8 }}>
                        <div className="hf-section-h" style={{ marginBottom: 12 }}>
                            <h2>Kommende ({upcoming.length})</h2>
                            <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--display)" }}>
                                runde 13–17
                            </span>
                        </div>
                        {wide ? (
                            <div style={{ display: "grid", gridTemplateColumns: lg ? "1fr 1fr" : "1fr", gap: 10 }}>
                                {upcoming.map(r => <RaceCard r={r} wide={lg} key={r.n} />)}
                            </div>
                        ) : (
                            upcoming.map(r => <RaceCard r={r} key={r.n} />)
                        )}
                    </section>

                    <section style={{ paddingBottom: 24, marginTop: 24 }}>
                        <div className="hf-section-h" style={{ marginBottom: 12 }}>
                            <h2>Afsluttet</h2>
                            <a href="#">se hele historikken →</a>
                        </div>
                        {wide ? (
                            <div style={{ display: "grid", gridTemplateColumns: lg ? "1fr 1fr" : "1fr", gap: 10 }}>
                                {past.slice(0, 4).map(r => <RaceCard r={r} wide={lg} key={r.n} />)}
                            </div>
                        ) : (
                            past.slice(0, 3).map(r => <RaceCard r={r} key={r.n} />)
                        )}
                    </section>
                    <HfFooter />
                </div>
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageRaces });
