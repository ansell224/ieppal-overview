# IEP Pal — Project History

*Last updated: May 2026. This document is a historical record synthesized from Google Drive files, Canva design assets, interview transcripts, pitch decks, and business planning documents. Intended as persistent context for AI sessions that need to understand what decisions were made and why.*

---

## Overview

IEP Pal (stylized IEPPAL — "IEP + Pal, a buddy for your learning support journey") is a B2B SaaS platform for special education and learning support teachers at private and international K-12 schools. Its core premise is replacing fragmented spreadsheets and static PDF documents with a centralized, data-driven IEP management system. The product's one-liner is "The living IEP platform built for teachers, not administrators." IEP Pal was founded in 2024 by Ansel Natarajan and Ian Wilson, both Singapore American School (SAS) alumni, and later joined by Niranjan P. as CTO. As of May 2026, the product has one live pilot school (RASA, India), an active seed fundraise underway, and a pipeline of warm leads across Singapore, Australia, and India.

---

## Chronological Timeline

### March–April 2024: Academic Origins and Brand Naming

The earliest recorded work on IEP Pal dates to March 2024, when logo and branding explorations began on Canva — 38 iterations on the "IEP" name and visual identity. In April 2024, the first Business Model Canvas (BMC) and Value Proposition Canvas (VPC) were created, representing the first documented articulation of the business logic. A second, more detailed BMC + VPC multi-page document (7 pages) was also produced that month.

The main Google Drive folder ("IEPPAL") was formally created on April 12, 2024, which marks the earliest recorded date of organized project work. At this stage, the product was still conceptual — there was no prototype and no formal team. The naming convention used "IESP" (Individualized Education Support Plan), which was SAS-specific terminology, rather than the universal "IEP."

### May 2024: Founding Research — Ian Wilson's SAS Thesis

In May 2024, Ansel Natarajan and Ian Wilson graduated from Singapore American School. Prior to graduation, Ian Wilson had conducted a formal mixed-methods teacher needs assessment at SAS — a 122-page academic work (referred to as "Thesis Talk" in Canva) that formed the founding evidence base for IEP Pal.

Wilson surveyed six SAS teachers on their preferences for IEP/IESP system features using a 7-point Likert scale. The findings established the product's core design priorities:

- Security: 7.0/7.0 — teachers cited child protection concerns with document transfer as the top issue
- Accessibility: 6.83/7.0 — navigating between students was described as too slow
- Organization: 6.83/7.0 — "The system is currently horrible, it's really hard for me to find students"
- Exports/Shareability: 6.33/7.0
- User Support: 6.16/7.0
- Aesthetics: 5.0/7.0 — teachers wanted it to "not look like a database"

The motivating anecdote that anchored the founding narrative: a student passed through all of middle school without accommodations because their IEP was never transferred when they moved schools. This case became the founding story used in all subsequent pitch decks.

Also in May 2024, Rahul Cortez (an early collaborator, later sometimes referred to as Matthew) conducted semi-structured parent interviews at SAS. His research — documented in a 67-page Canva presentation finalized in October 2024 — established the parent-side evidence base: support services were not tailored to individual students, parent-school communication was broken, updates were too infrequent (once per quarter), and documents were inaccessible to non-experts.

### June 2024: First Outreach and Early Prototype

An outreach tracker was created on June 8, 2024. At this stage, the team described themselves as "planning to co-found" — not yet formally a company. Early outreach went primarily through LinkedIn, targeting SAS alumni and international school educators. The framing was discovery-oriented: learning about IEP/IESP pain points rather than pitching a product.

The first live URL for a prototype appeared in June 2024: `https://5fe9b772.ieppal-info.pages.dev/` — a very early build hosted on Cloudflare Pages. A video walkthrough of this first prototype was shared with educators via a Google Form for feedback. Early contacts spanned educators at SAS, Vinschool Vietnam, UWCSEA, Nexus International School Malaysia, and Brighton College Bangkok.

### June–November 2024: Validation Phase

Over a period of approximately six months, the team contacted more than 400 educators across seven countries (Singapore, Australia, India, the United States, the United Kingdom, Vietnam, and Thailand). Structured interviews were conducted with more than ten educators. Documented interviewees include Qazi Fazli Azeem, CJ Maloney, Carmela Vina Kristensen, Jerome Lingo, Neil McCulloch, Jenn McCoy, Karen Ka Yan Leung, Nandita Mohan, and Chris Smith.

The most important finding from this validation phase was a pivot in the problem hypothesis. The initial assumption was that teachers were struggling with too much data or the burden of data entry. Interviews consistently revealed the opposite: teachers were not drowning in data volume — they were drowning in fragmentation. Data lived across multiple disconnected systems with no actionable signal emerging. This reframe reshaped the entire product direction.

The VPC Version 1 hypotheses — focused on standardization and data entry — were revised into VPC Version 2 by October 2024, which named the validated problems: lack of scalability (IEPs based on individual observations don't scale), language barriers created by formulaic IEP language, students not being consulted in their own IEPs, tedious multi-spreadsheet tracking with no longitudinal view, no feedback mechanism for teachers, and excessive documentation crowding out meaningful teacher-student relationships.

### September–October 2024: First UI Mockup and SAS Consultancy Project

In September 2024, a 19-page first UI mockup was produced in Canva under the name "IEPPAL UI V1 (Teacher-facing)." This represented the first visual concept of what the product could look like. It included a Google/Veracross/email login, a dashboard organized by class periods matching SAS's A1-A8 schedule structure, student profiles with functional needs and disability identification, a Video Entry Log for student-recorded progress updates, a Data Dashboard with goal management and an AI Strategy Library, messaging between teachers and parents, IXL Math integration, MAP Test and Acadience Assessment data, and a Community Hub with external resources and podcasts co-created by the founders.

Many of these features — particularly the Video Entry Log, Community Hub, and student self-advocacy tools — were later dropped from the product scope as the team narrowed to teacher-first and admin-facing functionality.

Also in October 2024, a 43-page SAS consultancy project presentation was completed, documenting the team's work building an early prototype within SAS's existing systems using Google Scripts to transfer Google Doc data into a Google Sheet. This prototype revealed the limits of a Google-native approach: it still required editing in Google Docs, carried security risks, and the parsing was described as "finicky." A second iteration added soft saves for comments, an IESP History tab, and a summarized accommodations view. Post-prototype sentiment analysis showed improvements in accessibility and support perceptions, but clarity negatives increased — a finding that influenced the eventual decision to build a purpose-built web application rather than extend Google Workspace tools.

At this stage, the founding team listed in Canva materials was Ansel Natarajan, Ian Wilson, and Rahul (Matthew) Cortez — all three designated as co-founders.

### November 2024: MVP V1 Shipped and Competitor Analysis Begun

MVP Version 1 was shipped in November 2024. A video walkthrough was recorded and shared with educators who could not take structured interview slots. Feedback was collected via Google Form. A Competitor Analysis Master Document was created in November 2024 and continued to be updated through at least March 2026. At this stage, the Pitching folder had not yet been created and the team was not yet in formal investor conversations.

### February 2025: MVP V2, Pitching Begins

A 440 MB MVP video was recorded on February 10, 2025. The Pitching folder was created on February 6, 2025, and the IEPPAL Context/Mission pitch presentation — used for early investor and partner conversations — was created that same day. By February 2025, the team had moved from pure discovery and validation into seeking a "partner school" for advocacy and early-stage seed investment. They were re-interviewing key stakeholders and beginning structured financial planning.

### March 2025: Technical and AI Advisory Interviews

Two key advisory interviews were conducted in March 2025 that shaped the product's technical roadmap.

Ryan Tannenbaum's interview focused on data architecture and AI model selection. The central decision was on-premises versus cloud deployment. The outcome: cloud-hosted infrastructure using Azure or AWS Bedrock, combined with strict data protection practices. Tannenbaum advised using temperature-zero LLMs for consistency in IEP-related outputs and a classifier-model approach for deterministic recommendations rather than open-ended generation — a recommendation that directly shaped how the AI Assistant feature was later scoped.

Manish Mandan's interview focused on data collection methodology: how to track quantitative versus qualitative IEP goals, how to align with standards (MAP, AP, IB), and how continuous data collection could feed an AI student profile system. A second MVP video was recorded on March 15, 2025 (259 MB .MOV).

### June–October 2025: Compliance, Strategy Library, and RASA Pilot Setup

Data Security work became a formal workstream in June 2025. An IEPPAL PDPA Compliance document was created in June 2025, working through Singapore's Personal Data Protection Act obligations in detail. A GDPR Compliance document followed in July 2025. These documents established the legal and compliance foundation for operating in Singapore and internationally.

In August 2025, an IEPPAL Strategy Library Research Template was created — a structured template for educators to document, cite, and assess learning interventions. The Strategy Library (a curated, research-backed intervention database attached to student profiles) was one of the most-requested features from teacher interviews and was designated a Y2 Q1 roadmap item.

Also in August–September 2025, the full backend architecture was mapped in Canva (four user profiles: Admin, Teacher/SEN Teacher, Student, Parent; 2FA email authentication; institution-level IEP template customization; cascading role-based permissions). A RASA-specific backend map was produced in September 2025, reflecting a stripped-down MVP scope for the India pilot. This coincides with Niranjan P. joining as CTO and taking over all product engineering.

### November 2025: Business Plan Formalized

The IEPPAL Business Plan Overview document was created on November 3, 2025. This was the first comprehensive document containing a full Business Model Canvas, market sizing, go-to-market strategy, financial model, unit economics, competitive analysis, and governance structure. A new outreach tracker for the 2025-26 academic year was created on December 21, 2025.

### January–February 2026: MVP UI Critique and Vulnerability Documentation

In January 2026, an IEPPAL product requirements spreadsheet was shared with the developer. This document showed development status across admin, teacher, and student flows, and formally documented known bugs and vulnerabilities: login invalidation after inactivity, four high-severity backend vulnerabilities, 25 frontend vulnerabilities (one critical), and the need to migrate from Create React App to Vite.

On February 17, 2026, Ansel created the MVP UI Notes/Discussion document — a detailed design critique of the MVP requesting color accents, improved navigation, cleaner data visualization, and a layout change to show IEPs above goals in the student profile view. This document became the basis for the UI refinement work that carried into the current frontend.

### March 2026: White Paper Published

"IEP Pal's Why & How: A Solution to Learning Support System Redesign" — a formal academic white paper authored by Ansel Natarajan, Ian Wilson, and Niranjan P. — was published in March 2026. The paper synthesizes Wilson (2024), Cortez (2024), and the 2024 international interview analysis into a peer-reviewable document, and formally establishes the Street Data Framework (Safir & Dugan, 2021) as the product's theoretical foundation. The Street Data Framework prioritizes Map and Street-level data — qualitative observations, student reflections — over Satellite data (standardized test scores), which maps directly to IEP Pal's emphasis on teacher-facing qualitative tracking alongside quantitative goal data.

### April 2026: SAS Meeting

A meeting was held with Jennifer Foss, Director of Personalized Learning at Singapore American School, on April 8, 2026 at 9:30am on-site at SAS. Kyle Aldous (Director of Communications at SAS) was the warm contact who facilitated the introduction. The SAS IEP Document template was last modified on April 18, 2026, suggesting it was updated following this meeting. SAS remains at the pipeline stage rather than a confirmed pilot as of May 2026.

### May 2026: Seed Round Pitch Materials

Two investor pitch decks were created in May 2026. The 12-page "IEPPAL_Pitch_Deck.pptx" — the primary seed round deck for a June 2026 raise — was created on May 14, 2026. A 16-page "IEP Pal Deck 15 May 2026" was created a day later with a slightly different framing and structure. The Business Plan Overview was last updated May 14, 2026. The current outreach tracker was last modified May 19, 2026.

The 12-page deck presents the team as Ansel (CEO), Ian (Head of Research), and Niranjan (CTO). The 16-page deck is tagged to Ansel and Ian only. Both decks use the "Andrew" persona — a new SAS student with ADHD — to illustrate the IEP journey problem. Key traction claims: 400+ educators contacted, 7 countries, 10+ structured interviews, one live pilot (RASA India).

---

## Team Evolution

**Ansel Natarajan (Co-Founder and CEO)** has led product and commercial work from the project's inception. He conducted the majority of outreach, led the structured educator interviews during the 2024 validation phase, authored the MVP UI critique in February 2026, and is leading the current fundraise. He graduated from Singapore American School in May 2024.

**Ian Wilson (Co-Founder and Head of Research)** designed and conducted the original teacher needs assessment at SAS that established the product's evidence base. His 122-page thesis (May 2024) is the founding research document. He co-authored the March 2026 white paper. He graduated from SAS alongside Ansel in May 2024.

**Rahul Cortez (early collaborator, listed as co-founder through October 2024)** conducted the parent interview study at SAS in 2024 (Cortez, 2024), which provided the parent-side evidence base. He was listed as a co-founder in the September 2024 UI mockup materials alongside Ansel and Ian. He is not listed in the May 2026 seed round pitch decks. His precise role transition is not documented in available materials.

**Niranjan P. (Co-Founder and CTO)** is a software developer based in India who joined the team by approximately August–September 2025, coinciding with the production of the backend architecture maps and the RASA pilot setup. He has led all product engineering and built and deployed the MVP. He is co-author of the March 2026 white paper. He is listed on the 12-page seed deck as CTO.

**Marcus and Aaron** appear in the Canva materials from the SAS consultancy project (October 2024) alongside Ansel, Ian, and Rahul — suggesting they were part of a broader SAS school-based project group, though they are not listed in subsequent founder or team materials.

---

## Product Evolution

**Stage 0: Google-Native Prototype (September–October 2024)**
The first working prototype was built using Google Apps Script to transfer Google Doc IEP data into a Google Sheet within SAS's existing Google Workspace environment. This approach surfaced fundamental limitations: editing still required Google Docs, data parsing was unreliable, and security risks were inherent to the Google Docs sharing model. Post-prototype user sentiment showed improved accessibility perceptions but increased clarity concerns.

**Stage 1: First UI Mockup (September 2024)**
A 19-page Canva mockup depicted a purpose-built web application with login via Google, Veracross, or email; class-period-organized dashboards; student profiles with functional needs and disability identification; a Video Entry Log (student-recorded progress); a Data Dashboard with AI Strategy Library; IXL Math and MAP Test integrations; a messaging system; and a Community Hub with external resources. This vision was significantly broader than what was ultimately built.

**Stage 2: MVP V1 (November 2024)**
The first real product, shipped in November 2024. Features included login and account management, an admin dashboard for IEP template creation and custom field configuration, teacher flows for creating classes and students, filling IEP templates, and creating goals, basic quantitative goal tracking with manual data entry and simple data visualization, learning standards setup, data export, and role-based access control. The frontend was built in React (using Create React App) and the backend in Node.js, deployed through the IEPPAL-SG GitHub organization with separate frontend and backend repositories.

**Stage 3: MVP V2 (February 2025)**
An updated version with a video walkthrough recorded on February 10, 2025. The specific changes between V1 and V2 are not fully documented in available materials, but by this stage the team was using the product in structured pitching and stakeholder conversations.

**Stage 4: RASA Pilot Build (August–September 2025)**
A RASA-specific backend architecture was scoped — a stripped MVP with 2FA, class creation, IEP creation (student name, observations/assessment), and goal-setting. Features from the full architecture (Strategy Library, Data Dashboard, Calendar integration) were deferred. Niranjan P. engineered and deployed this version. The frontend migration from Create React App to Vite was flagged as needed but not yet completed.

**Stage 5: Current MVP (as of early 2026)**
The current state combines the above with UI refinement work driven by Ansel's February 2026 design critique. Known incomplete features: qualitative goal tracking (UI built, backend incomplete), student-facing view, parent-facing view, CSV data import, and bi-weekly check-in nodes. Known technical debt: 25 frontend vulnerabilities (1 critical), 4 high-severity backend vulnerabilities, CRA-to-Vite migration pending, JWT refresh tokens not implemented, CORS not locked down. Features explicitly dropped from original scope: Video Entry Log, Community Hub, messaging system.

**Planned (not yet built):**
- AI-Powered IEP Assistant (goal generation, strategy recommendations, progress summarization) — Y2 Q3 target
- Strategy Library populated with research-backed interventions — Y2 Q1 target
- Professional Development courses for CCEU credits — Y2 Q1 target
- White-label licensing and custom enterprise feature development
- Predictive analytics and AI scheduling of intervention moments
- Third-party assessment integrations (MAP, KEY Math, MCI Reading)
- SIS/LMS integrations (PowerSchool, Veracross, Schoology)

---

## Pivots and Strategic Decisions

**From IESP to IEP (late 2024).** Early outreach used "IESPs" (Individualized Education Support Plans), which was SAS-specific terminology. By late 2024, the team standardized on "IEPs" as the universal term, broadening the addressable market beyond schools using SAS's naming convention.

**Problem reframe: fragmentation, not volume (October 2024).** The original hypothesis — validated in VPC V1 — was that teachers struggled with too much data and the burden of data entry. Structured interviews across 400+ educators revealed the opposite: the core problem was that data existed across multiple disconnected systems with no actionable signal. This pivot reshaped the entire product proposition, shifting from "data entry tool" toward "data integration and signal layer."

**Dropped student-facing and community features (2025).** The September 2024 UI mockup included a Video Entry Log (student-recorded progress), a Community Hub (external resources, podcasts), and a student messaging system — all with the mission of "nurturing students into confident self-advocates." By the time of the seed round pitch decks (May 2026), all of these had been removed from the product scope. The product positioning shifted to "built for teachers, not administrators" — an explicit teacher-first frame with student-facing features deprioritized to a later roadmap phase.

**On-premises vs. cloud (March 2025).** Following the Ryan Tannenbaum advisory interview, the team chose cloud-hosted infrastructure (Azure or AWS Bedrock) over on-premises deployment. The rationale was that strict cloud-based data protection with proper GDPR/PDPA compliance was more viable and scalable than school-by-school on-prem deployments, particularly for an international school customer base.

**AI strategy: classifier models, not open-ended generation (March 2025).** Ryan Tannenbaum advised against open-ended LLM generation for IEP recommendations, citing the need for consistency and determinism in education-related outputs. The agreed approach was temperature-zero LLMs and a classifier-model architecture for AI recommendations. This decision shaped how the planned AI Assistant is being scoped.

**Street Data Framework as intellectual differentiator (by May 2026).** The Street Data Framework (Safir & Dugan, 2021) — which prioritizes qualitative, classroom-level "street data" over standardized test "satellite data" — was formalized as the product's core intellectual underpinning by the time of the March 2026 white paper and appears prominently in the seed round pitch decks as a competitive differentiator. It was not present in the earlier 2024 materials.

**Geographic sequencing: India first (2025).** Rather than launching in Singapore — the home market — the team prioritized India as the first pilot geography, given lower barriers and existing relationships through Niranjan P. RASA India became the first live pilot. Singapore is next (SAS and Tanglin Trust in pipeline), with Australia as the largest near-term expansion market (warm leads at Scotch College Melbourne and Carey, Sydney).

**Rahul Cortez not listed as co-founder in seed materials (May 2026).** Between the September 2024 Canva materials (where Rahul Cortez is listed as a co-founder alongside Ansel and Ian) and the May 2026 seed round pitch decks (where he is not listed), Rahul's role changed. The nature and timing of this transition are not documented in available records. His research (Cortez, 2024) continues to be cited as foundational evidence in the white paper.

---

## Current Status as of May 2026

### Pipeline and Sales

The only live pilot as of May 2026 is RASA (India), with Rupa Hemanth as Head of School. Students have been onboarded and IEPs digitized. Niranjan P. is actively setting up additional demos in India.

Active pipeline in Singapore includes Singapore American School (introductory meeting with Jennifer Foss, April 8, 2026; not yet a confirmed pilot), Tanglin Trust School (Learning Support Head engaged), and Canadian International School Singapore (Head of Inclusion in conversation). In Thailand, Brighton College Bangkok is at the headmaster level and in progress. In Australia, warm leads exist at Scotch College Melbourne and Carey Sydney. A meeting with David Burke of ed.events Singapore is scheduled between May 29 and June 1, 2026.

### Product State

The MVP is functional and deployed. The frontend is React (Vite migration pending), the backend is Node.js on port 3001. Both repositories are hosted in the IEPPAL-SG GitHub organization. The frontend currently has 25 known vulnerabilities (one critical) and the backend has four high-severity vulnerabilities. JWT refresh token handling is not implemented. CORS configuration is not fully locked down. Qualitative goal tracking is partially built (UI exists, backend is incomplete). Student-facing and parent-facing views are in progress. AI features are not yet built.

### Financials

The seed fundraise is actively underway as of June 2026. Projected use of funds: 40% product development, 30% GTM, 20% operations and compliance, 10% working capital. A legal entity has not yet been established — this is listed as a use of seed funds.

Financial projections from the May 2026 pitch deck (all figures SGD):
- Y1 Revenue: S$12,766 (one live pilot school)
- Y2 Revenue: S$74,728 (+486%; first enterprise deal)
- Y3 Revenue: S$209,334 (+180%; two enterprise contracts at scale)
- 3-year cumulative: S$307,808

CAC is projected to fall from S$576.74 in Y1 to S$205.42 in Y3. Gross margin is modelled at 93–97% variable COGS. All figures are in SGD (1 SGD approximately 0.74 USD as at June 2026).

Market sizing (from pitch deck): TAM $4.2B (approximately 15,000 private and international K-12 schools globally with learning support programs); SAM $620M (approximately 2,500 international schools in Asia-Pacific); SOM $42M (approximately 350 target schools in Singapore, Australia, and India over three years at $5K–$20K ACV).

### Team

Three co-founders: Ansel Natarajan (CEO), Ian Wilson (Head of Research), Niranjan P. (CTO). No other full-time hires as of May 2026. A legal entity has not yet been established.

### Key Documents Referenced in This History

| Document | Date | Location |
|---|---|---|
| Wilson (2024) teacher needs assessment | May 2024 | Canva ("Thesis Talk", 122 pages) |
| Cortez (2024) parent interview research | Oct 2024 | Canva (67 pages) |
| IEPPAL UI V1 mockup | Sep 2024 | Canva (19 pages) |
| SAS consultancy project presentation | Oct 2024 | Canva (43 pages) |
| Outreach tracker (2024) | Jun 2024 | Google Drive |
| MVP V1 video walkthrough | Nov 2024 | Google Drive |
| MVP V2 video | Feb 10, 2025 | Google Drive (440 MB .mov) |
| Ryan Tannenbaum interview notes | Mar 2025 | Google Drive |
| Manish Mandan interview notes | Mar 2025 | Google Drive |
| MVP video (March) | Mar 15, 2025 | Google Drive (259 MB .MOV) |
| Backend architecture map | Aug 2025 | Canva |
| RASA-specific backend map | Sep 2025 | Canva |
| PDPA Compliance document | Jun 2025 | Google Drive |
| GDPR Compliance document | Jul 2025 | Google Drive |
| Strategy Library Research Template | Aug 2025 | Google Drive |
| Business Plan Overview | Nov 3, 2025 | Google Drive |
| Product requirements spreadsheet | Jan 2026 | Google Drive (shared with developer) |
| MVP UI Notes/Discussion | Feb 17, 2026 | Google Drive |
| White paper ("IEP Pal's Why & How") | Mar 2026 | Google Drive |
| Competitor Analysis Master Doc | Nov 2024, updated Mar 2026 | Google Drive |
| IEPPAL Pitch Deck (12-page, seed round) | May 14, 2026 | Canva |
| IEP Pal Deck 15 May 2026 (16-page) | May 15, 2026 | Canva |
| Business Plan Overview (updated) | May 14, 2026 | Google Drive |
| Outreach tracker 2025-26 | Dec 21, 2025; last modified May 19, 2026 | Google Drive |
