/* global React */
// ============================================================
// States reference — show every interactive component in every
// state, side-by-side. No hover required — the .is-hover /
// .is-active / .is-focus / .is-disabled classes baked into the
// CSS reproduce what each pseudo-class normally renders.
// ============================================================

function PageStates() {
    // Sample row content for hf-row variants
    const Row = ({ klass = "", rank = 1, name = "Ole H.", sub = "14 bud", stars = "★ 3", pts = "142p", self = false }) => (
        <div className={`hf-row ${self ? "self " : ""}${klass}`} style={{ marginBottom: 0, minWidth: 280 }}>
            <div className={`hf-rank r${rank}`}>{rank}</div>
            <div className="hf-avatar">{name[0]}</div>
            <div className="hf-who">
                <div className="hf-who-name">{name}</div>
                <div className="hf-who-sub">{sub}</div>
            </div>
            <div className="hf-stars">{stars}</div>
            <div className="hf-pts">{pts}</div>
        </div>
    );

    const Race = ({ klass = "" }) => (
        <div className={`hf-racecard ${klass}`} style={{ marginBottom: 0, minWidth: 320 }}>
            <div className="hf-racenum">12</div>
            <div>
                <div className="hf-racename">Monaco GP</div>
                <div className="hf-racemeta">26. maj · Circuit de Monaco</div>
            </div>
            <div className="hf-badge open">Åbent</div>
        </div>
    );

    return (
        <div className="state-sample-frame" style={{ width: "100%", maxWidth: 980 }}>
            <h3>Interactive states · reference</h3>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>
                Every interactive component in its default / hover / active / focus / disabled states. Forced via <code style={{ fontFamily: "ui-monospace, Menlo, monospace", background: "var(--bg-secondary)", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>.is-hover</code> classes — these mirror the real <code style={{ fontFamily: "ui-monospace, Menlo, monospace", background: "var(--bg-secondary)", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>:hover</code> CSS so what you see is what the live app renders.
            </div>

            {/* ──────────── Primary CTA ──────────── */}
            <div className="state-row">
                <div className="label">Primary CTA</div>
                <div className="sample">
                    <button className="hf-cta-primary" style={{ margin: 0 }}>Læg dit bud <span className="arrow">→</span></button>
                    <button className="hf-cta-primary is-hover" style={{ margin: 0 }}>Læg dit bud <span className="arrow">→</span></button>
                    <button className="hf-cta-primary is-focus" style={{ margin: 0 }}>Læg dit bud <span className="arrow">→</span></button>
                    <button className="hf-cta-primary is-disabled" style={{ margin: 0 }}>Læg dit bud <span className="arrow">→</span></button>
                    <span className="hf-mute" style={{ fontSize: 11, marginLeft: 8 }}>default / hover / focus / disabled</span>
                </div>
            </div>

            {/* ──────────── Hamburger ──────────── */}
            <div className="state-row">
                <div className="label">Hamburger</div>
                <div className="sample">
                    <button className="hf-hamburger"><span className="bars"><span/><span/><span/></span></button>
                    <button className="hf-hamburger is-hover"><span className="bars"><span/><span/><span/></span></button>
                    <button className="hf-hamburger is-active"><span className="bars"><span/><span/><span/></span></button>
                    <button className="hf-hamburger is-focus"><span className="bars"><span/><span/><span/></span></button>
                    <span className="hf-mute" style={{ fontSize: 11, marginLeft: 8 }}>default / hover / active / focus</span>
                </div>
            </div>

            {/* ──────────── Bottom bar item ──────────── */}
            <div className="state-row">
                <div className="label">Bottom bar</div>
                <div className="sample">
                    <button className="hf-bb-item"><div className="hf-bb-icon">☀</div><span>THEME</span></button>
                    <button className="hf-bb-item is-hover"><div className="hf-bb-icon">☀</div><span>THEME</span></button>
                    <button className="hf-bb-item is-active"><div className="hf-bb-icon">☀</div><span>THEME</span></button>
                    <span className="hf-mute" style={{ fontSize: 11, marginLeft: 8 }}>default / hover / active</span>
                </div>
            </div>

            {/* ──────────── Race card ──────────── */}
            <div className="state-row">
                <div className="label">Race card</div>
                <div className="sample">
                    <Race />
                    <Race klass="is-hover" />
                </div>
            </div>

            {/* ──────────── Leaderboard row ──────────── */}
            <div className="state-row">
                <div className="label">Leaderboard row</div>
                <div className="sample">
                    <Row />
                    <Row klass="is-hover" name="Bjarne K." rank={2} stars="★ 1" pts="128p" />
                    <Row self={true} name="Dig" sub="↑ 2 pladser" rank={7} stars="★ 1" pts="94p" />
                </div>
                <div className="label" style={{ gridColumn: "1 / 2" }}></div>
                <div className="hf-mute" style={{ fontSize: 11 }}>default / hover / self-pinned</div>
            </div>

            {/* ──────────── Segmented ──────────── */}
            <div className="state-row">
                <div className="label">Segmented</div>
                <div className="sample">
                    <div className="hf-seg">
                        <button>Sæson</button>
                        <button className="active">Sidste løb</button>
                        <button>Alle tider</button>
                    </div>
                    <span className="hf-mute" style={{ fontSize: 11 }}>active = bg-hover + text-primary</span>
                </div>
            </div>

            {/* ──────────── Tabs ──────────── */}
            <div className="state-row">
                <div className="label">Tabs</div>
                <div className="sample">
                    <div className="hf-tabs" style={{ marginBottom: 0 }}>
                        <button className="active">Alle (14)</button>
                        <button>Med stjerne (3)</button>
                        <button>Top-3 (9)</button>
                    </div>
                </div>
            </div>

            {/* ──────────── Drawer row ──────────── */}
            <div className="state-row">
                <div className="label">Drawer row</div>
                <div className="sample" style={{ background: "var(--bg-card)", padding: 8, borderRadius: 10, gap: 4, flexDirection: "column", alignItems: "stretch", minWidth: 240 }}>
                    <a href="#" className="hf-drawer-row" onClick={(e) => e.preventDefault()}>
                        <i>⌂</i><span>Hjem</span>
                    </a>
                    <a href="#" className="hf-drawer-row active" onClick={(e) => e.preventDefault()}>
                        <i>♔</i><span>Rangliste</span>
                    </a>
                    <a href="#" className="hf-drawer-row" onClick={(e) => e.preventDefault()}>
                        <i>▶</i><span>Løb</span>
                    </a>
                </div>
                <div className="label" style={{ gridColumn: "1 / 2" }}></div>
                <div className="hf-mute" style={{ fontSize: 11 }}>default / active (red rail right) / default</div>
            </div>

            {/* ──────────── Status badges ──────────── */}
            <div className="state-row">
                <div className="label">Status badges</div>
                <div className="sample">
                    <span className="hf-badge open">Åbent</span>
                    <span className="hf-badge soon">Snart</span>
                    <span className="hf-badge live">LIVE</span>
                    <span className="hf-badge done">Afsluttet</span>
                </div>
            </div>

            {/* ──────────── Position ranks ──────────── */}
            <div className="state-row">
                <div className="label">Position ranks</div>
                <div className="sample">
                    <div className="hf-rank r1">1</div>
                    <div className="hf-rank r2">2</div>
                    <div className="hf-rank r3">3</div>
                    <div className="hf-rank">7</div>
                    <span className="hf-mute" style={{ fontSize: 11 }}>gold / silver / bronze / neutral</span>
                </div>
            </div>
        </div>
    );
}

Object.assign(window, { PageStates });
