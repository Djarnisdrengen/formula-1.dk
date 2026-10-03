/* global React */
// ============================================================
// Page wireframes (public + member pages)
// Each is sized for mobile-first display, ~375-400px wide.
// Built as Page artboards with shared NavTop / NavBottom shells.
// ============================================================

const MOBILE_W = 380;

// Reusable shell wrapper — every page sits inside Top + Bottom bars.
function MobilePage({ label, loggedIn = true, isAdmin = false, drawerOpen = false, children }) {
    return (
        <div style={{
            width: MOBILE_W,
            display: "flex", flexDirection: "column", gap: 0,
            border: "1.5px dashed var(--ink-3)",
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--paper)",
            boxShadow: "0 2px 0 var(--ink-3)",
        }}>
            <NavTop w={MOBILE_W} drawerOpen={drawerOpen} />
            {drawerOpen && <NavDrawer w={MOBILE_W} isAdmin={isAdmin} isLoggedIn={loggedIn} active="home" />}
            <div className="wf-page-body" style={{ padding: "16px 14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                {children}
            </div>
            <NavBottom w={MOBILE_W} loggedIn={loggedIn} />
        </div>
    );
}

// ============================================================
// 1 · HOME — full-bleed next-race hero + leaderboard preview
// ============================================================
function PageHome() {
    return (
        <MobilePage label="Home">
            {/* The full-bleed race hero — visually dominant block */}
            <div style={{
                margin: "-2px -14px 0",
                padding: "20px 14px 24px",
                background: "var(--paper-2)",
                borderBottom: "1.5px dashed var(--ink-3)",
                display: "flex", flexDirection: "column", gap: 10,
                position: "relative",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Pill accent>Næste løb</Pill>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)" }}>R12 / 24</div>
                </div>
                <Title size={28}>Monaco Grand Prix</Title>
                <Bar w="55%" h={6} />
                <Bar w="40%" h={6} />
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    {["02", "14", "37", "12"].map((n, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <div style={{
                                fontFamily: "var(--sketch-font)",
                                fontWeight: 800, fontSize: 32, lineHeight: 1,
                            }}>{n}</div>
                            <div style={{
                                fontFamily: "var(--sketch-font)",
                                fontSize: 9, color: "var(--ink-3)", letterSpacing: 1,
                            }}>{["DAG", "TIM", "MIN", "SEK"][i]}</div>
                        </div>
                    ))}
                </div>
                <CTA fill style={{ marginTop: 12 }}>Læg dit bud</CTA>
                <Note style={{ marginTop: 4, color: "var(--ink-3)" }}>
                    Hero = first thing user sees · countdown is live · CTA in primary red
                </Note>
            </div>

            {/* Secondary: leaderboard top-3 preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <Title size={18}>Rangliste · top 3</Title>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 12, color: "var(--ink-3)" }}>se alle →</div>
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="wf-row">
                        <div className="wf-rank">{i}</div>
                        <Avatar size={28} letter={["O", "B", "P"][i - 1]} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                            <Bar w="70%" h={7} dark />
                            <Bar w="40%" h={5} />
                        </div>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, fontWeight: 700 }}>
                            {[142, 128, 119][i - 1]}p
                        </div>
                    </div>
                ))}
            </div>

            <Divider />

            {/* Tertiary: recent results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Title size={16}>Seneste resultater</Title>
                {[1, 2].map(i => (
                    <div key={i} className="wf-rowflat">
                        <div style={{ flex: 1 }}>
                            <Bar w="65%" h={7} dark />
                            <div style={{ height: 4 }} />
                            <Bar w="45%" h={5} />
                        </div>
                        <Pill>Afsluttet</Pill>
                    </div>
                ))}
            </div>
        </MobilePage>
    );
}

// ============================================================
// 2 · HOME (drawer open) — show the menu overlay
// ============================================================
function PageHomeDrawer() {
    return <MobilePage label="Home · drawer open" drawerOpen={true}>
        <div style={{ opacity: 0.35, pointerEvents: "none", filter: "grayscale(1)" }}>
            <Title size={22}>Monaco Grand Prix</Title>
            <Bar w="70%" h={6} style={{ marginTop: 6 }} />
            <Bar w="50%" h={6} style={{ marginTop: 6 }} />
        </div>
        <Note>Page beneath dims to ~35% · tap outside drawer to close</Note>
    </MobilePage>;
}

// ============================================================
// 3 · RACES — full list with filter chips
// ============================================================
function PageRaces() {
    return (
        <MobilePage label="Races">
            <Title size={22}>Løb · sæson 2026</Title>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Pill accent>Alle</Pill>
                <Pill>Kommende</Pill>
                <Pill>Åbne for bud</Pill>
                <Pill>Afsluttede</Pill>
            </div>

            {/* Race list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                    { name: "Monaco GP", date: "26. maj", status: "Åbent", accent: true },
                    { name: "Spanien GP", date: "2. jun", status: "Snart" },
                    { name: "Canada GP", date: "16. jun", status: "Snart" },
                    { name: "Emilia-Romagna", date: "19. maj", status: "Afsluttet", muted: true },
                    { name: "Miami GP", date: "5. maj", status: "Afsluttet", muted: true },
                ].map((r, i) => (
                    <div key={i} className="wf-racecard" style={{ opacity: r.muted ? 0.6 : 1 }}>
                        <div className="wf-racenum">{12 - i}</div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ fontFamily: "var(--sketch-font)", fontSize: 15, fontWeight: 700 }}>{r.name}</div>
                            <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)" }}>{r.date}</div>
                        </div>
                        <Pill accent={r.accent}>{r.status}</Pill>
                    </div>
                ))}
            </div>
        </MobilePage>
    );
}

// ============================================================
// 4 · LEADERBOARD — full standings
// ============================================================
function PageLeaderboard() {
    return (
        <MobilePage label="Leaderboard">
            <Title size={22}>Rangliste</Title>

            {/* Mode switch */}
            <div style={{ display: "flex", gap: 6 }}>
                <Pill accent>Sæson</Pill>
                <Pill>Sidste løb</Pill>
                <Pill>Alle tider</Pill>
            </div>

            {/* Self-row highlight */}
            <div className="wf-selfrow">
                <div className="wf-rank">7</div>
                <Avatar size={28} letter="D" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 13, fontWeight: 700 }}>Dig</div>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 10, color: "var(--ink-3)" }}>★1 stjerne · 12 bud</div>
                </div>
                <div style={{ fontFamily: "var(--sketch-font)", fontSize: 15, fontWeight: 800 }}>94p</div>
            </div>
            <Note>Your row pinned to top regardless of position · always 1 tap away</Note>

            {/* Full standings */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                    [1, "Ole H.", "★3", 142],
                    [2, "Bjarne K.", "★1", 128],
                    [3, "Per S.", "—", 119],
                    [4, "Lars N.", "—", 108],
                    [5, "Henrik J.", "—", 101],
                    [6, "Niels P.", "—", 97],
                ].map(([rank, name, stars, pts]) => (
                    <div key={rank} className="wf-row">
                        <div className="wf-rank">{rank}</div>
                        <Avatar size={26} letter={name[0]} />
                        <div style={{ flex: 1, fontFamily: "var(--sketch-font)", fontSize: 13, fontWeight: 600 }}>{name}</div>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)" }}>{stars}</div>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 13, fontWeight: 700, minWidth: 36, textAlign: "right" }}>{pts}p</div>
                    </div>
                ))}
            </div>
        </MobilePage>
    );
}

// ============================================================
// 5 · RACE DETAIL — single race + bets list
// ============================================================
function PageRaceDetail() {
    return (
        <MobilePage label="Race detail">
            <div style={{
                margin: "-2px -14px 0", padding: "16px 14px",
                background: "var(--paper-2)",
                borderBottom: "1.5px dashed var(--ink-3)",
            }}>
                <Pill accent>Åbent for bud</Pill>
                <Title size={24} style={{ marginTop: 8 }}>Monaco Grand Prix</Title>
                <div style={{ fontFamily: "var(--sketch-font)", fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                    Søndag 26. maj · 15:00 · Circuit de Monaco
                </div>
                <CTA fill style={{ marginTop: 12 }}>Læg dit bud</CTA>
            </div>

            {/* Your bet (if placed) */}
            <Box dashed={false} fill="var(--paper-3)" style={{ padding: "12px 14px" }}>
                <div className="wf-label">Dit bud</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {[1, 2, 3].map(p => (
                        <div key={p} className="wf-podium">
                            <div className="wf-podium-pos">{p}</div>
                            <Bar w="70%" h={6} dark style={{ marginTop: 4 }} />
                        </div>
                    ))}
                </div>
                <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
                    Du kan ændre indtil 1 min før start
                </div>
            </Box>

            {/* All bets */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Title size={16}>Alle bud (8)</Title>
                <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)" }}>skjult indtil løbet starter</div>
            </div>
            {[1, 2, 3].map(i => (
                <div key={i} className="wf-row">
                    <Avatar size={26} letter={["B", "P", "L"][i - 1]} />
                    <Bar w="55%" h={6} dark />
                    <div style={{ marginLeft: "auto" }}>
                        <Pill>låst</Pill>
                    </div>
                </div>
            ))}
        </MobilePage>
    );
}

// ============================================================
// 6 · BET MODAL — full-screen on mobile
// ============================================================
function PageBetModal() {
    return (
        <div style={{
            width: MOBILE_W,
            border: "1.5px dashed var(--ink-3)",
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--paper)",
            boxShadow: "0 2px 0 var(--ink-3)",
            display: "flex", flexDirection: "column",
        }}>
            <div style={{
                padding: "14px 14px 12px",
                borderBottom: "1.5px dashed var(--ink-3)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "var(--paper-2)",
            }}>
                <Title size={18}>Læg bud · Monaco GP</Title>
                <IconBtn size={32} label="✕" />
            </div>
            <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 16 }}>
                {[1, 2, 3].map(pos => (
                    <div key={pos} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: 1 }}>
                            {["1.", "2.", "3."][pos - 1]} PLADS
                        </div>
                        <Box h={44} dashed={false} fill="var(--paper-2)" style={{ padding: "8px 12px", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Bar w="50%" h={8} dark />
                            <div style={{ fontFamily: "var(--sketch-font)", fontSize: 14, color: "var(--ink-3)" }}>▼</div>
                        </Box>
                    </div>
                ))}
                <Note>Tap a row → driver picker bottom sheet appears · no nested modal</Note>
                <Divider />
                <div style={{ display: "flex", gap: 8 }}>
                    <CTA style={{ flex: 1 }}>Annuller</CTA>
                    <CTA fill style={{ flex: 2 }}>Læg bud</CTA>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// 7 · RULES — long-form readable page
// ============================================================
function PageRules() {
    return (
        <MobilePage label="Rules">
            <Title size={22}>Regler</Title>
            <Note>Updated 12. maj 2026</Note>
            <Divider />
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>0{i}</div>
                        <Title size={15}>{["Buddet", "Pointene", "Stjernerne", "Puljen", "Etikette"][i - 1]}</Title>
                    </div>
                    <TextBlock lines={i % 2 === 0 ? 3 : 4} last={i % 2 === 0 ? "50%" : "75%"} />
                </div>
            ))}
        </MobilePage>
    );
}

// ============================================================
// 8 · PROFILE — me + my stats + my bets
// ============================================================
function PageProfile() {
    return (
        <MobilePage label="Profile">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar size={64} letter="O" />
                <div style={{ flex: 1 }}>
                    <Title size={20}>Ole H.</Title>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                        Medlem siden 2019 · ★3
                    </div>
                </div>
            </div>

            {/* Stat tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                    ["Bud", 14],
                    ["Top-3", 9],
                    ["Stjerner", 3],
                ].map(([k, v]) => (
                    <div key={k} className="wf-stat">
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 26, fontWeight: 800 }}>{v}</div>
                        <div style={{ fontFamily: "var(--sketch-font)", fontSize: 10, color: "var(--ink-3)", letterSpacing: 1 }}>{k.toUpperCase()}</div>
                    </div>
                ))}
            </div>

            <Title size={15} style={{ marginTop: 4 }}>Dine bud</Title>
            {[1, 2, 3].map(i => (
                <div key={i} className="wf-rowflat">
                    <div style={{ flex: 1 }}>
                        <Bar w="65%" h={7} dark />
                        <div style={{ height: 4 }} />
                        <Bar w="40%" h={5} />
                    </div>
                    <Pill>★1</Pill>
                </div>
            ))}
        </MobilePage>
    );
}

// ============================================================
// 9 · LOGIN — pre-auth landing
// ============================================================
function PageLogin() {
    return (
        <div style={{
            width: MOBILE_W,
            border: "1.5px dashed var(--ink-3)",
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--paper)",
            boxShadow: "0 2px 0 var(--ink-3)",
            display: "flex", flexDirection: "column",
        }}>
            <NavTop w={MOBILE_W} />
            <div style={{ padding: "32px 22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <Title size={24}>Velkommen tilbage</Title>
                <Note>Klubmedlem? Log ind for at lægge dit bud.</Note>
                <Divider />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)", letterSpacing: 1 }}>EMAIL</div>
                    <Box h={42} dashed={false} fill="var(--paper-2)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontFamily: "var(--sketch-font)", fontSize: 11, color: "var(--ink-3)", letterSpacing: 1 }}>ADGANGSKODE</div>
                    <Box h={42} dashed={false} fill="var(--paper-2)" />
                </div>
                <CTA fill style={{ marginTop: 8 }}>Log ind</CTA>
                <div style={{ fontFamily: "var(--sketch-font)", fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
                    Glemt adgangskode? · Ny invitation?
                </div>
            </div>
            <NavBottom w={MOBILE_W} loggedIn={false} />
        </div>
    );
}

Object.assign(window, {
    PageHome, PageHomeDrawer, PageRaces, PageLeaderboard,
    PageRaceDetail, PageBetModal, PageRules, PageProfile, PageLogin,
});
