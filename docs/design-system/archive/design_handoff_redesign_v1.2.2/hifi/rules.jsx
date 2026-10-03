/* global React */
// ============================================================
// RULES page — long-form editorial, optional TOC sidebar at LG+
// ============================================================

const RULES = [
    {
        n: "01",
        h: "Buddet",
        ps: [
            "Hvert medlem afgiver ét bud per løb: tre kørere i den rækkefølge du tror de slutter (1., 2., 3.).",
            "Du kan ændre dit bud helt frem til ét minut før lights out. Efter det er det låst.",
        ],
    },
    {
        n: "02",
        h: "Pointene",
        ps: [
            "Top-3 placering = 25 / 15 / 10 point. Eksakt podium (alle tre i rigtig rækkefølge) giver desuden en stjerne.",
            "Forkert placering, men køreren ender alligevel i top-3? 5 point. Ellers nul. Ingen straf for nul-bud.",
        ],
    },
    {
        n: "03",
        h: "Stjernerne",
        ps: [
            "Stjerner er sæsonens prestige-metric. De gives kun for det perfekte bud — ingen genveje, ingen near-misses.",
            "Vinder du sæsonen er det stjerner, ikke point, der bryder tie-breaks.",
        ],
    },
    {
        n: "04",
        h: "Puljen",
        ps: [
            "Hver runde lægger alle medlemmer et symbolsk beløb i puljen. Rundens vinder tager den.",
            "Puljen kan rulles videre hvis ingen rammer rigtigt — så vokser den til den næste runde.",
        ],
    },
    {
        n: "05",
        h: "Etikette",
        ps: [
            "Bud er offentlige først når løbet starter. Indtil da kan ingen — heller ikke administrator — se dit bud.",
            "Diskussion er velkommen, taunting er det også, men hold det venligt. Vi mødes alligevel hver tirsdag.",
        ],
    },
];

function PageRules({ bp }) {
    const lg = bp.name === "LG" || bp.name === "XL";
    const md = bp.name === "MD";

    return (
        <HfFrame bp={bp} active="rules" drawerOpen={false}>
            <div style={{ overflowY: "auto", flex: 1 }}>
                <div className="hf-container">
                    <header className="hf-pageh">
                        <div className="crumb">Reglement · sæson 2026</div>
                        <h1>Sådan spiller vi</h1>
                        <p className="lede">Reglerne er korte. Læs dem én gang, så ved du hvor stjernerne kommer fra og hvorfor Bjarne stadig leder.</p>
                    </header>

                    {lg ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "240px 1fr",
                            gap: 48,
                            paddingBottom: 32,
                            alignItems: "start",
                        }}>
                            <nav className="hf-toc">
                                <div className="hf-toc-title">Indhold</div>
                                {RULES.map((r, i) => (
                                    <a href={`#r-${r.n}`} key={r.n} className={i === 1 ? "active" : ""}>
                                        <span className="n">{r.n}</span>
                                        {r.h}
                                    </a>
                                ))}
                            </nav>
                            <div>
                                {RULES.map(r => (
                                    <div className="hf-rule" id={`r-${r.n}`} key={r.n}>
                                        <div className="hf-rule-num">{r.n}</div>
                                        <div>
                                            <h3>{r.h}</h3>
                                            {r.ps.map((p, i) => <p key={i}>{p}</p>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {md && (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 1fr)",
                                    gap: 8,
                                    margin: "24px 0 8px",
                                    padding: 14,
                                    border: "1px solid var(--border-soft)",
                                    borderRadius: 12,
                                    background: "var(--bg-card)",
                                }}>
                                    {RULES.map((r, i) => (
                                        <a href={`#r-${r.n}`} key={r.n} style={{
                                            display: "flex", flexDirection: "column", gap: 4,
                                            padding: "10px 12px",
                                            background: i === 1 ? "var(--bg-hover)" : "transparent",
                                            borderRadius: 7,
                                            textDecoration: "none",
                                        }}>
                                            <div style={{
                                                fontFamily: "var(--display)", fontWeight: 800,
                                                fontSize: 11, color: i === 1 ? "var(--f1-red)" : "var(--text-muted)",
                                                letterSpacing: "0.08em",
                                            }}>{r.n}</div>
                                            <div style={{
                                                fontFamily: "var(--display)", fontWeight: 700, fontSize: 13,
                                                color: "var(--text-primary)",
                                            }}>{r.h}</div>
                                        </a>
                                    ))}
                                </div>
                            )}
                            <div style={{ paddingBottom: 32 }}>
                                {RULES.map(r => (
                                    <div className="hf-rule" id={`r-${r.n}`} key={r.n}>
                                        <div className="hf-rule-num">{r.n}</div>
                                        <div>
                                            <h3>{r.h}</h3>
                                            {r.ps.map((p, i) => <p key={i}>{p}</p>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <HfFooter />
                </div>
            </div>
        </HfFrame>
    );
}

Object.assign(window, { PageRules });
