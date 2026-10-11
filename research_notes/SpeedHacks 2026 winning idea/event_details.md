# SpeedHacks 2026 (SF Tech Week closing hackathon, Sun Oct 11 2026) — Event Details

**Research-method note (important for the report writer):** In this session all direct page fetches were blocked by the egress proxy (403 CONNECT for tech-week.com, partiful.com, substack.com, a16z.com, speedrun.a16z.com, archive.org, etc.). Every finding below therefore comes from search-engine result snippets/summaries of those pages rather than from reading the full pages. Quotes marked "verbatim" are phrases that appeared verbatim inside search snippets of the official listing. Where a snippet was cut off (notably the judges list), that is flagged as a gap. The caller should open the two official pages directly if possible:
- Tech Week listing: https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51
- Partiful RSVP page: https://partiful.com/e/tthQk11QYKKZJRKvLGBQ

**Disambiguation:** "SpeedHacks 2.0" (HackOverflow, George Mason University, 8-hour hardware hackathon, teams of 2–5) and "SpeedHack" (Chicago 2014, teams of 1–3) are unrelated events with similar names — [Devpost GMU](https://speedhacks-2-0.devpost.com/); [Devpost SpeedHack](https://speedhack.devpost.com/). Do not apply their rules to the speedrun event.

---

## Key Question 1: What is the precise challenge statement and any sub-tracks?

### Takeaway
The official challenge is a single open prompt — "Give people their time back" — operationalized as "build something that removes a meaningful bottleneck in how people work, learn, or access services." No formal sub-tracks were found; the only "track-like" structure is a per-sponsor "Best Use of [company] product" prize layer on top of the grand prize.

### Cited Findings
- Event name and framing (verbatim from listing): "SpeedHacks: The Official speedrun Hackathon" — "the official closing hackathon of SF Hack Week" — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51); [Partiful](https://partiful.com/e/tthQk11QYKKZJRKvLGBQ)
- Challenge text (verbatim from Partiful page as returned in search snippet): "The Challenge: Give people their time back. Hackers must build something that removes a meaningful bottleneck in how people work, learn, or access services." — [Partiful](https://partiful.com/e/tthQk11QYKKZJRKvLGBQ)
- Tooling line (verbatim snippet): hackers can build "with some outstanding speedrun company tools." — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51)
- Sponsor-prize structure (verbatim snippet): "Each speedrun company will award a 'Best Use' of their product prize at the end of the day." — [Partiful](https://partiful.com/e/tthQk11QYKKZJRKvLGBQ)
- Format descriptor: described in search summaries as "a 12-hour build-from-zero event" hosted by "speedrun + speedrun Alpha" — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51)
- Date/time/location: Sunday, October 11, 2026, 9:00 AM – 9:00 PM, Jackson Square, San Francisco; listed as "Featured" on the SF Tech Week calendar — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51); [a16z speedrun sponsor page](https://www.tech-week.com/calendar/sponsors/a16z-speedrun)
- Venue discrepancy: GarysGuide listed the venue as "To Be Announced" while the official Tech Week page says Jackson Square — [GarysGuide](https://www.garysguide.com/events?region=sf) vs. [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51). Jackson Square is also where Andrew Chen said the new speedrun HQ / a16z SF office is located — [Digg summary of Chen's post](https://digg.com/ai/lu71hfib)
- Hack Week context: tech-week.com's Hack Week page calls SpeedHacks "Tech Week's official hackathon" and the closing event of SF Hack Week (SF Tech Week Oct 5–11, LA Oct 12–18, 2026). Other SF Hack Week events listed: Hack Alcatraz with Cloudflare and Kling AI (Oct 5), Harness Engineering & Model Wrangling Hackathon (Oct 11), Physical AI Hackathon (One Culture Foundation) — [Hack Week page](https://www.tech-week.com/hack-week)
- SF Tech Week is decentralized: "no central badge or conference pass," each host sets its own rules — [TechWeeklys guide](https://techweeklys.com/sf-tech-week/)

### Inferences
- The prompt is deliberately broad (work / learn / access services) and outcome-framed ("time back," "bottleneck"). Projects that can quantify time saved or a removed step in a workflow map directly onto the stated judging lens.
- "Access services" is a third pillar distinct from work/learning — suggests consumer-facing or public-service friction (appointments, forms, benefits, healthcare, government) is explicitly in scope alongside B2B productivity.
- Because there are no formal tracks, the "Best Use" sponsor prizes effectively function as sub-tracks; building on a sponsor's API is a parallel path to a $1K prize independent of the grand prize.

### Gaps
- Could not confirm whether the listing contains any additional rubric text (e.g., "judging criteria: impact, technical difficulty, demo") — the fetched snippets did not include criteria beyond the challenge sentence.
- No Devpost / Luma submission page was found for SpeedHacks 2026; only Partiful RSVP and the Tech Week listing exist in search results.

---

## Key Question 2: Who are the judges and sponsors? Which sponsor products/APIs earn the "best use" $1K prizes?

### Takeaway
The listing names "a panel of expert judges, including speedrun founders"; the partially visible roster includes Adrian Aliu, Dhruv Dabriwal, Guido Haissiner, Pranay Periwal and founders of Codos, Rumbo and Motherboard Labs — all apparently speedrun portfolio founders (several from the just-graduating SR007 batch). No explicit list of which companies' APIs carry the $1K "Best Use" prizes was retrievable, but the judging companies are the most likely sponsors.

### Cited Findings
- Prize text (verbatim snippet): "The winning team will earn a guaranteed interview with the speedrun + Alpha investment team." and "Teams can also win $1K from speedrun companies for 'best use' of their products." — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51)
- Partiful phrasing: "Each speedrun company will award a 'Best Use' of their product prize at the end of the day." — [Partiful](https://partiful.com/e/tthQk11QYKKZJRKvLGBQ)
- Judges (from search summary of the listing; list was cut off): "a panel of expert judges, including speedrun founders ... Adrian Aliu, Dhruv Dabriwal, Guido Haissiner, and Pranay Periwal, along with founders of companies such as Codos, Rumbo, and Motherboard Labs" — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51)
- Adrian Aliu: LinkedIn activity says he, Advitya Chhabra and Rafit Jamil "are building a company backed by a16z speedrun" and spent "months as part of the Speedrun batch" (company name not retrieved) — [LinkedIn](https://www.linkedin.com/in/adrian-aliu/)
- Dhruv Dabriwal: co-founder of Nimble, "AI agents that supercharge orgs in freight forwarding," SF, founded 2026, site nimbleops.io; his LinkedIn describes it as backed by a16z speedrun — [F4 profile](https://f4.fund/startups/nimbleops); [LinkedIn](https://www.linkedin.com/in/dhruv-dabriwal-31a243125/)
- Guido Haissiner: co-founder of Rumbo AI, described in a cofounder's LinkedIn post as "a16z SR007," with co-founders Gonzalo Leiva and Agustín Baiocco; product description cut off in snippet — [LinkedIn (Lucas Batista)](https://ar.linkedin.com/in/batistalucas)
- Codos: "AI transformation company based in San Francisco," "AI-transformation-as-software for midsize companies and enterprise business units," with a "Codos Company Brain" — "an organizational context and memory layer deployed on infrastructure controlled by the customer"; introduced as "an a16z Speedrun company on Aug 1, 2026" — [everydev.ai listing](https://www.everydev.ai/developers/codos-inc)
- Motherboard Labs: co-founder Pranit Gupta; "applying AI to diagnostic workflows for field technicians, with copilots that organize manuals, wiring diagrams, SOPs, and site history"; "backed by a16z Speedrun" — [Happenstance profile](https://happenstance.ai/u/pranit-gupta) (single-source)
- SR007 batch timing explains why these founders are available as judges: "SR007 will take place in San Francisco from July 27th to Oct 11, 2026" with Demo Day Oct 6 — [a16z speedrun page](https://a16z.com/speedrun/); [FoundedCEO Substack](https://foundedceo.substack.com/p/a16z-speedruns-sr007-demo-day-is)
- Other SR007 companies named in third-party roster (candidates for sponsor tools, unconfirmed): Keythorn (AI insurance "underwriting the new risks created as AI agents enter the economy"), Phyvant (enterprise AI memory), Banbury Road (multi-agent AI research) — [Frontrun](https://www.frontrun.vc/blog/a16z-speedrun-cohort-007-companies/)
- speedrun credits platform context (not hackathon-specific): SR007 offered "up to $1M in funding > $5M+ in credits" — [speedrun on X](https://x.com/speedrun/status/2046645999356006666)

### Inferences
- The judge roster is drawn from speedrun portfolio founders, and the prize text says each "speedrun company" awards its own "Best Use" prize — so the judging companies (Nimble, Rumbo AI, Codos, Motherboard Labs, Aliu's company) are very likely the sponsors whose products/APIs earn the $1K prizes. Treat as probable, not confirmed.
- Several of these portcos are themselves "agents that remove bottlenecks" (freight-forwarding ops, field-technician diagnostics, enterprise memory layer) — a team using one as infrastructure (e.g., Codos' memory layer, Nimble's agents) would align both with the challenge and with a sponsor prize.
- Finalist judging is by "speedrun investors and portfolio companies," i.e., investor taste (fundability, founder quality) matters as much as technical polish.

### Gaps
- Full judge list (snippet truncated) and official sponsor list with the specific products/APIs/credits for each "Best Use" prize — not retrievable; the Partiful/Tech Week pages must be read directly.
- Pranay Periwal's company was not identifiable (search returned an unrelated Emaar India sales profile).
- Adrian Aliu's company name was not identifiable.
- Whether a16z speedrun investment-team members (e.g., Josh Lu, Jonathan Lai, Andrew Chen, Troy Kirwin) sit on the final panel — not stated in retrievable snippets.

---

## Key Question 3: What is the demo/pitch format and time limit? How are finalists chosen? Team size and submission?

### Takeaway
Confirmed: 12-hour in-person build (9am–9pm), finalists "demo live to speedrun investors and portfolio companies" at the end of the day; teams may be pre-formed (declare them on application) or formed on-site. No demo time limit, finalist-selection mechanism, team-size cap, or video/Devpost submission requirement was found in any retrievable source.

### Cited Findings
- Demo format (verbatim snippet): "At the end of the hackathon, finalists will demo live to speedrun investors and portfolio companies." — [Partiful](https://partiful.com/e/tthQk11QYKKZJRKvLGBQ); [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51)
- Team formation (verbatim snippet): "Come with a team (make sure you mention them when you apply) or find one when you get here!" — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51)
- Logistics (verbatim snippet): "bring your laptop, and food and caffeine are provided" — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/speedhacks-the-official-speedrun-hackathon-30c239a4-638a-4bd6-8d51-e15259668f51)
- Access model: event is application/RSVP-gated via Partiful ("mention them when you apply") — [Partiful](https://partiful.com/e/tthQk11QYKKZJRKvLGBQ)
- Analogue for pitch length at speedrun events: at SR006 Demo Day (Palace of Fine Arts, April 2026) the 60 companies gave "90-second pitches" — [speedrun Substack](https://speedrun.substack.com/p/sr007-applications-open); [36kr](https://eu.36kr.com/en/p/3786499459685632)
- Comparable sister event the day before: "Talk to Users Hackathon" (Sat Oct 10, 9am–10pm, House of AI/SoMa) — "Teams of up to 20 ... about 12 hours to build ... more than $10K in prizes," ICP testers matched to teams, "one-on-one office hours with a16z speedrun and YC founders" — [Tech Week listing](https://www.tech-week.com/calendar/sf/events/talk-to-users-hackathon-2ea9ffb9-d4c2-410f-b45c-94eab588be96); [Partiful](https://partiful.com/e/0FqprP2FJcBX3ogGRJmd)

### Inferences
- "Finalists" implies a first-pass screening (likely table/expo-style judging or a sponsor shortlist) before a live final; with 12 hours and demos ending ~9pm, finals are plausibly very short (speedrun's own Demo Day standard is 90 seconds — treat as a planning assumption, not a rule).
- No video or Devpost was found; teams should plan for a live, working demo rather than a recorded submission.

### Gaps
- Demo length, number of finalists, how finalists are selected, judging rubric, team-size cap, and submission mechanics are all unverified — none appeared in snippets. Need the Partiful page or on-site briefing.
- Exact day-of schedule (kickoff talk, check-in, submission cutoff, demo start) not found.

---

## Key Question 4: What has speedrun (a16z) invested in recently, especially productivity/agent startups, and what do its partners say they look for?

### Takeaway
speedrun has pivoted from a games accelerator (2023) to an AI-dominated pre-seed program: SR006 (Jan–Apr 2026) was 87% AI-tagged, >50% B2B, with a large "agents & B2B" cluster and headline ARR-in-weeks stories; partners emphasize speed of execution, founder resilience, storytelling/communication, traction (broadly defined — revenue not required), and cofounder dynamics over category.

### Cited Findings
**Program facts**
- Terms: $500K on a post-money SAFE for 10% + $500K committed to next round within 18 months ("up to $1M"); 12-week in-person SF program, 2 cohorts/yr, 60–70 teams, <0.4% acceptance; "$5M+ in credits"; $180M+ deployed into 150+ startups since 2023 — [Superscout](https://superscout.co/program/a16z-speedrun); [a16z speedrun](https://a16z.com/speedrun/); [speedrun on X](https://x.com/speedrun/status/2046645999356006666)
- SR007: July 27 – Oct 11, 2026 in SF, Demo Day Oct 6; SR008 priority window Oct 12 – Nov 1, 2026, cohort late Jan–Apr 2027 — [a16z speedrun](https://a16z.com/speedrun/); [Tractionwire](https://tractionwire.com/a16z-speedrun-how-to-apply)
- speedrun Alpha (co-host of SpeedHacks): program "for highly technical students, dropouts and recent graduates who want to start building before they have a company, an idea or a team"; Founder track "$20k grant (equity-free) > Eligibility for up to $250K investment > OR placement at one of our portcos"; 8-week in-person SF program with coworking at speedrun's office; run with EO Ventures; Talent-track partners include Substack, Decagon, Sesame AI, Nexxa, Hedra; one listing says applications close Oct 11 (today) — [speedrun on X](https://x.com/speedrun/status/2024198415580643473); [Superscout](https://superscout.co/program/speedrun-alpha-fellowship); [Purdue CS](https://www.cs.purdue.edu/corporate/employment/a16zfellow10.11.html); [NYU ITP](https://itp.nyu.edu/opportunities/2026/02/03/call-a16z-speedrun-alpha-fellowship/)
- Andrew Chen on Alpha: "a16z Speedrun Alpha, for pre-idea/pre-team/pre-everything founders ... crazy stuff happening in AI, and you're building agents/apps/whatever every night+weekend" and "the goal of Speedrun Alpha is simple: find exceptional builders before the idea is fully formed" — [Andrew Chen on X](https://x.com/andrewchen/status/2024174222021718446); [Andrew Chen on X](https://x.com/andrewchen/status/2029602061684462029)

**Recent portfolio themes (SR006, Jan–Apr 2026)**
- 87% of 60 SR006 companies carry an AI tag; more than half B2B; ~1/3 show revenue figures in profiles; only 1 game studio left; median team size 4 (75% have 2–6) — [36kr Part One](https://eu.36kr.com/en/p/3786499459685632); [36kr](https://eu.36kr.com/en/p/3770097927111174); [GenAI Assembling Substack](https://genaiassembling.substack.com/p/speedruns-pivot-is-the-playbook-what)
- "AI agents for just about everything appeared alongside insurance, entertainment apps, and laundry-folding robots" — [VC Intel briefing](https://thevcinternfromx.substack.com/p/vc-intel-daily-briefing-april-15)
- Named SR006 companies: Straia (agentic AI for higher ed, "$4.5M cARR in 4 weeks"), Bota ("bridging AI agents and the real world," $710K ARR in 5 weeks), Bilrost (automates commercial loan processing, $680K ARR in 5 weeks), Grove Tax / Piper-ai / Quanto ("AI workforces" for tax, construction, accounting), Acceler8/Alike ("disrupting Slack through its autonomous Agent-to-Agent Communication"), Amdahl, August — [36kr](https://eu.36kr.com/en/p/3786499459685632); [Startuphub.ai list](https://www.startuphub.ai/lists/speedrun-a16z-batch-sr006-ae9b2fc1); [VC Intel](https://thevcinternfromx.substack.com/p/vc-intel-daily-briefing-april-15)
- Independent categorization: 31 of the SR006 batch fall in an "Agents & B2B" bucket (examples AgentCat, Switchfrog, Athena, Rumbo) — [X article by Apoorav Vyas](https://x.com/apoorav_vyas/article/2103025731806880062) (one author's taxonomy)
- SR005 (Jul–Oct 2025, 58–60 companies) examples: YKB (social layer for fan prediction markets), Zero Billion (AI-native TV platform), Artifact AI (AI accounting assistant) — [VC Corner](https://www.thevccorner.com/p/a16z-speedrun-demo-day-2025-startups); [Habr](https://habr.com/ru/articles/959100)
- SR007 (Jul–Oct 2026) examples: Keythorn (AI insurance), Phyvant (enterprise AI memory), Banbury Road (multi-agent research), Truli (AI for FD work), media/gen-media cos Fictional, Orbits, Reelful, Mirai — [Frontrun](https://www.frontrun.vc/blog/a16z-speedrun-cohort-007-companies/); [FoundedCEO](https://foundedceo.substack.com/p/a16z-speedruns-sr007-demo-day-is)
- Jonathan Lai (GP, leads speedrun investment team + Games): backs "developer tools to 3D simulations, vertical agents, and novel storytelling formats"; wants "AI-native consumer apps and enterprise tools"; RFS ideas include "AI agents for creative work, think Cursor for storytelling" — [a16z author page](https://a16z.com/author/jonathan-lai/); [jonlai.co](https://www.jonlai.co/)
- Lai on SR007: "if you aspire to build a generational company - we arm you with the a16z network, operating platform, an amazing founder community, & hands-on support ... we love working with early teams and are first check in most cases" — [Jon Lai on X](https://x.com/Tocelot/status/2046266841841140068)
- a16z "Big Ideas 2026" (Lai a contributor): "software is increasingly built for agents, not humans" — [a16z](https://a16z.com/newsletter/big-ideas-2026-part-1/)
- Third-party summary of speedrun's 2026 ideas list: consumer AI services, "AI taste agents," multiplayer AI tools, performance-based pricing, hyper-personalized products — [Superframeworks](https://superframeworks.com/articles/a16z-speedrun-ideas-indie-hackers-2026) (secondary)

**What partners say they look for**
- Josh Lu (GM/Partner): "speed really matters in early-stage startups, the speed by which teams execute, the speed by which they answer the important questions" (can they reach PMF, know their audience, hire well) — [Fortune](https://dc.fortune.com/2025/04/02/why-a16zs-speedrun-accelerator-is-playing-a-new-game)
- Josh Lu on founders: "You can't fake resilience in a 15-minute pitch. It shows up fast."; focuses on whether founders are resilient, have a reason to build this, and think beyond product into company-building — [Startup Istanbul](https://startupistanbul.substack.com/p/lessons-from-a16z-speedruns-josh) (secondary)
- Troy Kirwin: "the main thing he's looking for is storytelling and communication ability," and watches co-founder dynamics in interviews — speedrun Substack as summarized by [Ellenox guide](https://www.ellenox.com/post/how-to-get-accepted-to-a16z-speedrun) (secondary)
- speedrun "What We Look for In Applications" (Jan 14, 2026, post-SR006 review of 19,000+ pitches, <0.4% selected): "revenue is not a prerequisite for speedrun"; "there are many ways to show traction," an influencer-advisor or mention in a post is "the weakest form" — [speedrun Substack](https://speedrun.substack.com/p/what-we-look-for-in-applications)
- SR005 roundtable: a common mistake is "treating their pitch like a book report"; spending too much of the application on market theory — [speedrun Substack](https://speedrun.substack.com/p/sr005-apps-reviewed-the-3-signals-that-get-startups-in); [Yahoo/Fortune](https://finance.yahoo.com/news/a16z-super-competitive-speedrun-startup-195801074.html)
- "we care about the founders more than the category" — [speedrun Substack Q&A](https://speedrun.substack.com/p/questions-re-a16z-speedrun)
- Strongest factors to reach interview per a speedrun marketing partner: "previous founding experience, a great cofounder, and real traction with customers" — [Eqvista](https://eqvista.com/?p=33872) (secondary)
- Team requirement: "Teams must be able to build and iterate on the product in house," usually a technical cofounder; solo founders may apply — [Superscout](https://superscout.co/program/a16z-speedrun)

### Inferences
- The grand prize is an interview, so the de-facto judging lens is "would speedrun fund this team?" — demos that show (a) fast execution in 12 hours, (b) a crisp story about a real bottleneck and who pays, and (c) credible cofounder chemistry will match what partners publicly say they screen for.
- Recent cohorts reward vertical AI agents with a clear buyer and "ARR-in-weeks" narratives; a SpeedHacks project framed as a vertical agent that deletes a specific workflow step for a specific user is squarely in-thesis.
- Co-hosting with Alpha (pre-idea students/grads) implies the hackathon doubles as an Alpha/SR008 sourcing funnel; student/early-career teams should mention Alpha fit.

### Gaps
- Full text of "What We Look for In Applications" and "Five Stages of the Founder Journey" not retrievable; only opening paragraphs appeared in snippets.
- No direct quote from Troy Kirwin or Josh Lu specifically about hackathons.
- Official full SR006/SR007 company lists not retrieved (speedrun.a16z.com/companies blocked).

---

## Key Question 5: Have there been prior speedrun hackathons? What won?

### Takeaway
No evidence of a prior "SpeedHacks" or any speedrun-run hackathon at an earlier Tech Week was found; speedrun's October 2025 SF Tech Week programming consisted of a Demo Day, an "Intro to Speedrun for Builders, Hackers and Designers" breakfast, and an AI Faire. a16z (not speedrun) co-hosted a 2024 consumer-AI hackathon with ElevenLabs and an LA Tech Week 2025 student hackathon with Lovable/HackSC, whose winners are partly known.

### Cited Findings
- 2026 appears to be the first SpeedHacks: speedrun's Sept 30, 2026 post "How to Host Events that Raise the Bar" (by Rose Johnson, speedrun/Tech Week marketing) promotes SpeedHacks as "Tech Week's official closing hackathon on October 11 in SF"; no prior edition is referenced in retrievable snippets — [speedrun Substack](https://speedrun.substack.com/p/how-to-host-events-that-raise-the)
- speedrun's Oct 2025 SF Tech Week events (no hackathon): "Intro to Speedrun for Builders, Hackers and Designers" breakfast, Wed Oct 8, 2025, 10am, SOMA, with GP Andrew Chen, for engineers "in school or within five years of graduating" — [Partiful](https://partiful.com/e/KqtzS95d3MTHN2fUt1iA); "a16z speedrun Demo Day (SR005)" — [Partiful](https://partiful.com/e/cGNtH8rVcfosm1tLtMLS); "a16z speedrun AI Faire" — [Partiful](https://partiful.com/e/wDSpaj6OGV2nb833y5S2)
- SR005 Demo Day was Oct 7, 2025 during SF Tech Week (one listing says Oct 8) — [GamesBeat](https://gamesbeat.com/a16z-speedrun-opens-applications-for-fifth-event-offers-1m-investment/); [Avenue Z](https://avenuez.com/events/our-top-picks-san-francisco-techweek)
- a16z x ElevenLabs Consumer AI Hackathon, NYC, Nov 2024 (100+ participants, 21 teams, 24 hours): 1st Kaizen (fitness game w/ computer vision + AI characters), 2nd Two Somethin' (AI handling customer-service calls), 3rd Pokémon IRL (voice-command Pokémon battles). London (same weekend, ElevenLabs HQ, 50+ hackers): Runewell (custom voice casts for stories), PersuAIsion (social-skills practice), Ryoko Travel (travel-memory videos) — [ElevenLabs blog](https://elevenlabs.io/blog/hackathons-nyc-london); [ElevenLabs on X](https://x.com/ElevenLabs/status/1857476556173533381)
- HackSC x Lovable x a16z, LA Tech Week, Oct 13–19, 2025 (online, US college students, 88 participants): prize categories Best Overall, Best Use of Lovable, Most Viable Product, Best Beginner Hack, Best Integration of AI Agents, Best Use of AI for Social Good; winners not posted ("Winners TBD") — [Devpost](https://hacksc-x-lovable-2025-.devpost.com/)
- a16z "Battle of the Hacks" (2016): a16z hackathon for organizers of 14 top collegiate hackathons; $25,000 sponsorship grand prize — historical, unrelated to speedrun — [UT CS news](https://www.cs.utexas.edu/news/2016/freetail-hackers-battle-hacks)
- 2026 SF Tech Week speedrun events this week (context for the ecosystem SpeedHacks closes): Deep Tech Investor Breakfast (Wed Oct 7, Jackson Square, w/ Renegade Partners), "speedrun × OpenAI founder night at new speedrun HQ" (Oct 7), "a16z speedrun AI Faire" (Fri Oct 9, Jackson Square — "showcasing the most exciting AI B2B startups across a16z speedrun cohorts," demo-walkaround format for execs/operators), SpeedHacks (Sun Oct 11); a16z speedrun is a Gold sponsor of Tech Week — [a16z speedrun sponsor page](https://www.tech-week.com/calendar/sponsors/a16z-speedrun); [AI Faire listing](https://www.tech-week.com/calendar/sf/events/a16z-speedrun-ai-faire-70750ac4-237e-42a9-9b03-f9589abdae34); [speedrun x OpenAI](https://www.tech-week.com/calendar/sf/events/speedrun-openai-founder-night-at-new-speedrun-hq-ce331aa7-0dd3-4ca1-a474-44d9f6b285f7); [NYC calendar](https://tech-week.com/calendar/nyc)

### Inferences
- With no prior SpeedHacks to study, the best proxies for "what wins" are (a) the a16z/ElevenLabs hackathon winners — polished, demo-able consumer experiences and a voice agent that replaces a phone-call bottleneck (Two Somethin') — and (b) speedrun's own Demo Day favorites: vertical agents with clear buyers and revenue.
- "Best Integration of AI Agents" was a named prize category at the only other a16z-affiliated Tech Week hackathon (LA 2025), reinforcing that agent-based solutions are expected.

### Gaps
- No winners found for HackSC x Lovable x a16z 2025 (Devpost still "Winners TBD" in indexed snapshot).
- Could not confirm whether speedrun ran any internal/founder hackathon in 2025 (e.g., during a cohort); nothing surfaced.
- No news coverage yet of SpeedHacks 2026 outcomes (event is in progress today).
