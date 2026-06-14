# IEP Pal — Finance Workspace

Finance focus: **cost, revenue, and decreasing CAC**. This workspace is for understanding where money is going, where it's coming from, and what it costs to bring each new customer in.

**Start every session by reading the root `../CLAUDE.md`, then `../SESSIONS.md`, then `../STATUS.md`.** SESSIONS.md carries decisions and context from prior sessions. STATUS.md shows what's built vs. missing vs. on hold.

> **Note on workspace state:** The subfolders described in previous versions of this file (`financial-analyst/`, `saas-metrics-coach/`, `business-investment-advisor/`) do not currently exist. The working data lives in `Forecasts/`. See STATUS.md for build priority order.

---

## The three metrics that matter now

### 1. Cost / Burn Rate

*What are we spending, and how long can we sustain it?*

| Metric | Definition |
|---|---|
| Monthly burn | Total monthly expenses (payroll, tools, hosting, marketing, travel, etc.) |
| Net burn | Burn minus any revenue collected that month |
| Runway | `cash in bank ÷ net monthly burn` = months remaining |
| Cost breakdown | Fixed costs (recurring) vs. variable costs (per-activity) |

**Questions this answers:** Are we on track with our spending plan? Where is money going? How many months until we need to raise or reach profitability?

---

### 2. Revenue

*What are we earning, and from which sources?*

IEPPAL is purely B2B — all revenue comes from school contracts. There are no individual educator (B2C) subscriptions.

| Revenue stream | Description |
|---|---|
| Basic tier (B2B) | S$3,000/yr base + S$12/student IEP access + S$15/student AI tool (50% of IEP students). Add-ons: Strategy Library (S$99/educator/mo), PD Offerings (S$150/educator/mo), Data Migration (S$1,000 one-time) |
| Schools tier (B2B) | S$5,000/yr base + S$12/student IEP + S$12/student AI. Strategy Library included in access fee. Add-on: PD Offerings |
| Custom tier (B2B) | S$20,000/yr base + S$12/student IEP + S$10/student AI (white-label, enterprise). Plus Custom Feature Dev (recurring + non-recurring) and White-Label Licensing |
| Government grants | Non-operating, non-recurring — track separately, exclude from ARR/MRR |

**Key breakdowns:**
- ARR (Annual Recurring Revenue) by tier — the primary investor signal
- MRR (Monthly Recurring Revenue) — recurring only, exclude grants
- NRR (Net Revenue Retention) — target >100% by Y2Q3 (expansion ARR exceeds churn)
- ACV per school by tier — Basic ~S$2K–5K, Schools ~S$3K–7K, Custom ~S$28K–45K
- Revenue trend — Q-on-Q growth rate

**Questions this answers:** Is ARR growing quarter on quarter? Which tier is driving growth? Is NRR above 100% (a key signal of product-market fit)?

---

### 3. CAC — Customer Acquisition Cost

*What does it cost to bring in one new customer, and is that cost going down?*

**CAC formula:**
```
CAC = Total sales & marketing spend ÷ Number of new customers acquired
```

Track CAC separately for each school tier:
- **Basic tier CAC** — cost to close one Basic school contract
- **Schools tier CAC** — cost to close one Schools contract (higher ACV, worth more CAC)
- **Custom tier CAC** — cost to close one enterprise/white-label deal (longest sales cycle; first Custom client targeted Y2Q2)

**Track by channel:**

| Channel | Examples |
|---|---|
| LinkedIn | Paid posts, organic reach → demo requests |
| Direct outreach | Cold email, conference follow-up |
| Referral | Existing school recommends to another |
| Conference / event | Booth, talk, networking → pipeline |
| Inbound / organic | Website traffic, word of mouth |

**Questions this answers:** Which channel brings in customers most efficiently? Is CAC trending down as we get better at sales? Where should we invest more?

---

## Primary data source

`Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx`

This is the working financial model. When running any finance analysis, start here. Extract the relevant tabs and pass the data to whatever analysis tool or conversation is needed.

---

## How to run finance analysis sessions

Since the Python scripts described in earlier docs don't exist yet, finance analysis currently works by:

1. **Reading the Excel forecast** — load `Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx` and identify the relevant rows (revenue, expenses, customer counts by channel)
2. **Extracting to a working format** — copy the relevant data into a CSV or structured JSON in the session
3. **Doing analysis in-session** — Claude calculates the metrics directly from the data
4. **Producing output** — a written summary + a table of the key metrics

**Output format for finance sessions:**

```
## Finance snapshot — [month/period]

**Burn:** $X/month | Net burn: $X/month | Runway: X months

**Revenue:** S$X MRR | ARR: S$X | QoQ growth: +X% | Basic: X% | Schools: X% | Custom: X% | Grants (non-op): S$X

**CAC by tier:** Basic: S$X | Schools: S$X | Custom: S$X
Top channel: [channel] at S$X CAC | Trending: [up/down/flat]

**Flags:**
- [anything that needs attention]
```

---

## Finance tool build roadmap

When Python tools are built, build in this order:

| Priority | Tool | Input | Output |
|---|---|---|---|
| 1 | Burn rate + runway calculator | Monthly expense data (from Excel) | Runway months, burn breakdown, net vs gross burn |
| 2 | Revenue breakdown analyzer | Revenue by stream, by month | MRR, stream mix %, trend chart |
| 3 | CAC by channel tracker | Sales spend + new customers by channel | CAC per channel, trend, channel efficiency ranking |

**Python tool standards** (carry forward from original spec):
- Standard library only (math, statistics, json, argparse)
- `--format json` flag for piping to other tools
- No external API calls
- `--help` support via argparse

---

## ↓ When this file changes

Check and update the following files for stale content. Full details in `../../DEPENDENCIES.md`.

| File | What to check |
|---|---|
| `CLAUDE.md` (root) | Finance quick-reference section (3-metric list, metric definitions); Finance sub-repo entry |
| `STATUS.md` | Finance rows — tool status, build roadmap |
| `SESSIONS.md` | Open decisions — finance tool build priorities |

---

## Related files

- `SESSIONS.md` (root) — tracks open finance decisions and next priorities
- `STATUS.md` (root) — tracks which finance tools exist vs. are missing
- `../ieppal-software/IEPPAL-RASA-FE/` — the product; finance metrics inform which features to prioritize
