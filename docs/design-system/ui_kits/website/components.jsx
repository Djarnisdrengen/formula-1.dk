/* global React */
const { useState, useMemo, useEffect } = React;

// ============================================================
// Atoms
// ============================================================

function StatusBadge({ status, t }) {
    const map = {
        open:      ["status-open",      t.bets_open],
        pending:   ["status-pending",   t.bets_pending],
        closed:    ["status-closed",    t.bets_closed],
        completed: ["status-completed", t.bets_done],
    };
    const [cls, label] = map[status] || ["status-completed", status];
    return <span className={`badge ${cls}`}>{label}</span>;
}

function PositionBadge({ n, label }) {
    return <span className={`position-badge position-${n}`}>{label || n}</span>;
}

function Button({ variant = "primary", size, icon, children, ...rest }) {
    const cls = ["btn", `btn-${variant}`, size && `btn-${size}`].filter(Boolean).join(" ");
    return (
        <button className={cls} {...rest}>
            {icon && <i className={`fas fa-${icon}`}></i>}
            {children}
        </button>
    );
}

function Avatar({ initial, size = 32 }) {
    const s = { width: size, height: size, fontSize: size * 0.42 };
    return <div className="bet-avatar" style={s}>{initial}</div>;
}

function FormField({ label, ...rest }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input className="form-input" {...rest} />
        </div>
    );
}

// ============================================================
// Header
// ============================================================

function Header({ t, theme, palette, onTogglePalette, onToggleTheme, lang, onToggleLang, user, onLogin, onLogout, page, setPage }) {
    const logo = theme === "dark" ? "../../assets/logo_header_dark.png" : "../../assets/logo_header_light.png";
    const navLink = (key, label, icon) => (
        <a className={`nav-link ${page === key ? "active" : ""}`}
           onClick={(e) => { e.preventDefault(); setPage(key); }}
           href="#">
            <i className={`fas fa-${icon}`}></i> <span>{label}</span>
        </a>
    );
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setPage("home"); }}>
                        <img src={logo} alt="" className="logo-img" />
                        <span className="logo-text">Frederikssund Formel 1 Klub</span>
                        <span className="logo-year">{t.year}</span>
                    </a>
                    <nav className="nav">
                        {navLink("home", t.home, "home")}
                        {navLink("leaderboard", t.leaderboard, "trophy")}
                        {navLink("races", t.races, "flag")}
                        {user && navLink("rules", t.rules, "book")}
                    </nav>
                    <div className="controls">
                        <button className="btn btn-ghost btn-icon" onClick={onTogglePalette} title={palette === "clubhouse" ? "Switch to broadcast palette" : "Switch to clubhouse palette"}>
                            <i className={`fas fa-${palette === "clubhouse" ? "mug-hot" : "tv"}`}></i>
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={onToggleTheme} title="Toggle theme">
                            <i className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}></i>
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={onToggleLang} title="Toggle language">
                            <i className="fas fa-globe"></i>
                        </button>
                        {user ? (
                            <>
                                <a className="btn btn-ghost" onClick={(e) => { e.preventDefault(); setPage("profile"); }} href="#">
                                    <Avatar initial={user.initial} size={32} />
                                    <span className="user-name">{user.name}</span>
                                    {user.stars > 0 && <span className="star">★{user.stars}</span>}
                                </a>
                                <button className="btn btn-secondary btn-sm" onClick={onLogout}>{t.logout}</button>
                            </>
                        ) : (
                            <button className="btn btn-primary" onClick={onLogin}>{t.login}</button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

// ============================================================
// Hero
// ============================================================

function Hero({ t }) {
    return (
        <section className="hero">
            <h1>{t.hero_title}</h1>
            <p>{t.hero_text}</p>
        </section>
    );
}

// ============================================================
// Race card
// ============================================================

function QualiRow({ ids, label, drivers }) {
    return (
        <div style={{ background: "var(--bg-secondary)", padding: "0.75rem", borderRadius: 8, marginTop: "1rem" }}>
            <small className="text-muted">{label}</small>
            <div className="quali-row">
                {ids.map((id, i) => {
                    const d = drivers.find((x) => x.id === id);
                    return (
                        <div key={i} className="quali-item">
                            <PositionBadge n={i + 1} label={`P${i + 1}`} />
                            {d?.name}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Countdown({ status, value, t }) {
    if (!value) return null;
    const open = status === "open";
    return (
        <div className={`countdown-timer ${open ? "betting-open" : ""}`}>
            <i className={`fas fa-${open ? "stopwatch" : "hourglass-half"}`}></i>
            {open ? t.closes_in : t.opens_in}:
            <span className="countdown-value">{value}</span>
        </div>
    );
}

function RaceCard({ race, drivers, user, t, onPlaceBet }) {
    const canBet = race.status === "open" && user && user.inCompetition;
    return (
        <div className="card mb-2">
            <div className="race-card">
                <div className="race-header">
                    <div>
                        <h3 className="race-title">{race.name}</h3>
                        <div className="race-meta">
                            <span><i className="fas fa-map-marker-alt"></i> {race.location}</span>
                            <span><i className="fas fa-clock"></i> {race.date} — {race.time} CET</span>
                        </div>
                        <Countdown status={race.status} value={race.countdown} t={t} />
                    </div>
                    <StatusBadge status={race.status} t={t} />
                </div>

                {race.pool && (
                    <div className="countdown-timer bettingpool_size">
                        <i className="fas fa-dollar-sign bettingpool_size"></i>
                        {t.pool}
                        <span className="bettingpool_size"> {race.pool} kr</span>
                    </div>
                )}

                {race.qualifying && <QualiRow ids={race.qualifying} label={t.qualifying} drivers={drivers} />}
                {race.result &&     <QualiRow ids={race.result}     label={t.result}     drivers={drivers} />}

                <div className="flex items-center justify-between mt-2">
                    <span className="text-muted"><i className="fas fa-users"></i> {race.bets} {t.bets_count}</span>
                    <div className="flex gap-1">
                        {canBet && (
                            <Button variant="primary" size="sm" onClick={() => onPlaceBet(race)}>
                                {t.place_bet}
                            </Button>
                        )}
                        {race.bets > 0 && (
                            <Button variant="ghost" size="sm" icon="chevron-down">{t.all_bets}</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Leaderboard sidebar
// ============================================================

function LeaderboardSidebar({ members, t }) {
    return (
        <div className="leaderboard-section">
            <h2 className="mb-2"><i className="fas fa-trophy text-accent"></i> {t.leaderboard}</h2>
            <div className="card">
                {members.slice(0, 3).map((m, i) => (
                    <div key={m.id} className="leaderboard-entry"
                         style={{ padding: "1rem", borderBottom: i < 2 ? "1px solid var(--border-color)" : "none",
                                  background: "linear-gradient(90deg, rgba(225, 6, 0, 0.1), transparent)" }}>
                        <div className="flex items-center gap-2">
                            <PositionBadge n={i + 1} />
                            <div>
                                <strong>{m.name}</strong>
                                <br /><small className="text-muted">{m.bets} {t.bets_label}</small>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-accent" style={{ fontWeight: 700 }}>{m.points} pts</span>
                            {m.stars > 0 && <><br /><span className="star">★{m.stars}</span></>}
                        </div>
                    </div>
                ))}
            </div>
            <button className="btn btn-secondary mt-2" style={{ width: "100%" }}>{t.leaderboard_full}</button>
        </div>
    );
}

// ============================================================
// Rules page
// ============================================================

function RulesPage({ t, lang }) {
    const sections = window.FAKE_RULES[lang];
    const [active, setActive] = useState(sections[0].id);

    useEffect(() => {
        const onScroll = () => {
            // Pick the section whose top is closest above 140px
            let current = sections[0].id;
            for (const s of sections) {
                const el = document.getElementById(`rule-${s.id}`);
                if (el && el.getBoundingClientRect().top < 160) current = s.id;
            }
            setActive(current);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [sections]);

    const jump = (id) => (e) => {
        e.preventDefault();
        const el = document.getElementById(`rule-${id}`);
        if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
    };

    return (
        <div className="rules-page">
            <header className="rules-hero">
                <div className="rules-hero-inner">
                    <span className="rules-eyebrow"><i className="fas fa-book"></i> {t.rules}</span>
                    <h1>{t.rules_title}</h1>
                    <p>{t.rules_intro}</p>
                    <div className="rules-meta">
                        <span><i className="far fa-clock"></i> {t.rules_updated}</span>
                        <span className="rules-actions">
                            <Button variant="ghost" size="sm" icon="print">{t.rules_print}</Button>
                            <Button variant="ghost" size="sm" icon="file-pdf">{t.rules_download}</Button>
                        </span>
                    </div>
                </div>
            </header>

            <div className="rules-layout">
                <aside className="rules-toc">
                    <small className="text-muted" style={{ textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 }}>
                        {lang === "da" ? "På denne side" : "On this page"}
                    </small>
                    <ul>
                        {sections.map((s, i) => (
                            <li key={s.id}>
                                <a href={`#rule-${s.id}`}
                                   onClick={jump(s.id)}
                                   className={active === s.id ? "active" : ""}>
                                    <span className="rules-toc-num">{i + 1}</span>
                                    <span><i className={`fas fa-${s.icon}`}></i> {s.title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                <article className="rules-body">
                    {sections.map((s, i) => (
                        <section key={s.id} id={`rule-${s.id}`} className="rules-section">
                            <header>
                                <span className="rules-section-num">{String(i + 1).padStart(2, "0")}</span>
                                <div>
                                    <h2><i className={`fas fa-${s.icon}`}></i> {s.title}</h2>
                                </div>
                            </header>
                            <ol className="rules-list">
                                {s.items.map(([num, text]) => (
                                    <li key={num}>
                                        <span className="rules-num">{num}</span>
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ))}

                    <div className="rules-callout">
                        <i className="fas fa-circle-info"></i>
                        <div>
                            <strong>{lang === "da" ? "Tvivl om en regel?" : "Unsure about a rule?"}</strong>{" "}
                            {lang === "da"
                                ? "Skriv til Søren eller spørg i klubbens Signal-gruppe — vi opdaterer reglerne sammen, ikke i smug."
                                : "Message Søren or ask in the club Signal group — we update the rules together, never behind anyone's back."}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}

// ============================================================
// Modals
// ============================================================

function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null;
    return (
        <div className="bet-modal-overlay active" onClick={onClose}>
            <div className="bet-modal" onClick={(e) => e.stopPropagation()}>
                <div className="bet-modal-header">
                    <h3>{title}</h3>
                    <button className="bet-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="bet-modal-body">{children}</div>
                {footer && <div className="bet-modal-footer">{footer}</div>}
            </div>
        </div>
    );
}

function LoginModal({ open, onClose, onLogin, t }) {
    return (
        <Modal open={open} onClose={onClose} title={t.login}
               footer={<>
                   <Button variant="secondary" onClick={onClose}>{t.cancel}</Button>
                   <Button variant="primary" onClick={onLogin}>{t.login}</Button>
               </>}>
            <FormField label={t.email} type="email" defaultValue="ole.h@klubben.dk" />
            <FormField label={t.password} type="password" defaultValue="••••••••" />
            <a href="#" className="text-accent" style={{ fontSize: 13 }}>{t.forgot}</a>
        </Modal>
    );
}

function BetModal({ open, onClose, race, drivers, t, onSave }) {
    const [picks, setPicks] = useState([null, null, null]);
    useEffect(() => { if (open) setPicks([null, null, null]); }, [open, race]);
    if (!race) return null;

    const setPick = (i, v) => {
        const next = [...picks];
        next[i] = v ? Number(v) : null;
        setPicks(next);
    };
    const used = new Set(picks.filter(Boolean));
    const valid = picks.every(Boolean) && used.size === 3;

    return (
        <Modal open={open} onClose={onClose}
               title={`${race.name} · ${t.modal_select}`}
               footer={<>
                   <Button variant="secondary" onClick={onClose}>{t.cancel}</Button>
                   <Button variant="primary" disabled={!valid} onClick={() => onSave(picks)}>{t.save}</Button>
               </>}>
            {[1, 2, 3].map((pos, i) => (
                <div className="form-group" key={pos}>
                    <label className="form-label">
                        <PositionBadge n={pos} label={`P${pos}`} /> &nbsp; Position {pos}
                    </label>
                    <select className="form-select" value={picks[i] ?? ""} onChange={(e) => setPick(i, e.target.value)}>
                        <option value="">— vælg —</option>
                        {drivers.map((d) => (
                            <option key={d.id} value={d.id} disabled={used.has(d.id) && picks[i] !== d.id}>
                                #{d.number} {d.name} · {d.team}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
        </Modal>
    );
}

// ============================================================
// App
// ============================================================

function App() {
    const [theme, setTheme] = useState("dark");
    const [palette, setPalette] = useState("clubhouse"); // "broadcast" | "clubhouse"
    const [lang, setLang] = useState("da");
    const [page, setPage] = useState("home");
    const [user, setUser] = useState(window.FAKE_USER);
    const [loginOpen, setLoginOpen] = useState(false);
    const [betRace, setBetRace] = useState(null);
    const [flash, setFlash] = useState(null);
    const [races, setRaces] = useState(window.FAKE_RACES);

    const t = window.LANG[lang];
    const drivers = window.FAKE_DRIVERS;
    const members = window.FAKE_MEMBERS;

    useEffect(() => {
        document.body.className = palette === "clubhouse" ? `${theme} clubhouse` : theme;
    }, [theme, palette]);

    useEffect(() => {
        if (!flash) return;
        const id = setTimeout(() => setFlash(null), 2400);
        return () => clearTimeout(id);
    }, [flash]);

    return (
        <>
            <Header
                t={t}
                theme={theme}
                palette={palette}
                onTogglePalette={() => setPalette(palette === "clubhouse" ? "broadcast" : "clubhouse")}
                onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
                lang={lang}
                onToggleLang={() => setLang(lang === "da" ? "en" : "da")}
                user={user}
                onLogin={() => setLoginOpen(true)}
                onLogout={() => setUser(null)}
                page={page}
                setPage={setPage}
            />

            <main className="container" style={{ padding: "2rem 1rem", minHeight: "calc(100vh - 200px)" }}>
                {flash && <div className="alert alert-success">{flash}</div>}
                {page === "rules" ? (
                    <RulesPage t={t} lang={lang} />
                ) : (
                    <>
                        <Hero t={t} />
                        <div className="homepage-grid">
                            <div className="races-section">
                                <h2 className="mb-2"><i className="fas fa-flag text-accent"></i> {t.upcoming}</h2>
                                {races.map((r) => (
                                    <RaceCard key={r.id} race={r} drivers={drivers} user={user} t={t}
                                              onPlaceBet={(race) => user ? setBetRace(race) : setLoginOpen(true)} />
                                ))}
                            </div>
                            <LeaderboardSidebar members={members} t={t} />
                        </div>
                    </>
                )}
            </main>

            <footer className="footer">
                <div className="container">
                    {t.contact} formel1@frederikssund.klub · © 2026
                </div>
            </footer>

            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onLogin={() => { setUser(window.FAKE_USER); setLoginOpen(false); setFlash(lang === "da" ? "Velkommen tilbage, Ole!" : "Welcome back, Ole!"); }}
                t={t}
            />
            <BetModal
                open={!!betRace}
                race={betRace}
                drivers={drivers}
                t={t}
                onClose={() => setBetRace(null)}
                onSave={(picks) => {
                    setRaces(races.map((r) => r.id === betRace.id ? { ...r, bets: r.bets + 1 } : r));
                    setBetRace(null);
                    setFlash(lang === "da" ? "Bet placeret!" : "Bet placed!");
                }}
            />
        </>
    );
}

Object.assign(window, { App });
