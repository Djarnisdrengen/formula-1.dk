/* global React */
// ============================================================
// BET MODAL FLOW — 5 sequential states showing bet placement
// from empty → picker → partial → complete → success.
// Same modal chrome at every step; only the body changes.
// ============================================================

const DRIVERS = [
    ["VER", "Max Verstappen",  "Red Bull",   "1"],
    ["NOR", "Lando Norris",    "McLaren",    "2"],
    ["LEC", "Charles Leclerc", "Ferrari",    "3"],
    ["SAI", "Carlos Sainz",    "Ferrari",    "4"],
    ["PIA", "Oscar Piastri",   "McLaren",    "5"],
    ["RUS", "George Russell",  "Mercedes",   "6"],
];

// ── Position row primitives ──────────────────────────────────

function EmptyPos({ pos, active = false, dim = false }) {
    return (
        <div>
            <label style={{
                fontFamily: "var(--display)", fontWeight: 700,
                fontSize: 11, color: active ? "var(--f1-red-light)" : "var(--text-muted)",
                letterSpacing: "0.12em", textTransform: "uppercase",
                display: "block", marginBottom: 6,
            }}>{pos}. plads</label>
            <button style={{
                width: "100%", height: 56, padding: "0 16px",
                background: "var(--bg-secondary)",
                border: active ? "2px solid var(--f1-red)" : "1px dashed var(--border-color)",
                borderRadius: 10,
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", color: "var(--text-muted)",
                boxShadow: active ? "0 0 0 4px rgba(225,6,0,0.15)" : "none",
                opacity: dim ? 0.5 : 1,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 50,
                    border: "1px dashed " + (active ? "var(--f1-red)" : "var(--border-color)"),
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: active ? "var(--f1-red)" : "var(--text-muted)",
                }}>＋</div>
                <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{
                        fontFamily: "var(--display)", fontWeight: 600, fontSize: 14,
                        color: active ? "var(--text-primary)" : "var(--text-muted)",
                    }}>{active ? "Vælg en kører nedenfor" : "Vælg kører"}</div>
                </div>
            </button>
        </div>
    );
}

function FilledPos({ pos, init, name, team, num }) {
    return (
        <div>
            <label style={{
                fontFamily: "var(--display)", fontWeight: 700,
                fontSize: 11, color: "var(--text-muted)",
                letterSpacing: "0.12em", textTransform: "uppercase",
                display: "block", marginBottom: 6,
            }}>{pos}. plads</label>
            <button style={{
                width: "100%", height: 56, padding: "0 16px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", color: "var(--text-primary)",
            }}>
                <div className="hf-avatar" style={{ width: 36, height: 36 }}>{init}</div>
                <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>{name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>{team} · #{num}</div>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>▼</span>
            </button>
        </div>
    );
}

function DriverPicker({ selectedIdx = 0, disabledInits = [] }) {
    return (
        <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-soft)",
            borderRadius: 10,
            padding: 6,
            display: "flex", flexDirection: "column", gap: 2,
        }}>
            {DRIVERS.map(([init, name, team, num], i) => {
                const disabled = disabledInits.includes(init);
                const selected = i === selectedIdx && !disabled;
                return (
                    <button key={init} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "8px 10px",
                        background: selected ? "var(--bg-hover)" : "transparent",
                        border: "none",
                        borderRadius: 7,
                        textAlign: "left",
                        color: disabled ? "var(--text-muted)" : "var(--text-primary)",
                        opacity: disabled ? 0.4 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}>
                        <div className="hf-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{init}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 13 }}>{name}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
                                {team} · #{num}{disabled && " · valgt"}
                            </div>
                        </div>
                        {selected && <span style={{ color: "var(--f1-red)", fontSize: 14 }}>✓</span>}
                    </button>
                );
            })}
        </div>
    );
}

// ── Modal chrome ─────────────────────────────────────────────

function FlowShell({ bp, children, success = false }) {
    return (
        <div className={"hifi-frame " + bp.cls} style={{
            width: bp.w, height: "100%", minHeight: "100%",
            background: "var(--bg-primary)",
        }}>
            <div style={{
                position: "relative",
                width: bp.w, height: "100%",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                borderRadius: 20,
                border: "1px solid var(--border-soft)",
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    background: "var(--bg-primary)",
                    opacity: 0.25,
                }} />
                <div style={{
                    position: "relative",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 16,
                    width: Math.min(560, bp.w - 64),
                    maxHeight: "calc(100% - 64px)",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                    zIndex: 1,
                }}>{children}</div>
            </div>
        </div>
    );
}

function ModalHeader({ stepLabel, sub, onClose }) {
    return (
        <header style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12,
        }}>
            <div style={{ minWidth: 0 }}>
                <div style={{
                    color: "var(--f1-red-light)",
                    fontFamily: "var(--display)", fontWeight: 700, fontSize: 11,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    marginBottom: 4,
                }}>{stepLabel}</div>
                <h2 style={{
                    fontFamily: "var(--display)", fontWeight: 800,
                    fontSize: 22, letterSpacing: "-0.01em",
                }}>Monaco Grand Prix</h2>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{sub}</div>
            </div>
            <button className="hf-hamburger" style={{ width: 36, height: 36 }}>
                <span style={{ fontSize: 18 }}>✕</span>
            </button>
        </header>
    );
}

function ModalFooter({ primary = "Læg bud", disabled = false, cancelLabel = "Annuller" }) {
    return (
        <footer style={{
            padding: "18px 24px",
            borderTop: "1px solid var(--border-soft)",
            display: "flex", gap: 10,
            background: "var(--bg-card)",
        }}>
            <button style={{
                flex: 1, height: 46, borderRadius: 10,
                background: "transparent",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                fontFamily: "var(--display)", fontWeight: 600, fontSize: 14,
                cursor: "pointer",
            }}>{cancelLabel}</button>
            <button className={"hf-cta-primary" + (disabled ? " is-disabled" : "")} style={{
                flex: 2, height: 46, margin: 0,
            }}>
                {primary} <span className="arrow">→</span>
            </button>
        </footer>
    );
}

// ── Step renderers ───────────────────────────────────────────

function StepBody({ children }) {
    return (
        <div style={{
            padding: "24px",
            display: "flex", flexDirection: "column", gap: 14,
            overflowY: "auto", flex: 1,
        }}>{children}</div>
    );
}

function StepHint({ children }) {
    return (
        <div style={{
            color: "var(--text-secondary)",
            fontSize: 13, lineHeight: 1.55,
            paddingBottom: 4,
        }}>{children}</div>
    );
}

function Step1Empty() {
    return (
        <>
            <ModalHeader stepLabel="Læg bud · steg 1 / 3" sub="Vælg dine tre kørere — buddet lukker om 02d 14t 37m" />
            <StepBody>
                <StepHint>Tryk på en plads for at vælge en kører. Eksakt podium giver en stjerne.</StepHint>
                <EmptyPos pos="1" />
                <EmptyPos pos="2" />
                <EmptyPos pos="3" />
            </StepBody>
            <ModalFooter disabled={true} />
        </>
    );
}

function Step2Picker1() {
    return (
        <>
            <ModalHeader stepLabel="Læg bud · steg 1 / 3" sub="Vælg din 1. plads" />
            <StepBody>
                <EmptyPos pos="1" active />
                <DriverPicker selectedIdx={-1} />
                <EmptyPos pos="2" dim />
                <EmptyPos pos="3" dim />
            </StepBody>
            <ModalFooter disabled={true} />
        </>
    );
}

function Step3Picker2() {
    return (
        <>
            <ModalHeader stepLabel="Læg bud · steg 2 / 3" sub="Vælg din 2. plads" />
            <StepBody>
                <FilledPos pos="1" init="VER" name="Max Verstappen" team="Red Bull"  num="1" />
                <EmptyPos pos="2" active />
                <DriverPicker selectedIdx={-1} disabledInits={["VER"]} />
                <EmptyPos pos="3" dim />
            </StepBody>
            <ModalFooter disabled={true} />
        </>
    );
}

function Step4Ready() {
    return (
        <>
            <ModalHeader stepLabel="Læg bud · klar" sub="Tjek dit bud og bekræft" />
            <StepBody>
                <FilledPos pos="1" init="VER" name="Max Verstappen"  team="Red Bull" num="1" />
                <FilledPos pos="2" init="NOR" name="Lando Norris"    team="McLaren"  num="2" />
                <FilledPos pos="3" init="LEC" name="Charles Leclerc" team="Ferrari"  num="3" />
                <div style={{
                    marginTop: 4,
                    padding: "12px 14px",
                    background: "linear-gradient(135deg, rgba(251,191,36,0.10), transparent 80%)",
                    border: "1px solid rgba(251,191,36,0.30)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", gap: 10,
                    color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.45,
                }}>
                    <span style={{ color: "var(--gold)", fontSize: 18 }}>★</span>
                    <span>Eksakt podium = en stjerne. Du har ★3 i sæsonen lige nu.</span>
                </div>
            </StepBody>
            <ModalFooter primary="Bekræft bud" />
        </>
    );
}

function Step5Success() {
    return (
        <>
            <ModalHeader stepLabel="Bud lagt" sub="Søndag 26. maj · 15:00" />
            <StepBody>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                    padding: "24px 12px 8px", textAlign: "center",
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: "50%",
                        background: "rgba(16,185,129,0.18)",
                        border: "2px solid var(--status-success)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "var(--status-success)",
                        fontSize: 36, fontWeight: 800,
                    }}>✓</div>
                    <div>
                        <h3 style={{
                            fontFamily: "var(--display)", fontWeight: 800, fontSize: 22,
                            letterSpacing: "-0.01em", marginBottom: 4,
                        }}>Bud lagt</h3>
                        <div style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: "30ch" }}>
                            Du kan stadig redigere indtil ét minut før lights out.
                        </div>
                    </div>
                </div>

                <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 10,
                    padding: 12,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                }}>
                    {[
                        ["1.", "VER", "1"],
                        ["2.", "NOR", "2"],
                        ["3.", "LEC", "3"],
                    ].map(([pos, init, rank]) => (
                        <div key={pos} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            padding: 10,
                        }}>
                            <div className={`hf-rank r${rank}`} style={{ width: 32, height: 32, fontSize: 13 }}>{pos.replace(".","")}</div>
                            <div className="hf-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{init}</div>
                        </div>
                    ))}
                </div>
            </StepBody>
            <footer style={{
                padding: "18px 24px",
                borderTop: "1px solid var(--border-soft)",
                display: "flex", gap: 10,
                background: "var(--bg-card)",
            }}>
                <button style={{
                    flex: 1, height: 46, borderRadius: 10,
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--display)", fontWeight: 600, fontSize: 14,
                    cursor: "pointer",
                }}>Redigér bud</button>
                <button className="hf-cta-primary" style={{
                    flex: 2, height: 46, margin: 0,
                }}>
                    Tilbage til løbet <span className="arrow">→</span>
                </button>
            </footer>
        </>
    );
}

// ── Main component ───────────────────────────────────────────

function PageBetFlow({ bp, step = 1 }) {
    const Steps = [Step1Empty, Step2Picker1, Step3Picker2, Step4Ready, Step5Success];
    const Step = Steps[step - 1] || Step1Empty;
    return (
        <FlowShell bp={bp}>
            <Step />
        </FlowShell>
    );
}

Object.assign(window, { PageBetFlow });
