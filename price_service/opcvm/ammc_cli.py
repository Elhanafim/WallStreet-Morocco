"""
OPCVM Terminal Dashboard
========================
A Bloomberg-style rich terminal interface for Moroccan OPCVM data.

Usage:
    python -m price_service.opcvm.ammc_cli          # reads local JSON
    python -m price_service.opcvm.ammc_cli --live   # fetches from API
    opcvm-dashboard                                  # if installed as script

Requires: pip install rich httpx
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

# ── Try to import rich ────────────────────────────────────────────────────────

try:
    from rich import box
    from rich.align import Align
    from rich.columns import Columns
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    from rich.rule import Rule
    from rich.style import Style
    from rich.live import Live
    from rich.spinner import Spinner
    from rich import print as rprint
except ImportError:
    print("ERROR: 'rich' is not installed. Run: pip install rich")
    sys.exit(1)

# ── Paths ─────────────────────────────────────────────────────────────────────

REPO_ROOT    = Path(__file__).resolve().parents[2]
HISTORY_FILE = REPO_ROOT / "public" / "data" / "opcvm" / "history.json"
LATEST_FILE  = REPO_ROOT / "public" / "data" / "opcvm" / "latest.json"

console = Console()

# ── Colour constants ──────────────────────────────────────────────────────────

C_ORANGE  = "color(208)"    # Bloomberg orange
C_CYAN    = "cyan"
C_GREEN   = "bright_green"
C_RED     = "bright_red"
C_YELLOW  = "yellow"
C_MUTED   = "color(245)"
C_WHITE   = "white"
C_BLUE    = "color(39)"
C_PURPLE  = "color(135)"
C_HEADER  = "bold color(208)"

CATEGORY_COLORS: dict[str, str] = {
    "monetaire":       C_CYAN,
    "obligataire_mlt": C_BLUE,
    "obligataire_ct":  C_PURPLE,
    "actions":         C_GREEN,
    "diversifie":      C_YELLOW,
    "contractuel":     C_MUTED,
}

# ── Formatting helpers ────────────────────────────────────────────────────────

def _pct(val: Optional[float], decimals: int = 2, show_sign: bool = True) -> Text:
    if val is None:
        return Text("—", style=C_MUTED)
    s = f"{abs(val * 100):.{decimals}f}%"
    if val > 0:
        return Text(f"+{s}" if show_sign else s, style=C_GREEN)
    elif val < 0:
        return Text(f"-{s}", style=C_RED)
    return Text(f" {s}", style=C_MUTED)


def _num(val: Optional[float], decimals: int = 0, suffix: str = "") -> str:
    if val is None:
        return "—"
    return f"{val:,.{decimals}f}{suffix}"


def _mrd(val: Optional[float]) -> str:
    """Format M MAD → Mrd or M with appropriate suffix."""
    if val is None:
        return "—"
    if abs(val) >= 1000:
        return f"{val / 1000:,.1f} Mrd"
    return f"{val:,.0f} M"


def _score_bar(score: float, width: int = 10) -> Text:
    """Render a score as a filled bar: ██████░░░░ 72.3"""
    filled = int(round(score / 100 * width))
    bar    = "█" * filled + "░" * (width - filled)
    if score >= 70:
        color = C_GREEN
    elif score >= 50:
        color = C_YELLOW
    else:
        color = C_RED
    t = Text()
    t.append(bar, style=color)
    t.append(f" {score:.0f}", style="bold " + color)
    return t


def _sparkline(values: list[Optional[float]], width: int = 12) -> str:
    """ASCII sparkline using block characters."""
    blocks = " ▁▂▃▄▅▆▇█"
    vals = [v for v in values if v is not None]
    if not vals:
        return "─" * width
    mn, mx = min(vals), max(vals)
    span = mx - mn or 1
    result = ""
    for v in (values[-width:] if len(values) > width else values):
        if v is None:
            result += " "
        else:
            idx = int((v - mn) / span * 8)
            result += blocks[min(idx, 8)]
    return result.ljust(width)


def _flow_bar(net_flow: Optional[float], max_flow: float = 1500) -> Text:
    """Render net flow as a signed bar."""
    if net_flow is None:
        return Text("—", style=C_MUTED)
    width = 10
    ratio = min(abs(net_flow) / max_flow, 1.0)
    filled = max(1, int(ratio * width))
    bar = "█" * filled
    if net_flow > 0:
        return Text(f"▶{bar:<{width}}  +{net_flow:,.0f}", style=C_GREEN)
    else:
        return Text(f"◀{bar:<{width}}  {net_flow:,.0f}", style=C_RED)


# ── Data loading ──────────────────────────────────────────────────────────────

def load_data() -> tuple[Optional[dict], list[dict]]:
    """Load latest snapshot and full history from JSON files."""
    latest: Optional[dict] = None
    history: list[dict] = []

    if LATEST_FILE.exists():
        with open(LATEST_FILE, encoding="utf-8") as f:
            latest = json.load(f)
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, encoding="utf-8") as f:
            history = json.load(f)

    return latest, history


# ── Panels ────────────────────────────────────────────────────────────────────

def render_header(data: dict) -> Panel:
    dt    = data.get("date", "—")
    src   = data.get("source", "—")
    week  = data.get("week_number")
    week_str = f"S{week}" if week else ""
    title = Text()
    title.append("◈ WALLSTREET MOROCCO", style=f"bold {C_ORANGE}")
    title.append("  ·  OPCVM DASHBOARD", style=C_MUTED)
    subtitle = Text()
    subtitle.append(f"  {dt}", style=C_WHITE)
    subtitle.append(f"  {week_str}", style=C_MUTED)
    subtitle.append(f"  ·  {src}", style=C_MUTED)
    return Panel(
        Align.center(subtitle),
        title=title,
        border_style=C_ORANGE,
        padding=(0, 2),
    )


def render_kpis(data: dict) -> Columns:
    aum   = data.get("aum_total")
    prev  = data.get("aum_prev")
    growth= data.get("weekly_growth")
    flows = data.get("flows", {})
    net   = flows.get("net_flow")
    sub   = flows.get("subscriptions")
    red   = flows.get("redemptions")

    def kpi_panel(title: str, value: str, sub_text: Text, color: str) -> Panel:
        body = Text()
        body.append(f"\n  {value}\n", style=f"bold {color}")
        body.append_text(sub_text)
        return Panel(body, title=f"[bold {C_MUTED}]{title}[/]", border_style=color, padding=(0, 1))

    aum_val   = _mrd(aum) + " MAD"
    aum_sub   = _pct(growth)

    net_val   = f"+{_mrd(net)}" if (net or 0) >= 0 else _mrd(net)
    net_style = C_GREEN if (net or 0) >= 0 else C_RED
    net_sub   = Text(f"  Sub {_mrd(sub)}  Rach {_mrd(red)}", style=C_MUTED)

    panels = [
        kpi_panel("ENCOURS TOTAL",    aum_val,   Text(f"  Semaine précédente: {_mrd(prev)} MAD", style=C_MUTED), C_ORANGE),
        kpi_panel("CROISSANCE HEBDO", _pct(growth, show_sign=True).plain if growth is not None else "—",
                  Text("  vs semaine précédente", style=C_MUTED), C_GREEN if (growth or 0) >= 0 else C_RED),
        kpi_panel("FLUX NETS",        net_val,   net_sub, net_style),
        kpi_panel("SOUSCRIPTIONS",    _mrd(sub) + " MAD", Text(f"  Rachats: {_mrd(red)} MAD", style=C_MUTED), C_CYAN),
    ]
    return Columns(panels, equal=True, expand=True)


def render_category_table(data: dict, history: list[dict]) -> Table:
    cats = data.get("categories", {})

    # Build AUM history per category for sparklines
    cat_history: dict[str, list[Optional[float]]] = {k: [] for k in cats}
    for snap in history[-8:]:
        for k in cats:
            c = snap.get("categories", {}).get(k)
            cat_history[k].append(c.get("aum") if c else None)

    t = Table(
        title=f"[bold {C_ORANGE}]RÉPARTITION PAR CATÉGORIE[/]",
        box=box.SIMPLE_HEAD,
        border_style=C_MUTED,
        header_style=f"bold {C_ORANGE}",
        show_footer=True,
        expand=True,
    )

    aum_total = data.get("aum_total", 0) or 1
    flows = data.get("flows", {})

    t.add_column("CATÉGORIE",    style=C_WHITE,  no_wrap=True, footer="[bold]TOTAL[/]")
    t.add_column("FONDS",        style=C_MUTED,  justify="right")
    t.add_column("ENCOURS",      style=C_CYAN,   justify="right", footer=f"[bold {C_CYAN}]{_mrd(aum_total)} MAD[/]")
    t.add_column("POIDS",        style=C_MUTED,  justify="right")
    t.add_column("Δ HEBDO",      justify="right")
    t.add_column("IDX PERF",     style=C_YELLOW, justify="right")
    t.add_column("FLUX NETS",    justify="right", footer=f"[bold {C_GREEN if flows.get('net_flow',0)>=0 else C_RED}]{'+' if flows.get('net_flow',0)>=0 else ''}{_mrd(flows.get('net_flow'))}[/]")
    t.add_column("SCORE",        justify="left")
    t.add_column("AUM (8 sem.)", style=C_MUTED,  no_wrap=True)

    for key in ["monetaire", "obligataire_mlt", "obligataire_ct", "actions", "diversifie", "contractuel"]:
        c = cats.get(key)
        if not c:
            continue
        color = CATEGORY_COLORS.get(key, C_WHITE)
        t.add_row(
            Text(c["label"], style=f"bold {color}"),
            str(c.get("nb_fonds") or "—"),
            Text(_mrd(c.get("aum")) + " MAD", style=C_CYAN),
            f"{c.get('weight', 0):.1f}%",
            _pct(c.get("weekly_growth")),
            str(f"{c['perf_index']:.2f}" if c.get("perf_index") else "—"),
            _flow_bar(c.get("net_flow")),
            _score_bar(c.get("score", 50)),
            _sparkline(cat_history[key]),
        )

    return t


def render_flows_table(data: dict) -> Table:
    cats  = data.get("categories", {})
    flows = data.get("flows", {})

    t = Table(
        title=f"[bold {C_ORANGE}]FLUX DE LA SEMAINE  (M MAD)[/]",
        box=box.SIMPLE_HEAD,
        border_style=C_MUTED,
        header_style=f"bold {C_ORANGE}",
        show_footer=True,
        expand=True,
    )

    t.add_column("CATÉGORIE",     style=C_WHITE, no_wrap=True, footer="[bold]TOTAL[/]")
    t.add_column("SOUSCRIPTIONS", style=C_GREEN,  justify="right",
                 footer=f"[bold {C_GREEN}]+{_num(flows.get('subscriptions'),0)}[/]")
    t.add_column("RACHATS",       style=C_RED,    justify="right",
                 footer=f"[bold {C_RED}]-{_num(flows.get('redemptions'),0)}[/]")
    t.add_column("FLUX NET",      justify="right",
                 footer=f"[bold {C_GREEN if (flows.get('net_flow') or 0)>=0 else C_RED}]"
                        f"{'+' if (flows.get('net_flow') or 0)>=0 else ''}"
                        f"{_num(flows.get('net_flow'),0)}[/]")
    t.add_column("% ENCOURS",     style=C_MUTED,  justify="right")

    for key in ["monetaire", "obligataire_mlt", "obligataire_ct", "actions", "diversifie", "contractuel"]:
        c = cats.get(key)
        if not c:
            continue
        color = CATEGORY_COLORS.get(key, C_WHITE)
        net = c.get("net_flow") or 0
        net_style = C_GREEN if net >= 0 else C_RED
        t.add_row(
            Text(c["label"], style=f"bold {color}"),
            Text(f"+{_num(c.get('subscriptions'), 0)}", style=C_GREEN),
            Text(f"-{_num(c.get('redemptions'), 0)}",  style=C_RED),
            Text(f"{'+' if net>=0 else ''}{_num(net, 0)}", style=net_style),
            f"{c.get('net_flow_pct', 0) or 0:+.2f}%",
        )

    return t


def render_insights(data: dict) -> Panel:
    insights = data.get("insights", [])
    body = Text()
    icons = ["◆", "◈", "▶", "●", "◉", "◇"]
    for i, insight in enumerate(insights):
        icon = icons[i % len(icons)]
        body.append(f"\n  {icon} ", style=C_ORANGE)
        body.append(insight + "\n", style=C_WHITE)
    return Panel(
        body,
        title=f"[bold {C_ORANGE}]◈ INSIGHTS AUTOMATISÉS[/]",
        border_style=C_CYAN,
        padding=(0, 1),
    )


def render_scores_table(data: dict) -> Table:
    cats = data.get("categories", {})
    t = Table(
        title=f"[bold {C_ORANGE}]SCORES OPCVM  (0–100)[/]",
        box=box.SIMPLE_HEAD,
        border_style=C_MUTED,
        header_style=f"bold {C_ORANGE}",
        expand=True,
    )
    t.add_column("CATÉGORIE", style=C_WHITE, no_wrap=True)
    t.add_column("SCORE",     justify="left")
    t.add_column("PERF",      style=C_YELLOW, justify="right")
    t.add_column("FLUX NET",  justify="right")
    t.add_column("RANG",      style=C_MUTED,  justify="center")

    sorted_cats = sorted(
        [(k, v) for k, v in cats.items() if v],
        key=lambda x: x[1].get("score", 0),
        reverse=True,
    )
    medals = ["🥇", "🥈", "🥉"] + ["  "] * 10

    for rank, (key, c) in enumerate(sorted_cats):
        color = CATEGORY_COLORS.get(key, C_WHITE)
        net = c.get("net_flow") or 0
        t.add_row(
            Text(c["label"], style=f"bold {color}"),
            _score_bar(c.get("score", 50)),
            str(f"{c['perf_index']:.2f}" if c.get("perf_index") else "—"),
            Text(f"{'+' if net>=0 else ''}{net:,.0f} M", style=C_GREEN if net >= 0 else C_RED),
            medals[rank],
        )
    return t


def render_history_sparklines(history: list[dict]) -> Panel:
    """Show AUM evolution for each category as ASCII sparklines."""
    if len(history) < 2:
        return Panel("[dim]Historique insuffisant[/]", title="AUM HISTORIQUE", border_style=C_MUTED)

    dates = [h["date"][-5:] for h in history]   # MM-DD

    body = Text()
    body.append(f"\n  Dates : {' '.join(d.rjust(7) for d in dates[-8:])}\n\n", style=C_MUTED)

    for key in ["monetaire", "obligataire_mlt", "obligataire_ct", "actions", "diversifie", "contractuel"]:
        vals = []
        label = key
        for snap in history:
            c = snap.get("categories", {}).get(key)
            if c:
                vals.append(c.get("aum"))
                label = c.get("label", key)
            else:
                vals.append(None)
        color = CATEGORY_COLORS.get(key, C_WHITE)
        spark = _sparkline(vals, width=8)
        latest_aum = next((v for v in reversed(vals) if v is not None), None)
        body.append(f"  {label:<16}", style=f"bold {color}")
        body.append(f"  {spark}  ", style=color)
        body.append(f"{_mrd(latest_aum):>10} MAD\n", style=C_CYAN)

    return Panel(
        body,
        title=f"[bold {C_ORANGE}]ÉVOLUTION AUM  (8 semaines)[/]",
        border_style=C_MUTED,
    )


# ── Main render ───────────────────────────────────────────────────────────────

def run_dashboard() -> None:
    console.clear()
    console.print()

    with console.status("[bold orange]Chargement des données OPCVM…[/]", spinner="dots"):
        latest, history = load_data()

    if latest is None:
        console.print(
            Panel(
                "[red]Aucune donnée disponible.[/]\n"
                "Lancez d'abord : [bold]python -m price_service.opcvm.ammc_pipeline[/]",
                title="ERREUR",
                border_style="red",
            )
        )
        return

    console.print(render_header(latest))
    console.print()
    console.print(render_kpis(latest))
    console.print()
    console.print(Rule(style=C_MUTED))
    console.print()
    console.print(render_category_table(latest, history))
    console.print()
    console.print(Columns([render_flows_table(latest), render_scores_table(latest)], equal=True, expand=True))
    console.print()
    console.print(Columns([render_history_sparklines(history), render_insights(latest)], equal=True, expand=True))
    console.print()
    console.print(Rule(f"[{C_MUTED}]WallStreet Morocco · OPCVM · data.gov.ma (AMMC)[/]", style=C_MUTED))
    console.print()


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    run_dashboard()
