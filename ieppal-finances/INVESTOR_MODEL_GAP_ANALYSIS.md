# IEP Pal — Investor Financial Model Gap Analysis

**Date:** 2026-05-27 (updated after Google Drive review)  
**Sources examined:**
- `ieppal-finances/Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx` (8 sheets)
- Google Drive: `IEPPAL_Pitch_Deck` (12 slides, Seed Round June 2026)
- Google Drive: `IEPPAL - Business Plan Overview` (full BMC, market sizing, GTM, financials, term sheet)
- Google Drive: `IEPPAL Competitor Analysis Master Doc`

---

## ⚠️ Critical findings from Google Drive review

These issues need to be resolved **before any investor meeting**. They are inconsistencies across documents that an investor will catch.

### 1. Revenue figure mismatch between pitch deck and Excel model

| Year | Pitch deck | Excel model | Gap |
|---|---|---|---|
| Y1 | S$12,766 | S$12,731 | ~S$35 (minor) |
| Y2 | S$74,728 | S$59,026 | **S$15,702 (27% higher in deck)** |
| Y3 | S$209,334 | S$142,745 | **S$66,589 (47% higher in deck)** |
| 3-yr cumulative | S$307,808 | S$214,502 | **S$93,306 (44% higher in deck)** |

The pitch deck references "Mita Overview 2 base case" — this appears to be an earlier or alternative model version. **Investors will notice if the deck and the model they're sent don't match.** The Excel model is the more conservative, detailed, and defensible number. The pitch deck likely needs updating to match.

### 2. Primary market inconsistency: Singapore vs. Australia

The pitch deck says "Land in India. Expand to **Singapore**. Scale to Australia & beyond." The GTM section opens with Singapore as the expansion target.

The business plan's GTM section, market sizing, and SOM analysis focus **primarily on Australia** (Melbourne → Sydney → Brisbane), with detailed school counts and penetration targets for Australian private schools.

The Excel financial model uses a mix — Singapore schools in early quarters, Custom deals that could be either market.

**These three documents describe three different primary markets.** An investor asking "where are you selling first?" will get a different answer depending on which document they're reading.

### 3. Student pricing inconsistency

| Tier | Excel model IEP fee/student | Business plan IEP fee/student |
|---|---|---|
| Basic | S$12 | S$10 |
| Schools | S$12 | S$10 |
| Custom | S$12 | S$10 |

The business plan shows a lower IEP per-student fee than the Excel model. This affects all ARR calculations. One of these is wrong.

### 4. Ethics section template contamination

The business plan's Ethics & Communication section contains copy-pasted content from what appears to be a dating/social app template. It references "dating and networking platforms," "two-sided marketplace," "IEPPAL Passport loyalty layer," "verified venues for meetups," and "facial recognition." None of this applies to IEP Pal. **This section must be replaced before any investor reviews the document.**

### 5. Pre-money valuation and raise amount are blank

The business plan's Founder Term Sheet section has blank fields for offering size, issue price, pre-money valuation, and post-money valuation. The Excel model uses S$185,000 as a placeholder raise with a note flagging it for update. The pitch deck doesn't state a raise amount either. **Angels will ask the raise amount and valuation in the first meeting.**

---

## 1. What angel investors look for in a B2B SaaS pre-seed model

Angel investors evaluating a B2B SaaS at pre-seed — especially in EdTech — are making a small number of high-leverage bets. They aren't doing DCF. They're asking five questions:

1. **Is the unit math defensible?** LTV:CAC, CAC payback, gross margin, NRR.
2. **How much runway does the raise buy, and toward what milestone?** Burn rate, use of funds, and the specific metric that unlocks the next raise.
3. **How large is the opportunity?** TAM/SAM/SOM, with a credible path from SAM to IEP Pal's addressable slice.
4. **What does the upside look like?** A best-case scenario modelled honestly — what happens if sales moves faster and churn is lower.
5. **What happens to my stake?** Cap table, pro-forma dilution, what Series A looks like for the angels.

---

## 2. Priority stack of required models

### Tier 1 — Investor meeting blockers (must exist before any angel meeting)

| Model | Status after Drive review | What remains |
|---|---|---|
| **Scenario Analysis (Bull / Base / Bear)** | ❌ Still missing | No scenario analysis exists in any document |
| **Use of Funds** | 🟡 Partial — pitch deck has 40/30/20/10 split | Percentages exist but don't map to the Excel cost structure; raise amount is blank |
| **TAM / SAM / SOM** | 🟡 Partial — pitch deck has top-line numbers; business plan has sourced market data | TAM methodology not shown; SOM calculations for Australia are started but incomplete; Singapore SOM not broken out; pitch deck numbers not reconciled with business plan |
| **Break-even / Profitability Path** | ❌ Still missing as a standalone analysis | Implicit in P&L (EBITDA turns marginally positive ~Y3Q3) but not surfaced cleanly |
| **Cap Table + Dilution Model** | 🟡 Framework exists — term sheet has governance structure, 15% ESOP noted | Pre-money valuation, offering size, and issue price are all blank |

### Tier 2 — Due diligence essentials

| Model | Status after Drive review | What remains |
|---|---|---|
| **Cohort Analysis** | ❌ Still missing | Template needed; data arrives post-launch |
| **Sales Funnel / Pipeline Model** | 🟡 Partial — outreach tracker and demo leads spreadsheet in Drive | Quantified close rates, deal velocity, and pipeline-to-revenue model not built |
| **CAC by Channel** | 🟡 Partial — business plan identifies channels (cold outreach, referral, conference, LinkedIn) | No spend-per-channel or CAC-per-channel calculation built yet |
| **Burn Multiple** | ❌ Still missing | Formula on existing data; quick to add |
| **Competitive Landscape** | ✅ Exists — detailed competitor analysis doc in Drive | Needs to be surfaced in the Excel model as a benchmarking tab |

### Tier 3 — Series A prep

| Model | Status after Drive review |
|---|---|
| **Revenue Quality Analysis** | ❌ Missing |
| **Comparable Company Benchmarks** | 🟡 Partial — competitor analysis has product features; no financial benchmarks |
| **Series A Readiness Tracker** | 🟡 Framework in business plan (milestone table) but KPI targets are blank placeholders |
| **Rule of 40** | ❌ Missing |

---

## 3. What already exists across all documents

### Excel model (detailed inventory)

| Sheet | Status | Investor-readiness |
|---|---|---|
| **Key Assumptions** | ✅ Complete | Pricing, churn, seasonality, AI cost, headcount — all documented with rationale. Two ⚠ placeholder flags (funding amount, close date) need real inputs. |
| **Income Statement** | ✅ Complete | Solid 12-quarter P&L. Compliance costs appear in both COGS and G&A — minor reclassification needed. |
| **Unit Economics** | ✅ Strong | CAC per quarter/annually, variable COGS per student, LTV by tier, LTV:CAC by tier, gross margin %, ARPA, CAC payback period, NRR, ACV per school. Model notes are clear. |
| **ARR Waterfall** | ✅ Strong | ARR by tier, new/expansion/churn waterfall, MRR, NRR, Quick Ratio, QoQ growth %. |
| **Account Waterfall** | ✅ Solid | School contract counts by tier, churn, implied leads at 20% close rate. 3-quarter lead-to-revenue lag documented. |
| **Headcount Plan** | ✅ Complete | Quarterly headcount by role and location. |
| **Balance Sheet** | 🟡 Partial | Y3Q4 balance check shows **S$1,731 discrepancy — needs fixing before investor review.** |
| **Cash Flow** | 🟡 Partial | Operating activities populated; investing and financing mostly empty. Works as runway tracker. |

### Pitch deck (new findings from Drive)

| Element | Status | Notes |
|---|---|---|
| TAM/SAM/SOM | 🟡 Exists — top-line numbers only | TAM $4.2B / SAM $620M / SOM $42M. No methodology shown on the slide. |
| Use of Funds | 🟡 Exists — percentage allocation only | 40% product / 30% GTM / 20% ops & compliance / 10% working capital. Dollar amounts not shown. |
| Milestone map | ✅ Exists | 3–5 schools by Q2 2027 / first enterprise deal Q3 2027 / Sales hire SG / AI feature live / Series A by Y3 |
| Financial forecast | ⚠ Inconsistent with Excel | Y2 and Y3 revenues differ significantly from the Excel model (see Section above) |
| Competitive landscape | 🟡 Slide exists | Visual matrix — detail lives in competitor analysis doc |
| Team | ✅ Complete | Ansel (CEO), Ian (Research), Niranjan (CTO) with background narrative |

### Business plan (new findings from Drive)

| Element | Status | Notes |
|---|---|---|
| BMC | ✅ Detailed | Full Business Model Canvas with customer segments, value props, channels, key activities |
| Market sizing | 🟡 Sourced but incomplete | Singapore and Australia data with citations (MOE, ABS, ACARA). Calculation tables are framework only — TAM/SAM/SOM outcome cells are blank |
| Competition & SWOT | ✅ Exists | 7 competitors analysed (SimpleIEP, MARIO Education, Education Modified, PowerSchool, Veracross, Schoology, Khan Academy). SWOT table complete. |
| GTM strategy | ✅ Detailed | Phased execution tables by quarter across 3 years, post-launch growth flywheels, operational scaling model |
| Financial model summary | 🟡 Partial | Cost structure table, unit economics table (CAC by year populated; LTV, LTV:CAC, payback period all blank) |
| Founder term sheet | 🟡 Framework only | Governance structure, ESOP 15%, liquidation preference 1x, ROFR, drag-along, tag-along described. Valuation and raise amount blank. |
| KPI framework | 🟡 Stub | Table headers exist; all content cells are blank |
| Ethics section | 🔴 Contaminated | Contains copy-paste from a dating app template — must be replaced before investor review |

---

## 4. Gap analysis — what's missing and what data is needed

### Gap 1: Scenario Analysis (Tier 1 — blocker)

**What's missing:** No scenario analysis exists in any document. Single base-case only.

**What's needed to build it:**
- Base case inputs already exist in Key Assumptions
- Bear case: churn → 8%, no Custom client until Y3Q1, sales velocity -30%
- Bull case: churn → 3%, Custom client Y1Q4, sales velocity +30%

**Data gap:** None — all inputs already exist in the Excel model. Pure modelling task.

**Skill to build:** `scenario-analyzer` — three-scenario comparison table showing ARR by year, break-even quarter, runway, and LTV:CAC at Y2Q4 for each scenario.

---

### Gap 2: Use of Funds (Tier 1 — blocker)

**What partially exists:** Pitch deck has a 40/30/20/10 split. Business plan has a blank use of proceeds table.

**What's still missing:**
- The dollar amounts for each category
- Reconciliation of the % split against the actual Excel cost structure
- The raise amount itself (still S$185K placeholder in Excel; blank in business plan and pitch deck)
- The milestone that this raise funds toward (pitch deck has milestones but they're not tied to specific spend)

**Data gap:** Founder decision needed on raise amount and pre-money valuation.

**Action:** Map the 40/30/20/10 split against the Excel quarterly costs. 40% product ≈ engineering + AI dev; 30% GTM ≈ sales salaries + marketing + conferences; 20% ops ≈ GDPR + pen testing + legal; 10% buffer. Validate the percentages against actual cost line items.

---

### Gap 3: TAM / SAM / SOM (Tier 1 — blocker)

**What partially exists:**
- Pitch deck: $4.2B TAM / $620M SAM / $42M SOM (top-line numbers without methodology)
- Business plan: Detailed sourced data for Singapore (35,500 SEN students, 315 private schools) and Australia (1,062,638 students with disability adjustments, 2,926 independent schools). SOM penetration model started for Australia.

**What's still missing:**
- TAM: The calculation behind $4.2B isn't shown. ~15,000 schools × average ACV is the likely formula but needs to be written out
- SAM: Asia-Pacific focus (~2,500 international schools) isn't reconciled with the business plan's Australia-first GTM
- SOM: Australia SOM has school counts but the revenue figures are "SGD XXX" placeholders. Singapore SOM isn't broken out separately despite being the primary market in the pitch deck.
- **The geographic inconsistency (Singapore vs. Australia as primary market) means the SAM/SOM framing is different in every document** — this needs resolving before the TAM can be finalized

**Data gap:** No additional external research needed — the business plan has sourced market data from MOE, ABS, ACARA, CNA. The calculation cells just need to be filled in.

**Action:** Decide the primary geographic market. Then build the SOM bottom-up: (target schools) × (% penetration by year) × (average ACV by tier). This reconciles the business plan's school counts with the Excel model's revenue projections.

---

### Gap 4: Break-even Analysis (Tier 1 — blocker)

**What partially exists:** P&L shows EBITDA turning marginally positive in Y3Q3. ARR waterfall shows ending ARR of ~S$220K by Y3Q4.

**What's still missing:** A clean break-even analysis surfacing: (a) the ARR level at which IEPPAL covers its cost base, (b) how many schools of each tier that requires, (c) the quarter it maps to under each scenario.

**Data gap:** None. Derivable entirely from existing Excel data.

---

### Gap 5: Cap Table + Dilution Model (Tier 1 — blocker)

**What partially exists:** The business plan's Founder Term Sheet has governance terms (ESOP 15%, 1x liquidation preference, ROFR, drag-along, tag-along). Exit thesis is stated: strategic acquisition by PowerSchool / VeraCross / Schoology.

**What's still missing:** Pre-money valuation, offering size, issue price, post-money valuation, current share structure. All are blank.

**Data gap:** Founder decision. Once valuation and round size are decided, the model is straightforward to build.

---

### Gap 6: Revenue Figure Reconciliation (Immediate — pre-meeting)

**What's wrong:** Pitch deck shows Y2 revenue S$15,702 higher (27%) and Y3 revenue S$66,589 higher (47%) than the Excel model. The pitch deck references "Mita Overview 2 base case" — likely an earlier, more optimistic model version.

**Action:** Update the pitch deck financial slide to match the Excel base case. Alternatively, if the pitch deck numbers represent a bull case, label them clearly as such.

---

### Gap 7: Ethics Section Replacement (Immediate — pre-meeting)

**What's wrong:** The business plan's Ethics & Communication section contains copy-paste from a dating/social app template (references facial recognition, venue partners, meetup safety, "IEPPAL Passport loyalty layer", "two-sided marketplace"). None of this applies to IEP Pal.

**Action:** Replace the entire section with IEP Pal-appropriate content: data privacy and GDPR compliance framework, student data protection principles, AI ethics commitments (human-in-the-loop, no autonomous IEP decisions), and IEPPAL's stance on educator trust.

---

### Gap 8: Unit Economics Completion in Business Plan

**What partially exists:** Business plan unit economics table has CAC filled in (Y1: S$576, Y2: S$286, Y3: S$205 per active user). LTV, LTV:CAC, and payback period cells are blank. These figures exist in the Excel model's Unit Economics sheet and need to be carried across.

**Note:** The business plan's CAC is measured per "active user" while the Excel model measures per "school account" — these are different denominators. Per-user CAC is much lower than per-account CAC but is not the right metric for B2B SaaS. The Excel's per-account CAC (ranging from S$500 to ~S$3,550 depending on tier and quarter) is the investor-grade metric.

---

### Gap 9: KPI Framework Completion

**What partially exists:** Business plan has a full KPI framework table with five category headers (Market Penetration, Growth & Retention, Financial Metrics, Unit Economics, Organisational Milestones) but all content rows are blank.

**Data gap:** None — all KPIs can be sourced from the Excel model and GTM milestones.

---

### Gap 10: Competitive Benchmarking in Excel Model

**What exists in Drive:** Full competitor analysis with a product feature matrix (7 competitors) and SWOT. This was not reflected in the Excel model at all.

**What's missing from the Excel:** A benchmarking tab comparing IEPPAL's financial metrics (ACV, gross margin, CAC payback, NRR) against public/known data for comparable EdTech SaaS companies. Angels often ask "how do these metrics compare to MARIO Education or Education Modified at the same stage?"

---

### Gap 11: Balance Sheet Data Integrity (Immediate fix)

**What's wrong:** Y3Q4 deferred revenue balance goes negative (–S$1,731.50), breaking the balance sheet check.

**Action:** Fix the deferred revenue formula in Y3Q4 before any investor review.

---

## 5. Summary: revised gap severity map

| Gap | Severity | Change from prior analysis | Action needed |
|---|---|---|---|
| Revenue figure reconciliation (deck vs. Excel) | 🔴 Blocker | **NEW** — found in Drive review | Update pitch deck financials to match Excel |
| Ethics section contamination | 🔴 Blocker | **NEW** — found in Drive review | Replace entire section |
| Geographic market inconsistency | 🔴 Blocker | **NEW** — found in Drive review | Decide SG-first vs AUS-first; align all docs |
| Pre-money valuation / raise amount | 🔴 Blocker | **NEW** — confirmed blank in all docs | Founder decision needed |
| Scenario Analysis | 🔴 Blocker | Unchanged | Build from existing Excel inputs |
| Use of Funds (dollar amounts) | 🟡 Partial | **Updated** — % split exists in deck | Map % to Excel cost line items |
| TAM/SAM/SOM (calculations) | 🟡 Partial | **Updated** — numbers exist; methodology incomplete | Fill in SOM calculation cells in business plan |
| Break-even analysis | 🟡 Partial | Unchanged | Derive from existing P&L |
| Cap Table | 🟡 Framework exists | **Updated** — term sheet governance terms exist | Add valuation, share counts |
| Unit economics completion | 🟡 Partial | **Updated** — CAC exists; LTV blank | Carry LTV/LTV:CAC from Excel into business plan |
| KPI framework | 🟡 Stub | **Updated** — structure exists | Populate from Excel + GTM milestones |
| Competitive benchmarking (financial) | 🟡 Partial | **Updated** — product analysis exists; financial benchmarks missing | Add benchmarking tab to Excel |
| Cohort Analysis | 🟡 Tier 2 | Unchanged | Build template; populate post-launch |
| CAC by channel | 🟡 Tier 2 | Unchanged | Channels identified; spend attribution not built |
| Burn Multiple | 🟡 Quick add | Unchanged | Formula on existing data |
| Balance Sheet fix | ⚠ Integrity | Unchanged | Fix Y3Q4 formula |

---

## 6. Recommended action sequence

**Immediate (before any investor meeting):**

1. **Fix the revenue discrepancy** — update pitch deck financial slide to match Excel base case, or clearly label as bull/base/bear.
2. **Replace the ethics section** — rewrite for IEP Pal's actual data privacy and AI ethics principles.
3. **Decide the primary market** — Singapore or Australia as Phase 1. Align all three documents.
4. **Fix the Y3Q4 deferred revenue bug** in the Excel model.

**Before first angel meeting (within 1 week):**

5. **Set valuation and raise amount** — unlock cap table model, use of funds dollar amounts, and term sheet completion.
6. **Build scenario analysis** — three-scenario comparison from Excel base assumptions.
7. **Complete TAM/SAM/SOM calculations** — fill in the business plan's blank calculation cells using existing sourced data.
8. **Map use of funds to Excel cost lines** — match 40/30/20/10 split to actual quarterly costs.

**Within 2 weeks of first meeting:**

9. **Complete unit economics in business plan** — carry LTV, LTV:CAC, payback period from Excel to business plan.
10. **Populate KPI framework** — fill in the blank KPI table using Excel metrics and GTM milestones.
11. **Add burn multiple** to ARR Waterfall.
12. **Add competitive benchmarking tab** to Excel using competitor analysis data.

**Post-launch (once schools are live):**

13. **Cohort analysis template** — build now; populate with actual school data once live.
14. **CAC by channel tracker** — structured log once outreach spend is tracked by source.

---

## 7. What the documents are doing well

The combination of documents is genuinely strong for a pre-seed EdTech company:

- **Unit economics in the Excel model** are investor-grade — LTV:CAC, CAC payback, gross margin, NRR, ARPA all present with methodology notes.
- **The competitor analysis** is thorough (7 competitors, product matrix, SWOT). Most pre-seed companies don't have this.
- **The traction narrative** is real and cited — 400+ educators, 7 countries, live pilot at RASA India, named pipeline schools (SAS, Tanglin Trust, Brighton College Bangkok).
- **The term sheet framework** in the business plan shows founder sophistication — ESOP, ROFR, drag-along, lock-up, and exit thesis are all present.
- **The GTM phased execution** with quarterly KPI milestones and growth flywheels is more detailed than most pre-seed business plans.

The main gaps are: document consistency (revenue numbers, geography, pricing), blank calculation cells, and the ethics section contamination. None of these require new research or data — they're editing and decision tasks.

---

## 8. Changes made in this update (from Drive review)

| Section | Change |
|---|---|
| Critical findings | **NEW section** — added 5 critical issues found across Drive documents |
| Priority stack Tier 1 | Updated status for Use of Funds (🟡), TAM/SAM/SOM (🟡), Cap Table (🟡) |
| Priority stack Tier 2 | Updated competitive landscape status (✅ — exists in Drive) |
| Section 3 | **Added** pitch deck inventory and business plan inventory as new subsections |
| Gap 2 (Use of Funds) | Updated — % split now exists; dollar mapping still needed |
| Gap 3 (TAM/SAM/SOM) | Updated — sourced market data exists; calculations incomplete; geographic inconsistency added |
| Gap 5 (Cap Table) | Updated — governance terms exist; valuation blank |
| Gaps 6–11 | **NEW** — Revenue reconciliation, ethics contamination, geographic inconsistency, unit economics completion, KPI framework, competitive benchmarking |
| Gap severity map | Fully revised — 5 new blockers identified |
| Action sequence | Reorganised — added immediate actions before first-week actions |
| "What's working well" | Updated to include competitor analysis, traction narrative, term sheet framework |

---

*Generated: 2026-05-27*  
*Sources: Excel model (8 sheets) + Google Drive (pitch deck, business plan, competitor analysis)*
