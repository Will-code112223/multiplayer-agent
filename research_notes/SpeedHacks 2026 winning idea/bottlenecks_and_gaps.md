# Productivity Bottlenecks, the AI Products Crowding Each Space, and Under-Served Gaps for a 12-Hour Hackathon Demo (as of October 2026)

Scope note: this covers (a) where knowledge workers, students, small businesses and people accessing services lose time per 2025–2026 studies; (b) which AI products already crowd each space; (c) under-served bottlenecks where a demo could show a minutes-to-seconds saving using APIs that exist today. Every statistic is dated. Where only secondary coverage of a primary report was reachable, that is flagged. Several primary sites (microsoft.com report body, atlassian.com, census.gov, unleash.ai) could not be fetched directly from this environment, so figures from them come from search-result summaries of secondary coverage and should be spot-checked against the primary PDF before being quoted on a slide.

---

## Key Question 1: What do 2025–2026 studies say are the biggest time sinks for knowledge workers?

### Takeaway
The best-sourced 2025–2026 numbers point to four dominant sinks: (1) interruptions/notifications (Microsoft: an interruption roughly every 2 minutes, 117 emails/day, 60% of meetings ad hoc), (2) searching for information (Atlassian: ~25% of the workweek, 2.4B hours/yr in the Fortune 500), (3) app/context switching (Slack Sept 2025: 68% spend 30+ min/day toggling), and (4) healthcare/admin paperwork (AMA Dec 2025: 13 hrs/week on prior auth per physician practice). AI time savings reported by workers in 2026 are real but modest (Census Mar 2026: most AI users save 1–2 hours/week), which is the opening for a demo that shows a visibly large, not incremental, saving.

### Cited Findings

**Interruptions, meetings, email ("infinite workday")**
- Microsoft's "Breaking down the infinite workday" (WorkLab, June 17, 2025) found the average worker is interrupted roughly every two minutes by a meeting, email or chat notification during an 8-hour shift, totalling ~275 interruptions a day; data drew on Microsoft 365 telemetry plus a survey of 31,000 workers in 31 countries — [CNN, June 17 2025](https://edition.cnn.com/2025/06/17/business/microsoft-report-infinite-workday-intl); [Business Today, June 18 2025](https://www.businesstoday.in/amp/technology/news/story/microsoft-report-warns-of-the-infinite-workday-calls-for-radical-ai-led-reinvention-480791-2025-06-18). Note: one outlet claims the 275 figure is counted over 24 hours and only among the top 20% of users by ping volume; this is a single-source caveat — [Unleash, June 30 2025](https://www.unleash.ai/artificial-intelligence/microsoft-employees-are-interrupted-every-2-minutes-how-can-ai-help-us-re-focus-on-the-work-that-matters/).
- Same report: the typical worker receives 117 emails/day; by 10 p.m. ~29% of active workers are back in their inbox; ad hoc calls without calendar invites make up ~60% of all meetings (one outlet reports 57%) — [TechRadar, June 2025](https://www.techradar.com/pro/microsoft-study-finds-whats-stopping-us-from-being-productive-at-work-is-work); [HR Executive, 2025](https://hrexecutive.com/talent-management-in-the-age-of-the-infinite-workday-microsofts-recommendations/).
- Microsoft 2026 Work Trend Index, "Agents, human agency, and the opportunity for every organization" (May 5, 2026; trillions of M365 signals + 20,000 AI-using workers in 10 countries): 66% of AI users say AI lets them spend more time on high-value work; 58% say they produce work they could not a year ago; 15x YoY growth in active agents across Microsoft 365 (18x in large enterprises); only 19% of AI users are in the "Frontier zone" where individual capability and organizational readiness are both high; only 26% say leadership is clearly aligned on AI — [Microsoft WorkLab 2026 report page](https://microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization); [The Neuron summary, May 2026](https://www.theneuron.ai/explainer-articles/microsofts-2026-work-trend-index-your-employees-figured-out-ai-your-company-didnt/). (The 2026 report is framed around agents and readiness rather than hours lost; the hours-lost figures still come from the 2025 edition.)

**Searching for information / duplicated work**
- Atlassian State of Teams 2025 (April 28, 2025; 200 Fortune 1000 executives + 12,000 knowledge workers): executives and teams spend ~a quarter of the workweek searching for information; ~2.4 billion hours/yr wasted on information search within the Fortune 500; ~half of workers say teams have unknowingly worked on the same thing; ~53–56% say the only way to get information is to ask someone or schedule a meeting — [Unleash, April 28 2025](https://www.unleash.ai/artificial-intelligence/atlassian-ai-could-help-workers-stop-wasting-2-4-billion-hours-searching-for-information-every-year/); [Diginomica](https://diginomica.com/node/28623). Atlassian's 2024 edition used a different headline (25 billion hours/yr lost to ineffective collaboration in the Fortune 500) — [Fortune, June 12 2024](https://fortune.com/2024/06/12/work-productivity-hours-wasted-state-of-teams-atlassian). Do not mix the two.
- Atlassian Developer Experience Report 2025: AI adoption rising but friction persists (page could not be fetched; headline only) — [Atlassian blog, 2025](https://www.atlassian.com/blog/developer/developer-experience-report-2025).

**App switching / context switching**
- Slack State of Work (Sept 30, 2025; 17,000 knowledge workers): >50% say switching between apps makes it harder to get essential work done; 68% spend at least 30 minutes/day toggling between tools — [Slack blog, Sept 30 2025](https://slack.com/intl/zh-sg/blog/productivity/powering-productivity-workplace).
- A claim circulating that workers "switch apps 10+ times a day and lose 100 minutes refocusing" (attributed to a Slack April 2025 post) could not be verified against a primary Slack source; the nearest verifiable figures are RingCentral's ~10 switches/hour and the UC Irvine ~23-minute refocus estimate — [Quartz](https://qz.com/work/1467099/the-key-to-workplace-productivity-is-not-an-app); [Next Futures "Toggle Tax"](https://nextfutures.substack.com/p/the-toggle-tax). Treat the 100-minute number as unconfirmed.
- Slack Workforce Index 2025 (June 30, 2025; 5,156 desk workers, 6 countries): 60% of desk workers use AI, 40% use AI agents; daily use up 233%; Slack explicitly did not report hard time-saved metrics in this edition — [Salesforce press release, June 30 2025](https://www.salesforce.com/it/news/press-releases/2025/06/30/slack-workforce-index-2025/); [No Jitter](https://www.nojitter.com/ai-assistants-copilots/slack-workforce-lab-report-finds-desk-workers-use-ai-daily).

**"Work about work" (older but still widely cited)**
- Asana Anatomy of Work Index 2021 (data from 2020): knowledge workers spent ~60% of time on "work about work"; ~103 hours/yr in unnecessary meetings, ~209 hours on duplicative work, ~352 hours talking about work — [Asana](https://asana.com/resources/anatomy-of-work-index); [Asana US infographic](https://asana.com/resources/anatomy-of-work-infographic). No 2025 edition of Anatomy of Work was found; Asana's newer research is the Work Innovation Lab, which in 2025 polled 2,000+ workers and found ~two-thirds believe AI agents are unreliable and workers expect to delegate 32% of tasks to AI within 12 months while only 25% feel ready — [Futurum Group, 2025](https://futurumgroup.com/insights/will-asanas-teammates-drive-better-collaboration-between-humans-and-ai-agents/).

**How much AI is actually saving (2026)**
- U.S. Census Bureau Household Pulse-style survey (March 2026, published Aug 2026): among workers who used AI in the previous week, ~25% saved less than an hour, 31% saved 1–2 hours, 15% saved 3–4 hours, 15% saved >4 hours — [Census Bureau, Aug 2026](https://www.census.gov/library/stories/2026/08/ai-use-at-work.html).
- Gallup (survey May 6–20, 2026; 22,573 employed U.S. adults): 52% of employees use AI in their role (up from 21% in Q2 2023); ~15% use it daily; Gallup did not report hours saved — [Gallup via makerstations summary](https://makerstations.io/ai-adoption-at-work-statistics).
- SHRM 2026 (via secondary summary): average AI user reports saving ~6 hrs/week but spending ~4 hrs/week fixing AI output — [Saner.ai summary](https://blog.saner.ai/ai-productivity-statistics/). Secondary; verify before citing.
- Gartner (June 25, 2025 press release): >40% of agentic AI projects will be cancelled by end of 2027 due to cost, unclear value and weak risk controls; only ~130 of thousands of "agentic AI" vendors are real — [YourStory](https://yourstory.com/ai-story/gartner-agentic-ai-projects-cancelled-2027); [Outlook Business](https://www.outlookbusiness.com/deeptech/artificial-intelligence/over-40-of-agentic-ai-projects-will-be-scrapped-by-2027-says-gartner). Gartner 2026 CIO survey (via secondary): only 17% of organisations have deployed AI agents; 42% plan to within 12 months — [nocode.tech](https://www.nocode.tech/article/gartners-2026-hype-cycle-agentic-ai).

**Healthcare admin (a knowledge-work time sink with hard numbers)**
- AMA 2025 Prior Authorization Physician Survey (fielded Dec 2025, 1,000 physicians): practices spend ~13 hours/week on prior authorization; ~40 PA requests per physician per week; 40% employ staff dedicated exclusively to PA; 94% say PA contributes to burnout — [AMA press release](https://www.ama-assn.org/press-center/ama-press-releases/ama-survey-prior-authorization-reform-pledge-falls-short-physicians); [Becker's ASC](https://www.beckersasc.com/asc-coding-billing-and-collections/physicians-vs-prior-authorization-10-updates/).

**Managers' admin load**
- Sixth Annual International Bank Employee Survey (2025; 1,200+ respondents): managers average 11.6 hours/week on scheduling and administrative tasks — [Zebra, 2025](https://mktg.zebra.com/BankingEmployeeSurvey2025).

**Onboarding**
- Linux Foundation (April 2024; 321 technical employers): average 4.8 months to normal productivity for technical hires; 58% say >4 months — [cited via TechClass](https://www.techclass.com/resources/learning-and-development-articles/onboarding-for-technical-teams-reducing-time-to-full-productivity). A claim that 43% of new hires wait >1 week for basic tool access is unsourced (same page) — treat as anecdotal.

### Inferences
- The time sinks with the strongest 2025–2026 evidence are interruptions, information search, app switching and paperwork — not "writing" or "summarising", which is where most AI products already sit.
- Worker-reported AI savings cluster at 1–2 hours/week (Census 2026). A hackathon demo that compresses one named task from tens of minutes to under a minute is a bigger visible delta than the typical product delivers.
- "Only way to get info is to ask someone or book a meeting" (53–56%, Atlassian 2025) is a concrete, demo-able bottleneck: the agent answers the question instead of a human being interrupted.

### Gaps
- No 2025/2026 edition of Asana's Anatomy of Work was found; the 60% "work about work" figure is from 2021.
- No 2025–2026 survey quantifying hours employees spend waiting on approvals or chasing status updates; only vendor estimates (e.g., Razorpay "5–8 hrs/week on approvals for managers", unverified) — [Razorpay blog](https://razorpay.com/blog/?p=26179).
- The Microsoft 2026 report body and the Atlassian 2025 PDF could not be fetched directly; figures come from secondary coverage.
- No McKinsey 2026 worker-level time-saved figure was found (McKinsey 2025 State of AI reported 88% of orgs use AI in at least one function, not hours saved).

---

## Key Question 2: Which "access to services" bottlenecks are measurable and demo-able?

### Takeaway
Government and healthcare access is where the largest, most citable waits exist in 2026: U.S. IRS hold times up 81–161% in the 2026 filing season with ~40% of test calls disconnected, SSA answered-call waits of ~102 minutes (Senate staff test, 2025), NC DMV averaging 1h23m–2h45m in late 2025, USCIS backlog at 12.1M cases with ~24 months to clear, 31-day average wait for a new-patient physician appointment, and 44+ days from insurance claim notice to payment. Benefits-application completion times (30–110 minutes, Code for America) are the most directly demo-able "minutes to seconds" target because the forms are public.

### Cited Findings

**Phone trees / hold time (consumer and government)**
- IRS 2026 filing season: Taxpayer Advocate Service June 2026 report to Congress found live assistors answered 20% fewer calls than the prior season and hold times jumped 81–161%; only 17% of calls handled by the IRS voicebot were completed. Center for Taxpayer Rights testers found wait times up >70% in 2026 despite 50% fewer calls to the 1040 line, and ~40% of test calls disconnected, mostly by the IRS. IRS headcount fell from ~102,000 to ~74,000 during 2025 — [TaxProf Blog summarising Mother Jones, July 29 2026](https://taxprofblog.aals.org/2026/07/29/mother-jones-the-irs-is-imploding/); [PBS NewsHour on 2026 season](https://www.pbs.org/newshour/nation/irs-faces-challenges-in-2026-tax-season-due-to-jobs-cuts-and-new-laws).
- TIGTA (Aug 2025): IRS's reported ~3-minute average wait for the 2024 season covered only 33 Accounts Management lines, excluding a 17-minute average endured by ~one-third of callers — [TIGTA report, Aug 2025](https://www.oversight.gov/sites/default/files/documents/reports/2025-08/2025100040fr.pdf); [CFO Dive](https://www.cfodive.com/news/irs-underreports-wait-times-taxpayers-phoning-help-tigta-trump-tax/758212/).
- SSA: Senate Democratic staff test (June 2025, ~50 calls, partisan source): average wait for answered calls 102 minutes vs SSA's claimed ~12 minutes — [Warren.senate.gov report](https://www.warren.senate.gov/imo/media/doc/social_security_war_room_-_wait_times_report.pdf). Pending legislation "Stuck on Hold Act" (H.R. 6656) would require SSA and VA to give wait estimates and callbacks for waits >15 minutes — [Rep. Calvert press release](https://calvert.house.gov/media/press-releases/rep-calvert-introduces-stuck-hold-act).
- Consumer hold time (ServiceNow-sponsored surveys): UK consumers spend ~445M hours/yr on hold (~9.7 hrs/person, 2025) — [Compare the Cloud](https://www.comparethecloud.net/news/uk-consumers-lose-445-million-hours-a-year-on-hold-servicenow-research-finds); Australians 113.5M hours in 2025 (~9.3 hrs/person, down 13% YoY, attributed partly to AI) — [ServiceNow 2026 release](https://s205.q4cdn.com/537566246/files/doc_news/AI-helps-cut-10-million-hours-from-Australias-on-hold-crisis-but-our-customer-service-problem-isnt-over-2026.pdf); Singapore 40M hours (~19 hrs/person, 2024) — [ServiceNow, Mar 2025](https://s205.q4cdn.com/537566246/files/doc_news/Singapore-service-wait-times-increase-to-40-million-hours-on-hold-03-24-2025-traffic-2025.pdf); India 30.7 hrs/person (2023) — [ServiceNow, Jul 2024](https://s205.q4cdn.com/537566246/files/doc_news/Indians-lost-over-15-billion-hours-on-hold-to-customer-service-in-2023-resulting-in-55-billion-in-economic-loss-output--07-31-2024-tr-LBW6X.pdf). Vendor research; no comparable U.S. 2025 figure found.

**DMV**
- North Carolina DMV: statewide average wait ~2h45m in Sept 2025 (Cary office 5h10m); fell to ~1h23m by Oct 2025 (clock starts at sign-in, so pre-sign-in queue excluded); officials told lawmakers "2 hours to 90 minutes" on Oct 29, 2025 — [WITN, Sept 16 2025](https://www.witn.com/2025/09/16/dmv-average-wait-time-data-released); [News & Observer via Yahoo, Oct 2025](https://www.yahoo.com/news/articles/nc-dmv-says-wait-times-210006753.html); [WECT, Oct 29 2025](https://www.wect.com/2025/10/29/dmv-wait-times-drop-2-hours-90-minutes-officials-report-progress-lawmakers). NC launched a statewide live wait-time dashboard in 2025 — [CBS17](https://www.cbs17.com/news/north-carolina-news/nc-officials-launch-statewide-dmv-offices-wait-time-estimates-current-capacity-status/amp/).
- Virginia DMV: average wait 8.3 minutes in 2026, down from ~37 minutes in 2019 after reforms — [Virginia Mercury, 2026](https://virginiamercury.com/?p=49157). Shows the spread between states is 10x+.

**Benefits applications (SNAP/Medicaid/TANF)**
- Code for America 50-state benefits analysis: average time to complete an application ranges from ~30 minutes (Montana) to ~110 minutes (Minnesota) for the same three federal programs; combined applications perform significantly better — [Code for America 50 States](https://codeforamerica.org/50states). MNbenefits redesign cut median completion from up to 60 minutes (35-screen Medicaid flow up to 50 minutes) to <12 minutes — [NASCIO award write-up](https://nascio.org/awards-library/awards/mnbenefits-piloting-secure-self-service-for-minnesotas-benefits). GetCalFresh cut CalFresh application time from ~45 minutes to <10 — [Civic Tech Guide](https://civictech.guide/listing/getcalfresh). (Dates vary; CfA notes comparative stats are hard; no single 2025 national figure.)

**Immigration (USCIS)**
- American Immigration Council dashboard: pending caseload ~12.1 million in FY2026 Q2 despite a ~45% drop in filings; estimated time to clear backlog ~24.1 months (nearly doubled YoY); FY2026 Q1 average clearance 18.6 months vs 9.4 a year earlier; asylee I-485 clearance 70.6 months — [AIC, 2026](https://www.americanimmigrationcouncil.org/blog/uscis-backlog-grows-less-immigration-filings/); [AIC filing trends](https://www.americanimmigrationcouncil.org/?p=56636). Niskanen Center (citing USCIS): I-90 median 9.2 months (Feb 28, 2026); I-730 18.5 months; I-914 28.2 months (Apr 30, 2026) — [Niskanen, June 2026 update](https://www.niskanencenter.org/wp-content/uploads/2026/08/ARCHIVE-June-2026-Legal-Immigration-in-Numbers-Status-Update.pdf). Processing time is government-side and cannot be demoed away; form preparation and status-tracking friction can.

**Healthcare access**
- AMN Healthcare 2025 Survey of Physician Appointment Wait Times (1,391 offices, 15 metros, Jan 15–Feb 24 2025): average new-patient wait 31 days (26 in 2022, 21 in 2004); OB/GYN ~42, gastroenterology 40, dermatology 36.5, cardiology 33, family medicine 23.5, orthopedics 12; Boston 65–67 days, Atlanta 12–13 — [AMN blog, June 30 2025](https://www.amnhealthcare.com/amn-insights/physician/blog/the-growing-challenges-with-physician-appointment-wait-times/); [AMN PDF](https://www.amnhealthcare.com/siteassets/amn-insights/physician/ps-2025-physician-appt-wait-times---wp-v6.pdf); [MGMA 2026 note that waits held flat](https://www.mgma.com/mgma-stat/new-patient-wait-times-largely-hold-flat-in-2026-as-some-groups-add-providers-in-bid-to-meet-demand).
- Prior authorization: 13 hrs/week per practice (AMA, Dec 2025) — see KQ1.

**Insurance claims**
- J.D. Power 2025 property claims: average claim 32.4 days to complete; first notice of loss to final payment >44 days, longest since 2008; satisfaction 762/1000 when done in ≤10 days vs 595 when repairs exceed 31 days; 82% expect payout within 5 days — [Reinsurance News on J.D. Power](https://reinsurancene.ws/rising-customer-dissatisfaction-with-homeowners-insurance-claims-j-d-power); [Business Insurance](https://www.businessinsurance.com/slow-payouts-are-sending-insurance-customers-running/). InvoiceCloud (Nov 2025, 1,000 U.S. adults, vendor): 27% of claimants paid >1 week after filing; 83% would switch carriers after a bad claims experience — [BusinessWire, Nov 20 2025](https://secure.businesswire.com/news/home/20251120871657/en/InvoiceCloud-Research-83-of-Consumers-Surveyed-Would-Switch-Insurance-Carriers-After-a-Poor-Claims-Experience). No survey measures consumer hours spent filing a claim.

**Small-business paperwork**
- American Action Forum (2017, PRA data): small businesses face ~3.3B hours/yr of federal paperwork; >379 hours/yr per small business (~10 workweeks) — [AAF](https://www.americanactionforum.org/insight/red-tape-burdens-small-businesses/). Canada CFIB (Jan 2025 release, 2024 data): owners spend 735 hours/yr (32 business days) on regulation, >1/3 on unnecessary red tape; up 35% since 2020 — [Retail Insider, Jan 2025](https://retail-insider.com/retail-insider/2025/01/red-tape-costing-small-businesses-billions-of-dollars-cfib/); [Lexpert](https://www.lexpert.ca/news/litigation-law/small-businesses-lose-a-month-each-year-to-red-tape-canadian-federation-of-independent-business/390941). No current (2025) U.S. per-business paperwork-hours figure found; stealthagents.com figures should be avoided as unverifiable.

### Inferences
- The most demo-able service bottlenecks are those where the friction is on the citizen's side and the artifact is public: benefits forms (30–110 min → seconds), DMV appointment hunting, prior-auth packet assembly, insurance first-notice-of-loss, USCIS form prep and status checking. Agency processing delays (USCIS months, DMV queues) cannot be demoed away but the "find me the earliest appointment across 12 offices" and "hold the line for me and call me back" layers can.
- Phone-tree hold time is the single most universal measured pain (9–30 hrs/person/yr across countries) and has real-time voice APIs now available (KQ4), yet consumer-facing "AI waits on hold / navigates the IVR for you" is still niche (see KQ5).

### Gaps
- No GAO 2025–2026 report on IRS/SSA/VA phone waits was found; SSA figures rest on a partisan staff test and an older IG number.
- No U.S. 2025 consumer hold-time total comparable to the ServiceNow UK/Australia figures.
- No VA wait-time data located.
- No study quantifying hours consumers spend filing insurance claims (only payout-speed data).
- No 2025 U.S. small-business paperwork-hours study; the AAF figure is 2017.

---

## Key Question 3: Which "learning" bottlenecks are real and under-served (beyond flashcards/tutors)?

### Takeaway
The best-evidenced learning bottleneck is logistical, not pedagogical: students lose time hunting for deadlines and assessment info scattered across LMS locations (only 9% use the syllabus for deadlines; 47% report missing a critical deadline due to disconnected systems, vendor-reported). On the institutional side, financial-aid offices are the chokepoint (91% report increased processing time per application; FAFSA ~10 hours per family, older figure). These are under-served relative to the crowded tutor/flashcard space.

### Cited Findings
- Survey of 324 students (Advances in Physiology Education, 2024): students rank deadlines as the most important syllabus item but most consult four different LMS locations to find them — [UNH scholars record](https://findscholars.unh.edu/display/publication598404). Companion multi-institution survey (20 institutions): only 9% look at the syllabus for deadlines; 33% check modules, 28% calendars, 21% assignment pages, 9% gradebook — [Montclair research record](https://researchwith.montclair.edu/en/publications/a-rising-star-how-the-lms-replaced-the-syllabus/).
- University of Aberdeen student feedback (May 2026; 240+ survey responses, 23 focus-group students): finding assessment information was the most common struggle; information present but scattered; calendars sometimes showed outdated deadlines — [Aberdeen blog, May 2026](https://www.abdn.ac.uk/students/student-channel/blog/reflecting-on-students-perspective-of-myaberdeen/).
- Canvas focus-group study: inconsistent course organisation across courses leads to "significant time searching for information and frustration" — [Chapman digital commons](https://digitalcommons.chapman.edu/sees_articles/658).
- Pathify 2025 Student Digital Experience Survey (vendor, cited secondhand): 47% of students missed a critical deadline because information was spread across disconnected systems; 95% would use a single platform — [Kilo blog](https://blog.kilo.ai/p/5-openclaw-recipes-that-help-students?open=false). Methodology unverified.
- NASFAA 2025 Administrative Burden Survey (July 2025; 900+ institutions): 91% report greatly or somewhat increased time per aid application over five years; 52% report moderate/severe resource shortages at peak — [NASFAA](https://www.nasfaa.org/nasfaa_2025_administrative_burden_survey_reveals_growing_strain_on_financial_aid_offices). July 2025 follow-up (~500 institutions): 51% say students report confusing or delayed information from ED/FSA; one-third report direct student frustration about FAFSA processing — [NASFAA](https://www.nasfaa.org/nasfaa_survey_shows_us_department_of_education_turbulence_continues_disrupt_financial_aid_service).
- FAFSA: a Harvard estimate cited in student press puts the average family's FAFSA completion at ~10 hours (undated, likely pre-2024 simplification) — [Daily Free Press](https://dailyfreepress.com/?p=42502). Treat as older.
- Technical onboarding as learning: 4.8 months to normal productivity (Linux Foundation 2024) — see KQ1.

### Inferences
- "Where is my deadline / what exactly is due" is a real, measured, cross-institution time sink that generic tutors do not address; an agent that reads a student's LMS (Canvas/Moodle APIs exist) and produces one verified calendar is demo-able in seconds.
- Learning the "how a place works" layer (new job, new school, new tool) is a bigger measured bottleneck (months) than learning content, and is largely unserved by consumer AI.

### Gaps
- No 2025–2026 study quantifying student hours lost to administrative tasks (only office-side burden and deadline-location studies).
- No source found on adult-learner or corporate L&D time bottlenecks with 2025–2026 numbers.
- Pathify 47% figure is vendor-reported and unverified.

---

## Key Question 4: What capabilities became practical in 2026 that unlock demos not possible a year ago?

### Takeaway
Four shifts matter for a 12-hour demo: (1) computer/browser-use agents moved from research preview to shipped products (Anthropic browser-use GA Aug 19 2026 per one source; Gemini in Chrome "Auto Browse" Jan 28 2026; OSWorld-family scores now in the 75–85 range on verified tracks), (2) speech-to-speech voice with reasoning and tool calls (OpenAI GPT-Realtime-2, May 7 2026; Gemini 3.1 Flash Live, Mar 26 2026) plus telephony platforms at ~600–1,400 ms latency and $0.05–0.20/min (Retell, Vapi, Bland), (3) MCP as the cross-vendor tool standard (10,000+ public servers Dec 2025; Linux Foundation governance; supported by OpenAI, Google, Microsoft), and (4) agent SDKs with hosted runtimes (Claude Agent SDK, OpenAI AgentKit/Agents SDK). Anthropic also moved programmatic Agent SDK usage onto subscription credits (June 15, 2026), lowering hackathon cost.

### Cited Findings

**Computer use / browser agents**
- OSWorld-Verified (BenchLM, July 2026): Claude Opus 4.8 leads at 85.2, GPT-5.4 at 79.2, Claude Opus 4.6 at 76.9 (composite score) — [BenchLM](https://www.benchlm.ai/best/computer-use). OSWorld 2.0 official 500-step track (XLANG via Yutori, July 2026): Claude Opus 4.8 leads at 20.6% binary accuracy; 150-step track GPT-5.5 13.0% vs Claude Opus 4.7 4.6% — [Yutori leaderboard](https://yutori.com/leaderboards/osworld-2.md). An aggregator (Sept 2026) lists Claude Fable 5.1 at 77.9% on OSWorld 2.0 and 41.7% strict — [anotherwrapper](https://anotherwrapper.com/tools/llm-pricing/evals/osworld-2-0); unverified against an official source. Steel's leaderboard warns self-reported and verified rows are mixed — [Steel](https://leaderboard.steel.dev/leaderboards/osworld/). Net: harder, longer tasks still fail often; keep demos to short, well-structured flows.
- Anthropic: computer use since Oct 2024; a March 2026 feature lets users send prompts from a phone while Claude operates desktop apps; a separate "browser use" toolset reportedly reached GA on Aug 19, 2026 — [Wikipedia Claude entry](https://en.wikipedia.org/wiki/Claude_(language_model)); [tech-insider.org comparison](https://tech-insider.org/ie/chatgpt-vs-claude-vs-gemini-agent-mode-2026) (secondary; verify against Anthropic docs). Claude for Chrome extension requires Pro ($20/mo) — [Composite, Feb 2026](https://composite.com/blog/chatgpt-atlas-reviews-pricing-alternatives).
- Google: Gemini in Chrome "Auto Browse" agentic overhaul Jan 28, 2026, paid tiers, approval on sensitive steps — [freeacademy.ai 2026 browser landscape](https://freeacademy.ai/lessons/the-2026-ai-browser-landscape). Gemini 2.5 Computer Use model (browser-focused) exists; no 2026 OSWorld score found.
- OpenAI: ChatGPT Atlas browser (launched Oct 2025, agent mode for paid tiers) was reportedly retired — announced July 9, 2026, shutdown Aug 9, 2026 — with agentic browsing moved into the ChatGPT desktop app and a Chrome extension — [tech-insider.org](https://tech-insider.org/ca/?p=1149). Single secondary source; verify. OpenAI GPT-5.5 (April 2026) is described as strong in agentic computer use — [ecorpit comparison](https://ecorpit.com/gemini-vs-claude-vs-openai-computer-use-browser-agent-2026/).
- Perplexity Comet: launched July 2025, free to all by Oct 2025, iOS March 2026; agent handles booking, email, form-filling; TechCrunch's 2025 hands-on found it "helpful for simple tasks but quickly falls apart with complex requests" — [TechCrunch, July 9 2025](https://techcrunch.com/2025/07/09/perplexity-launches-comet-an-ai-powered-web-browser/); [Gigazine, Oct 2025](https://www.gigazine.net/gsc_news/en/20251003-perplexity-comet-available-everyone).

**Real-time voice and phone calling**
- OpenAI GPT-Realtime-2 (May 7, 2026) with GPT-Realtime-Translate and GPT-Realtime-Whisper: adds reasoning, 128K context (from 32K), adjustable reasoning effort, parallel tool calls, EU data residency — [RITS NYU Shanghai](https://rits.shanghai.nyu.edu/ai/openai-launches-gpt-realtime-2-with-gpt-5-class-voice-reasoning/); [noqta.tn](https://noqta.tn/en/news/openai-gpt-realtime-2-voice-ai-models-2026). One article names "gpt-realtime-2.1" as current flagship; naming conflict, verify.
- Google Gemini 3.1 Flash Live (Mar 26, 2026): speech-to-speech with built-in reasoning; stronger on cost, language coverage, video — [Webscraft comparison](https://webscraft.org/blog/gptrealtime2-vs-gemini-live-api-scho-obrati-dlya-golosovogo-agenta-u-2026-rotsi?lang=en); hackathon tutorial — [lablab.ai](https://lablab.ai/ai-tutorials/building-voice-agents-gemini-live-fastapi).
- Telephony platforms (2026 comparisons, mostly vendor-written): Retell ~620 ms claimed (independent: 700–900 ms), from $0.07/min; Vapi 800–1,400 ms, $0.05–0.20/min, bring-your-own LLM/TTS/STT; Bland 900–1,200 ms, $0.07–0.18/min, strongest for outbound at volume with "Pathways" flow builder — [Retell blog](https://www.retellai.com/blog/retell-vs-bland-vs-vapi-vs-elevenlabs); [aiagentrank, May 2026](https://aiagentrank.io/blog/vapi-vs-retell-vs-bland-2026); [Techsy](https://techsy.io/en/blog/retell-ai-vs-vapi-vs-bland). All three support outbound PSTN calls today, which enables "agent calls the DMV/clinic/insurer for you" demos.

**MCP and agent SDKs**
- Anthropic Dec 2025 ecosystem update: >10,000 active public MCP servers; MCP donated to the Agentic AI Foundation (Linux Foundation) Dec 9, 2025 with OpenAI as co-founder; official registry ~9,652 server records as of May 24, 2026; third-party indexes 4,000–20,000 — [Archestra State of MCP mid-2026](https://archestra.ai/blog/state-of-mcp-2026); [DreamFactory stats](https://www.dreamfactory.com/hub/mcp-server-statistics). OpenAI added MCP to Agents SDK March 26, 2025 — [Simon Willison](https://simonwillison.net/2025/Mar/26/openaidevs); Google announced Gemini MCP support April 2025; Microsoft shipped MCP in Windows Copilot/VS Code/Azure in 2025 — [Archestra](https://archestra.ai/blog/state-of-mcp-2026).
- OpenAI AgentKit (DevDay Oct 2025): Agent Builder visual canvas, Connector Registry, ChatKit embeddable UI, Evals; Agents SDK in Python/Node/Go; Apps SDK built on MCP — [Constellation Research](https://www.constellationr.com/insights/news/openai-sets-sdks-app-integrations-agentic-ai-building-blocks); [Folio3, Jan 2026](https://www.folio3.ai/ai-pulse/openai-launches-agentkit-simplify-ai-agent-development-enterprises). OpenAI Assistants API sunset slated for Aug 2026 — [FirstAIMovers](https://radar.firstaimovers.com/mcp-won-agent-protocol-war-migrate-before-august-2026.md) (secondary).
- Claude Agent SDK: Python (MIT) and TypeScript packages; from June 15, 2026 Agent SDK / headless `claude -p` / GitHub Actions usage draws on a monthly subscription credit pool (Pro $20, Max 5x $100, Max 20x $200), announced May 13, 2026 — [AI/TLDR digest, May 15 2026](https://buttondown.com/ai-tldr/archive/aitldr-daily-digest-may-15-2026/); [Techsy](https://techsy.io/en/blog/claude-agent-sdk-credit). Claude Cowork available via Amazon Bedrock; Spotify built an internal coding agent on the SDK (AWS Summit Hamburg 2026) — [Classmethod](https://dev.classmethod.jp/en/articles/aws-summit-hamburg-2026-claude/).

### Inferences
- The combination that is newly cheap in 2026 is: voice (speech-to-speech + PSTN) + browser-use + MCP connectors to a user's own calendar/email/LMS. A demo that chains all three (agent phones an office, navigates an IVR, books a slot, writes it to the calendar) was not reliably buildable in a day in 2025.
- Benchmarks say long, open-ended computer-use tasks still fail (OSWorld 2.0 strict <45%). Demo reliability requires short, deterministic flows or pre-validated sites.

### Gaps
- No primary Anthropic 2026 announcement page for browser-use GA or the March 2026 phone-to-desktop feature was retrieved; dates are secondary.
- No Gemini 2026 OSWorld score found; no primary Google ADK 2026 announcement retrieved.
- ChatGPT Atlas shutdown rests on one secondary source.
- Voice latency figures come from vendors' differing test setups.

---

## Key Question 5: What is already saturated? Product map per category (as of Oct 2026)

### Takeaway
Meeting notetakers, email triage, calendar/scheduling, coding agents, consumer browser agents and enterprise search are saturated and consolidating: Granola is a $1.5B company (Mar 2026), Superhuman sold to Grammarly (Jul 2025), The Browser Company (Dia) sold to Atlassian for $610M (Sep 2025), Motion hit a $550M valuation (Sep 2025), Comet is free for everyone, and every frontier lab ships a browser agent. Consumer-facing phone/IVR agents, benefits/government form completion, prior-auth packet assembly, LMS deadline consolidation, and small-business permit navigation have no dominant well-funded player in the sources found.

### Cited Findings

**Meeting notetakers (saturated)**
- Granola: $125M Series C at $1.5B valuation, March 2026 (Index lead; Kleiner Perkins, Lightspeed, Spark, NFDG); prior $43M Series B at $250M May 2025; total raised ~$176–192M — [Seedtable](https://seedtable.com/companies/granola/funding-rounds/series-c-2026-03); [komo.ai](https://komo.ai/directory/granola-funding).
- Fireflies.ai: ~$19M raised over 6 rounds (CB Insights; stale revenue data) — [CB Insights](https://www.cbinsights.com/company/fireflies/financials). Otter.ai: no 2026 funding data found; incumbent since 2016.
- Plus native notetakers in Zoom, Teams Copilot, Google Meet Gemini (well known; not separately sourced here).

**Email agents (saturated / consolidating)**
- Superhuman acquired by Grammarly (July 2025; terms undisclosed; Superhuman ~$35M ARR, last valued $825M in 2021; >100 staff moved) after Grammarly raised $1B from General Catalyst; plan: Grammarly agents inside Superhuman, expanding into calendars/tasks — [DevX](https://www.devx.com/daily-news/grammarly-acquires-superhuman-to-build-ai-productivity-platform/); [Implicator.ai](https://www.implicator.ai/grammarly-acquires-superhuman-to-anchor-its-ai-productivity-ambitions/). Shortwave, Gmail Gemini, Outlook Copilot also occupy this space (not separately sourced).

**Scheduling / calendar (saturated)**
- Motion: $38M Series C led by Scale Venture Partners at $550M post-money (Sept 2025); >10,000 B2B customers and $10M ARR within four months of launching an AI agent bundle for SMBs — [Techleap finder](https://finder.techleap.nl/news/feed/motion-raises-38m-for-ai-agents). Reclaim.ai (reported Dropbox acquisition, 2025) could not be verified in this research — treat as unconfirmed. Clockwise: no 2025–2026 funding data found.

**Browser agents (saturated, with churn)**
- Atlassian acquired The Browser Company (Arc, Dia) for ~$610M cash, announced Sept 4, 2025, closing by Dec 2025; Arc in maintenance mode; Dia to be tailored for knowledge workers with Jira/Confluence context — [TechRepublic](https://www.techrepublic.com/article/news-atlassian-to-acquire-the-browser-company/); [The Register, Sept 4 2025](https://www.theregister.com/2025/09/04/atlassian_browser_company/); [Crunchbase News](https://news.crunchbase.com/ma/atlassian-acquires-browser-ai-knowledge-workers-dia/).
- Perplexity Comet free worldwide (Oct 2025), iOS Mar 2026; OpenAI Atlas launched Oct 2025 and reportedly retired Aug 2026 in favour of ChatGPT desktop/Chrome extension; Gemini in Chrome Auto Browse (Jan 2026); Claude for Chrome — see KQ4 sources.

**Workflow / no-code agents (saturated)**
- Lindy: a16z-backed; conflicting funding data (Caplight: ~$99.8M raised, ~$225M est. valuation; Sacra differs) — [Caplight](https://www.caplight.com/company/lindy-businessproductivity-software); [Sacra](https://sacra.com/c/lindy/). Zapier Agents launched 2025 (goal-driven agent picks from connected actions) — [ClickUp comparison](https://clickup.com/vi/blog/549520/hub). Dust positioned as closest Lindy alternative (2026) — [Macha](https://www.getmacha.com/blog/best-lindy-ai-alternatives). n8n, Relay.app, Make also crowd this space (not separately sourced).

**Enterprise search / knowledge (saturated)**
- Glean, Notion AI, Microsoft Copilot, Atlassian Rovo, Dust all target "search for information." No 2026 Glean/Dust funding figures retrieved; Notion's $10B valuation is from Oct 2021 — [Neuronfeed](https://neuronfeed.com/compare/motion-app-vs-notion-ai). Atlassian's own State of Teams 2025 is partly marketing for Rovo — [Unleash](https://www.unleash.ai/artificial-intelligence/atlassian-ai-could-help-workers-stop-wasting-2-4-billion-hours-searching-for-information-every-year/).

**Market-map level**
- CB Insights AI agent market map (March 2025): 170+ startups across 26 categories — [CB Insights](https://www.cbinsights.com/research/search/research-briefs/briefings). MightyBot (June 2026) splits the space into coding agents, workflow automation, vertical agents, browser agents, customer-service agents, RPA copilots, agent infrastructure — [MightyBot](https://mightybot.ai/blog/ai-automation-agents-market-maps-gone-wild/). A Medium analysis of YC's 2025 batches claims most AI founders are in markets with 90+ competitors (single author, unverified method) — [Medium](https://dswharshit.medium.com/ycs-2025-batches-analysis-of-407-startups-6c9f3c8b2921). YC's Summer 2026 RFS points founders at hard categories (ERP, chip design, industrial control, supply chain) and "software built for agents," not consumer productivity — [VC Cafe](https://www.vccafe.com/requests-for-startups-summer-2026-edition/).
- Gartner: ~130 "real" agentic AI vendors among thousands; >40% of projects to be cancelled by 2027 — see KQ1.

**Categories where no dominant funded player surfaced in these searches**
- Consumer "call and wait on hold / navigate IVR for me" (DoNotPay-style and Google "Hold for Me"/"Talk for Me" exist as features; no 2026 funding or market-leader data found).
- Public-benefits application co-pilot for applicants (Code for America and state portals are non-profit/government; no venture product found).
- Prior-authorization packet assembly for small practices (enterprise RCM vendors exist; nothing SMB-practice-facing found in these searches).
- LMS deadline consolidation for students (Pathify is a portal vendor; no agent product found).
- Small-business permit/licence navigation (no product data found).
- Immigration form prep/status tracking (law-firm blogs dominate results; no agent product data).

### Inferences
- Any idea whose demo is "summarise my meeting," "triage my inbox," "schedule across calendars," or "browse and fill a form on a generic site" will be judged against $500M–$1.5B incumbents and free first-party features; the bar for "striking" is very high there.
- The white space is at the seams between organisations and modalities: phone + web + personal data, government/health paperwork, and the student logistics layer.

### Gaps
- Funding/valuation data for Otter, Clockwise, Glean, Dust, Shortwave, Reclaim, Zapier (2025–2026) not found in these searches.
- Dropbox–Reclaim acquisition unverified.
- No single authoritative 2026 a16z/Sequoia productivity-agent market map located.

---

## Key Question 6: Which 10–15 concrete, under-served bottlenecks could a 12-hour team demo with a visible minutes-to-seconds saving, using capabilities that exist today?

### Takeaway
Pairing the measured pains (KQ1–3) with 2026-ready capabilities (KQ4) and avoiding saturated categories (KQ5) yields the shortlist below. Each entry names the quantified "before," the demo "after," the API path, and the source for the before-number.

### Cited Findings (each item ties to a sourced "before" figure)

1. **Hold-for-me phone agent for government lines (IRS/SSA/DMV).** Before: IRS 2026 hold times up 81–161%, ~40% of test calls disconnected ([TaxProf/Mother Jones, Jul 2026](https://taxprofblog.aals.org/2026/07/29/mother-jones-the-irs-is-imploding/)); SSA 102-minute answered-call wait ([Warren staff test, Jun 2025](https://www.warren.senate.gov/imo/media/doc/social_security_war_room_-_wait_times_report.pdf)). After: agent dials via Bland/Vapi/Retell, navigates IVR, waits, then conferences the human in. APIs: PSTN outbound + speech-to-speech ([aiagentrank, May 2026](https://aiagentrank.io/blog/vapi-vs-retell-vs-bland-2026)). Under-served: no venture leader found (KQ5).

2. **Earliest-appointment finder across providers (healthcare).** Before: 31-day average new-patient wait, Boston 65+ days ([AMN 2025](https://www.amnhealthcare.com/amn-insights/physician/blog/the-growing-challenges-with-physician-appointment-wait-times/)). After: parallel voice agents call N offices simultaneously, return earliest slot in <2 minutes. Demo-able as a race against a human on hold.

3. **Benefits application co-pilot (SNAP/Medicaid).** Before: 30–110 minutes to complete depending on state ([Code for America 50 states](https://codeforamerica.org/50states)); MN redesign proved <12 min is achievable ([NASCIO](https://nascio.org/awards-library/awards/mnbenefits-piloting-secure-self-service-for-minnesotas-benefits)). After: voice/photo intake of pay stubs and ID, agent fills the state portal via browser-use, human reviews. Capability: browser agents GA in 2026 (KQ4).

4. **Prior-authorization packet builder for small practices.** Before: 13 hrs/week per practice, 40 requests/week ([AMA, Dec 2025](https://www.ama-assn.org/press-center/ama-press-releases/ama-survey-prior-authorization-reform-pledge-falls-short-physicians)). After: agent reads clinical note, pulls payer criteria, drafts PA form and fax/portal submission in seconds. Enterprise RCM vendors exist; SMB-practice tool gap (KQ5).

5. **DMV appointment sniper + document checklist.** Before: NC average 1h23m–2h45m in late 2025 ([WITN](https://www.witn.com/2025/09/16/dmv-average-wait-time-data-released); [N&O/Yahoo](https://www.yahoo.com/news/articles/nc-dmv-says-wait-times-210006753.html)), vs Virginia 8.3 min ([Virginia Mercury](https://virginiamercury.com/?p=49157)). After: agent polls public appointment sites and live wait dashboards ([CBS17 on NC dashboard](https://www.cbs17.com/news/north-carolina-news/nc-officials-launch-statewide-dmv-offices-wait-time-estimates-current-capacity-status/amp/)), books the earliest slot, verifies the user's documents from photos.

6. **Insurance first-notice-of-loss in 60 seconds.** Before: 44+ days FNOL-to-payment, 82% expect ≤5 days ([J.D. Power 2025 via Reinsurance News](https://reinsurancene.ws/rising-customer-dissatisfaction-with-homeowners-insurance-claims-j-d-power)). After: photo + voice → structured claim, policy lookup, submission via carrier portal/phone. Saving shown on the consumer's filing step (hours of forms → one minute), honestly framed since payout speed is insurer-side.

7. **"Ask instead of interrupt" team knowledge agent inside chat.** Before: 53–56% say the only way to get info is to ask someone or book a meeting; ~25% of the workweek spent searching ([Atlassian 2025](https://www.unleash.ai/artificial-intelligence/atlassian-ai-could-help-workers-stop-wasting-2-4-billion-hours-searching-for-information-every-year/)). Crowded at enterprise scale (Glean/Rovo/Copilot), but a multiplayer demo where an agent answers in-thread from MCP-connected repos/docs while the human stays in flow is still striking. Risk: saturation.

8. **Student deadline consolidator.** Before: only 9% find deadlines in the syllabus; students check 4 LMS locations ([Montclair record](https://researchwith.montclair.edu/en/publications/a-rising-star-how-the-lms-replaced-the-syllabus/)); 47% missed a critical deadline due to disconnected systems (vendor, [Kilo/Pathify](https://blog.kilo.ai/p/5-openclaw-recipes-that-help-students?open=false)). After: agent reads Canvas/Moodle via API/browser, reconciles syllabus PDFs vs LMS, outputs one verified calendar with conflicts flagged. No agent product found (KQ5).

9. **New-hire "how does this place work" agent.** Before: 4.8 months to normal productivity for technical hires ([Linux Foundation 2024 via TechClass](https://www.techclass.com/resources/learning-and-development-articles/onboarding-for-technical-teams-reducing-time-to-full-productivity)). After: agent indexes repo, Slack history, wiki via MCP and answers "who owns X / how do I deploy Y" live. Demo: a new hire completes a first task in minutes.

10. **Small-business permit/licence navigator with filing.** Before: >379 hrs/yr federal paperwork per small business ([AAF 2017](https://www.americanactionforum.org/insight/red-tape-burdens-small-businesses/)); 735 hrs/yr in Canada ([CFIB 2024](https://www.lexpert.ca/news/litigation-law/small-businesses-lose-a-month-each-year-to-red-tape-canadian-federation-of-independent-business/390941)). After: describe the business in voice → agent determines required city/county/state permits, prefills applications via browser-use. No product leader found.

11. **Immigration form pre-filler + status watcher.** Before: 12.1M pending cases, 24.1 months to clear; I-90 median 9.2 months ([AIC 2026](https://www.americanimmigrationcouncil.org/blog/uscis-backlog-grows-less-immigration-filings/); [Niskanen Jun 2026](https://www.niskanencenter.org/wp-content/uploads/2026/08/ARCHIVE-June-2026-Legal-Immigration-in-Numbers-Status-Update.pdf)). After: agent converts prior filings/documents into a completed draft form and monitors case status/RFEs. Honest framing: saves prep hours, not agency months.

12. **Interruption shield / triage agent.** Before: ~275 interruptions/day, 117 emails/day, 60% ad hoc meetings ([Microsoft Jun 2025 via CNN](https://edition.cnn.com/2025/06/17/business/microsoft-report-infinite-workday-intl)). After: agent fields pings on the user's behalf, answers routine ones from context, batches the rest. Partly crowded (Copilot, Slack AI); the under-served angle is cross-app (Slack+Teams+email) triage via MCP with the human visibly never breaking focus.

13. **Approval unblocker.** Before: no 2025 survey quantifies approval wait time (gap, KQ1); managers spend 11.6 hrs/week on scheduling/admin ([Zebra bank survey 2025](https://mktg.zebra.com/BankingEmployeeSurvey2025)). After: agent assembles the decision packet, pings the approver by voice/chat, records the decision. Weaker evidence base; include only if a team has a specific domain.

14. **Financial-aid (FAFSA/verification) helper for students and aid offices.** Before: 91% of aid offices report increased per-application processing time; 51% say students get confusing/delayed information ([NASFAA Jul 2025](https://www.nasfaa.org/nasfaa_2025_administrative_burden_survey_reveals_growing_strain_on_financial_aid_offices)); ~10 hours per family for FAFSA (older Harvard estimate via [Daily Free Press](https://dailyfreepress.com/?p=42502)). After: agent extracts tax-document fields and drafts the verification response in seconds.

15. **App-switch eliminator ("do it where I am").** Before: 68% spend 30+ min/day toggling tools ([Slack Sept 2025](https://slack.com/intl/zh-sg/blog/productivity/powering-productivity-workplace)). After: a single multiplayer agent surface where teammates and agents act across tools via MCP without leaving the thread. Overlaps with Slack/Teams/Rovo; differentiate via multi-agent collaboration visible in real time.

### Inferences
- Items 1–6, 8, 10, 11 are the most under-served and have the clearest "before" numbers; items 7, 12, 15 are striking but face Copilot/Slack/Glean-class incumbents; 13 has the weakest evidence.
- The strongest demo pattern for a 12-hour build is a visible race: a human doing the real process (on hold, filling the form) on one screen vs. the agent finishing in seconds on the other, with the sourced "before" number on the slide.
- Reliability guidance from benchmarks (KQ4): keep browser-use flows short and pre-validated; use voice for the "waiting" parts where latency tolerance is high.

### Gaps
- No 2025–2026 survey on time lost waiting for approvals; no U.S. consumer hold-time total; no U.S. 2025 small-business paperwork-hours figure; no study of consumer hours spent filing insurance claims. Teams choosing those spaces should run a quick in-demo timing of the manual process rather than cite a national stat.
- Competitive data for several incumbents (Otter, Clockwise, Glean, Dust, Reclaim, Shortwave) is missing for 2026; a final competitive check on the chosen idea is advised.
