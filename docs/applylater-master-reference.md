# ApplyLater — Master Reference Document
ApplyLater · Confidential
Version 1.2 · Owner: Product Team · Status: Living Document

---

## What This Document Is

This is the single source of truth for ApplyLater MVP and post-MVP expansion.

It defines:
- what ApplyLater is
- what is live today
- what is gap
- what we will build first
- how we scale into a long-term startup platform

Rules:
- `Live` means confirmed in repository and usable end to end.
- `Partial` means visible/scaffolded but not fully connected.
- `Gap` means not implemented.

---

## 1. Product Definition

ApplyLater is a mobile-first opportunity intelligence hub that converts raw opportunity links into structured, trackable application workflows.

Positioning:
- Save. Track. Apply.
- Never miss opportunities because of poor follow-through, weak timing, or fragmented context.

Core promise:
- Turn any opportunity link into a guided application record with timelines, reminders, stage tracking, and AI support.

North-star outcome:
- Increase user conversion from saved opportunities to completed submissions.

--- 

## 2. Product Scope and Identity

ApplyLater is not a bookmark manager. It is an execution system.

Primary jobs-to-be-done:
1. Capture opportunities quickly.
2. Extract and structure opportunity details accurately.
3. Track application progression at granular stage level.
4. Remind users intelligently until completion.
5. Keep users informed post-submission and during response windows.

Core entity:
- `Application` is the center of the system.
- Every feature must improve application completion probability.

---

## 3. Current Honest State

### Backend
- Auth stack is live.
- Email templates and auth communication are live.
- Opportunity/application domain models are not implemented yet.

### Frontend
- Mobile-first UI scaffold is strong.
- Dashboard, alerts, search, details surfaces exist.
- Most feature data is currently mocked.

### Product readiness
- UX direction is strong.
- Domain architecture, extraction pipeline, and reminder engine are immediate gaps.

---

## 4. Vision Ladder

### V1 MVP
- Reliable capture and extraction of opportunity links
- Structured application records
- Granular stage tracking
- Reminder engine with global and per-application controls
- In-app application engagement tracking (passive telemetry)

### V2 Growth
- Better discover ranking and intelligence
- Cross-user demand signals and activity trends
- Stronger AI assistance for preparedness and quality

### V3 Agentic Layer
- Approval-gated assisted application operations
- Multi-step AI workflows with strict user control policies

---

## 5. User Types

1. Students
2. Early and mid-career professionals
3. Researchers and fellows
4. Career switchers
5. Power users managing multiple applications in parallel

---

## 6. End-to-End Workflow

1. User pastes an opportunity link via the add-link modal or drawer.
2. System validates, normalizes, and checks for duplicate/canonical URL match.
3. User is immediately presented with a choice:
   - **Stay**: Remain on screen to watch extracted details arrive in real time.
   - **Leave**: Close and receive a notification when extraction completes.
4. System queues an ingestion job and the Extraction Agent begins traversal.
5. Agent moves back and forth across pages as needed to fully map the opportunity.
6. AI normalizes and enriches all gathered content into a structured intelligence payload.
7. Application record is created with full intelligence output attached.
8. If user is present at extraction completion, they are prompted to set a custom reminder on the spot.
9. Application appears in the home list with status, category, deadline, and applicant count.
10. Reminder and tracking pipeline activates based on user settings.
11. User opens application details, reviews all information, and clicks Apply Now.
12. Tracking pipeline begins: 30-minute check-in, completion checkpoints, exponential backoff.
13. Post-submission follow-up and response-date reminders continue until Parked.

---

## 7. MVP Capability Matrix

| Capability | Status | Target |
|---|---|---|
| Authentication | Live | Maintain |
| Link intake UI | Partial | Connect to backend pipeline |
| Opportunity extraction pipeline | Gap | Build in MVP |
| Structured application record | Gap | Build in MVP |
| Stage-level tracking | Gap | Build in MVP |
| Reminder engine | Gap | Build in MVP |
| In-app apply telemetry | Gap | Build in MVP |
| Discover ranking baseline | Gap | Build late MVP |
| AI recommendation quality layer | Gap | MVP-lite then expand |
| Applicant count tracking per opportunity | Gap | Build in MVP |
| Custom on-the-spot reminder at extraction | Gap | Build in MVP |

---

## 8. Core Data Model (MVP)

Primary tables:
- `users`
- `user_profiles`
- `opportunities`
- `applications`
- `application_stage_events`
- `reminder_rules`
- `reminders`
- `ingestion_jobs`
- `extraction_results`
- `application_activity_events`
- `notification_events`
- `submission_artifacts`

Application stage model:
- `Added`
- `Reviewing`
- `PreparingDocs`
- `InProgress`
- `Submitted`
- `UnderReview`
- `Interview`
- `Offer`
- `Rejected`
- `Closed`
- `Parked`

Key principle:
- Stage history is append-only via `application_stage_events`.
- Current stage is projected from latest valid event.

---

## 9. Link Ingestion and Extraction Pipeline

### Input Link Types

Users can paste two fundamentally different types of links. The system must handle both equally well and produce the same structured output regardless.

**Type 1 — Opportunity Overview / Description Page**
- A page on a major platform (scholarship portal, job board, fellowship site) that describes the opportunity at a high level.
- May not contain the actual application form.
- Example: a university scholarship listing, a fellowship program page.
- The Extraction Agent must extract all available details and, if needed, follow the primary call-to-action link to discover the actual form structure and fields.

**Type 2 — Actual Application Form Page**
- The direct URL where the applicant begins filling in fields.
- Example: a Google Form, Typeform, or a custom multi-step application portal.
- The Extraction Agent must map all visible fields across all form steps.

Both types must produce the same full intelligence output regardless of their source structure.

### Pipeline Flow

1. Receive URL from user.
2. Validate and normalize URL (strip tracking parameters, resolve redirects, establish canonical form).
3. Check for duplicate match against existing opportunity index.
4. Queue ingestion job with status `Pending`.
5. Extraction Agent initiates page fetch via Layer 1 (Firecrawl).
6. Agent classifies page type (overview vs. form) and adjusts traversal strategy.
7. Agent follows internal links, navigates paginated steps, and follows apply/CTA buttons as needed.
8. All fetched content is passed to AI normalization.
9. AI produces structured intelligence payload with per-field confidence scores.
10. Opportunity record is created or updated in the shared index.
11. Application record is created and linked to the opportunity.
12. Ingestion job status updated to `Completed` or `PartiallyCompleted` based on confidence thresholds.
13. User notified: real-time update if on screen (Stay mode), push/in-app notification if they left (Leave mode).

### Field Confidence

- Each extracted field stores a `confidence` score (0.0–1.0) and the source evidence string.
- Fields below the acceptable confidence threshold are flagged for user review.
- System never silently presents low-confidence data as certain to the user.

### Confidentiality

> The deep extraction strategy, adapter logic, traversal heuristics, and scoring algorithms are internal IP and confidential. Implementation detail beyond what is described here is protected.

---

## 10. Extraction Engine Architecture

> This is the engineering foundation of our core superpower. Extraction accuracy and depth is our primary competitive moat.

### Layer 1 — Content Fetching: Firecrawl (Primary)

**Role**: Converts any URL (static or JavaScript-rendered) into clean, structured markdown optimized for LLM consumption.

**Why Firecrawl**:
- Handles JavaScript-heavy sites that standard HTTP requests cannot reach.
- Returns noise-reduced markdown (strips nav, ads, footers, boilerplate).
- Supports single-page scraping and multi-page crawls in one API call.
- Output format designed specifically for feeding AI models.

**Fallback**: If Firecrawl returns low-confidence or incomplete output, escalate to Layer 2.

### Layer 2 — Browser Automation: Playwright (Secondary)

**Role**: Drives a real browser for sites that block headless fetching, require session state, or have complex multi-step flows.

**Why Playwright**:
- Handles portals with interactive multi-step forms.
- Can navigate paginated application steps programmatically.
- Used selectively (higher infrastructure cost) only when Layer 1 is insufficient.
- Powers the AI Agent’s tool-use interface for deep traversal.

### Layer 3 — Extraction Agent: AI with Tool Use (Orchestration)

**Role**: The intelligent orchestrator that decides what to fetch next, analyzes content, and produces the final normalized intelligence output.

**Capabilities**:
- Analyzes the initial page fetch and autonomously decides whether further traversal is needed.
- Invokes Firecrawl or Playwright tools to fetch additional pages (e.g. follows Apply Now to discover the form, navigates multi-step pages one by one).
- Moves back and forth between pages — acts like an intelligent researcher mapping the full scope of an opportunity.
- Normalizes all gathered content into the structured intelligence output format (see Section 11).
- Assigns per-field confidence scores.
- Assigns opportunity category internally — the user is never asked to categorize.

**Scope Boundary — Non-Negotiable**:
- Agent traverses and reads. It does NOT fill in, submit, or modify any form.
- Agent operates in read-only, non-destructive mode at all times.
- No form submission without explicit, policy-governed user authorization.

### Cost and Performance Strategy

- Layer 1 (Firecrawl) runs for every URL by default.
- Layer 2 (Playwright) is invoked only on escalation to limit cost and latency.
- Layer 3 (AI Agent) operates with a token budget and a maximum page traversal limit per job.
- Long-running extractions degrade gracefully: return partial results flagged with confidence warnings.
- All jobs are queued and asynchronous. UI never blocks on extraction latency.

---

## 11. AI-Generated Application Intelligence Output

This defines the exact structured output the Extraction Agent must produce for every application. This output powers the Application Details page and is the primary value we deliver to users.

### Required Output Fields

Every extraction job must attempt to produce all fields below. Fields that cannot be extracted with acceptable confidence are marked `null` with a reason code.

**Core Identity**
- `title` — Name of the opportunity
- `organizationName` — Body or institution governing the opportunity
- `category` — AI-assigned (Scholarship, Fellowship, Grant, Job, Internship, Research, Award, Training, etc. — list is open-ended, AI decides)
- `applicationUrl` — The canonical apply/form URL
- `sourceUrl` — The original URL pasted by the user

**Overview**
- `summary` — Concise AI-generated summary of what this opportunity is
- `description` — Full description of the opportunity
- `amount` — Funding, salary, stipend, or award value where applicable
- `location` — Physical location or Remote/Global designation

**Eligibility and Requirements**
- `eligibilityCriteria` — Bulleted list of conditions the applicant must meet
- `requiredDocuments` — List of required file attachments (e.g. CV in PDF, Research Proposal max 5 pages, 2 Academic Reference Letters)
- `formFields` — Known fields in the application form (name, email, essay prompts, GPA field, etc.)

**Timelines**
- `openDate` — Date applications opened (if stated)
- `deadline` — Application deadline with timezone if determinable
- `responseDate` — When applicants will hear back (if stated)
- `currentStatus` — e.g. Open for Applications, Closed, Coming Soon

**AI Guidance** *(ApplyLater’s primary differentiator — this content does not exist on source sites)*
- `whatMakesAGoodApplication` — AI insight into what the selection committee values and what a strong submission looks like
- `caveats` — Common mistakes, disqualifiers, and things applicants should avoid
- `keyHighlights` — Bullet-point highlights for quick scanning

**Metadata**
- `confidenceScore` — Overall extraction confidence (0.0–1.0)
- `extractedAt` — Timestamp of extraction completion
- `extractionMethod` — Which layers were used (firecrawl, playwright, agent)
- `needsUserReview` — Boolean: true if any critical fields are low-confidence

### Category Assignment

Categories are AI-assigned internally. The user is never prompted to select or confirm a category. The list is open-ended — the agent determines best fit from all available page signals.

Known categories (not exhaustive): Scholarship, Fellowship, Grant, Job, Internship, Research Position, Award and Competition, Volunteer Opportunity, Training Program.

---

## 12. App Screen Structure

ApplyLater has three primary navigation screens:

| Screen | Purpose |
|---|---|
| **Home** | Application list, analytics strip, and primary management hub |
| **Discover** | Community opportunity feed (low-priority MVP — see Section 17) |
| **Settings** | Notification preferences, profile, and account management |

The **Plus (+) button** is globally accessible from the Home screen and is the primary entry point for all new application creation flows:
- Paste a URL link
- Manual entry (future)
- Share from another app via share-target (mobile, future)

Navigation is bottom-tab on mobile. On desktop: sidebar or top navigation bar.

---

## 13. Application Home Screen (List View)

### Analytics Strip

Displayed prominently at the top of the Home screen. Updates in real time:
- Total active applications
- Closing soon (within 7 days)
- Pending actions or documents required
- Completed this cycle

### Filter Labels

Users can filter the application list by status:
- **All** — Unfiltered full list
- **Open** — Actively accepting applications
- **Closing Soon** — Deadline within N days (configurable)
- **Upcoming** — Not yet open
- **Not Open Yet** — Announced but opens in the future
- **In Progress** — User has started applying
- **Completed** — User has submitted
- **Parked** — Post-submission or user-archived

### Application List Row

Each row displays:
- Category badge (color-coded by type)
- Application title
- Organization name
- Remaining days to deadline
- Current status indicator
- Applicant count (ApplyLater users tracking this opportunity)

### Applicant Count

The count reflects how many platform users have saved or are tracking an opportunity. This:
- Creates social proof and urgency signals.
- Powers threshold-based reminder triggers.
- Is aggregated at canonical opportunity level (deduplicated across URL variants).
- Appears on both the list row and the details page.

---

## 14. Application Details Page

Every application opens to a fully formatted details page. This is the single source of truth for that application within ApplyLater and represents the full output of the extraction and AI intelligence pipeline.

### Page Sections

**Header**
- Category badge (e.g. SCHOLARSHIP, FELLOWSHIP, GRANT)
- Application title — large and prominent
- Organization name
- Closing date pill (calendar icon + formatted date)

**Overview**
- AI-generated summary
- Full description
- Amount / Compensation highlight card (if applicable)
- Location highlight card (if applicable)

**Eligibility Criteria**
- Bulleted list with checkmark icons
- Each criterion clearly separated

**What Makes a Good Application** *(ApplyLater original — not on source site)*
- AI-generated insight into what the selection body values
- Practical, specific tips for a competitive submission

**Caveats — Things to Avoid** *(ApplyLater original — not on source site)*
- Common disqualifiers and mistakes
- Red flags to watch out for

**Timeline**
- Visual timeline: Opened → Current Status → Closing
- Each milestone labeled with date and status marker

**Required Files / Documents**
- List of required attachments
- Each item shows document type, format constraints, and page/word limits

**Form Fields** *(extracted from actual application form)*
- Known fields the user will encounter when they apply
- Helps users prepare responses before opening the form

**Application Actions**
- **Save Draft** — Saves the application for later; no tracking pipeline started
- **Apply Now** — Opens in-app browser (or external fallback), triggers the full tracking pipeline

### Custom Reminder on the Spot

When a user is present at extraction completion, or when they first open the details page, they are offered the opportunity to set a custom reminder directly — modeled on Google Calendar’s flexible reminder UX:
- Date and time picker
- Multiple reminders per application (e.g. 7 days before AND 1 day before)
- Quick presets: 1 week, 3 days, 1 day, morning of deadline

This overrides the default global reminder for this specific application.

### Applicant Count on Details Page

Displayed prominently to reinforce urgency. If the count crossed a threshold since the user last visited, a contextual callout surfaces (e.g. “50 people are now tracking this”).

---

## 15. Reminder and Tracking Engine

### Default Reminder Behavior

- System default: reminder 3 days before deadline.
- User can override globally (applies to all applications unless overridden per-app).
- User can override per application (overrides global setting for that application only).
- User can mute all notifications for a specific application entirely.

### Custom Reminder on the Spot

When extraction completes and the user is present, or on first view of the details page, the system prompts:
- Set a custom reminder before leaving (Google Calendar-style UX)
- Multiple reminders supported per application
- Quick presets: 1 week, 3 days, 1 day, morning of deadline

### Tracking Pipeline After Apply Click

1. Mark `ApplicationStarted`.
2. Send check notification at 30 minutes.
3. If incomplete, recheck with exponential backoff (30m → 1h → 2h → 4h...).
4. At each step, surface “Don’t ask again” to halt the cycle for this application.
5. On completion confirmed, set `ApplicationCompleted`.
6. If a response date is known from extraction, schedule a response follow-up reminder.
7. Move state to `Parked` when all active tracking ends.

### Reminder Content — AI-Driven and Dynamic

Reminder notifications are not static strings. The AI has full context of the application and generates personalized copy designed to motivate action.

This means:
- Each reminder references the specific opportunity by name and relevant detail.
- Content adapts to the user’s current stage (e.g. “You haven’t started” vs. “You started but didn’t finish”).
- Tone and urgency scale as the deadline approaches.
- Reminders can reference freshness (“Only 2 days left”), social proof (“14 people on ApplyLater are tracking this”), or eligibility signals (“You appear to meet all listed criteria”).

### Trigger Classes

- Deadline proximity (default, configurable)
- Stage inactivity (user hasn’t progressed in N days)
- Missing required documents flagged from extraction
- Post-submission follow-up date (when response date is known)
- **Applicant count threshold** — when a tracked opportunity crosses defined milestones (e.g. 10, 50, 100 users), interested users receive a contextual nudge. Thresholds and messaging are tightly controlled to prevent notification noise.

---

## 16. In-App Application Experience

MVP direction:
- In-app browser with passive telemetry
- No sensitive form value logging by default
- Track high-level engagement events only

Telemetry events:
- `session_start`
- `page_change`
- `interaction_checkpoint`
- `session_end`
- `completion_prompt_response`

Fallback:
- If target site blocks embedded experience, open externally and continue tracking through checkpoints.

---

## 17. Discover Page and Opportunity Feed

**MVP Status: LOW PRIORITY**

Discover is strategically important but not blocking MVP launch. The framework below ensures we can expand into this pillar efficiently in Stage 4+.

### Data Sources for Discover

**Primary Source (MVP):**
- User-pasted links from the community
- Deduplicated at canonical URL level
- Ranked by platform relevance signals

**Secondary Sources (Post-MVP):**
- Curated opportunity APIs (LinkedIn, handshake, etc.)
- Partner opportunity channels
- AI-generated recommendations from similar profiles

### Discover Feed Ranking Factors

1. Profile relevance (skill match, career stage)
2. Deadline urgency (upcoming deadlines surface first)
3. Opportunity freshness (recently added to platform)
4. Extraction confidence quality (high-confidence fields boost ranking)
5. User engagement signals (saves, applies, completion rates by similar users)
6. Dedupe quality (canonical URL clustering prevents noise)

### Future Discover Enhancements

- Skill fit score (ML-based career trajectory matching)
- Historical completion correlation (opportunities similar to ones user completed)
- Community interest trend (rising opportunities based on saves/applies)
- Category recommendations (based on user activity patterns)
- Social signals (opportunities endorsed by users in your network)

### Architecture Implication

User-pasted links will feed a shared opportunity index. Early Discover MVP will surface only deduplicated, high-confidence opportunities. This approach:
- Reduces infrastructure cost early
- Creates viral loop (users discover → apply → create social proof)
- Allows gradual ranking sophistication without blocking core product
- Prepares for future social and discovery features

---

## 18. Social Capital and Weak-Tie Bridging (Future Growth)

**MVP Status: NOT INCLUDED** | **Target: Stage 7-8+**

Research shows that 73% of people land opportunities through personal connections. ApplyLater will eventually address the "social capital gap" by helping users bridge weak ties and discover mentorship.

### Problem We Solve

Many opportunities and career advice are locked behind strong-tie networks (close friends, family, direct contacts). Users with smaller networks or less privileged backgrounds face friction discovering these opportunities.

### Future Features (Post-MVP)

**Stage 7: Mentorship Discovery**
- User profile that surfaces relevant experience and background
- Match with potential mentors based on career stage and field
- Request/accept mentorship relationships
- Mentor-specific reminders (goal check-ins, milestone reviews)

**Stage 8: Weak-Tie Bridging**
- Identify second and third-degree connections relevant to opportunity type
- Facilitate introductions with context
- Track who helped with each application
- Build user's "social capital network graph"

**Stage 9+: Community Intelligence**
- Opportunity recommendations from users with similar profiles who succeeded
- Success stories and lessons learned from community
- Peer application reviews and feedback
- Collective opportunity curation (trending, endorsed, hot)

### Implementation Principle

Social features will be opt-in and intentionally designed to avoid:
- Pressure to share applications or network data
- Spam from unvetted connections
- Privacy leaks through application history

Social discovery will enhance, not replace, the core execution pillar.

---

## 19. AI Responsibilities

MVP AI responsibilities:
- Summarize opportunity
- Extract requirements and timeline highlights
- Explain what makes a strong application
- Generate caveats and avoidable mistakes
- Suggest category tagging

Post-MVP AI responsibilities:
- Stage-specific coaching
- Checklist generation using profile context
- Approval-gated autofill assistance
- Opportunity recommendation based on profile and historical performance

Guardrails:
- AI suggestions are advisory.
- User remains decision-maker.
- No silent submission without explicit policy permission.

---

## 20. Mobile-First Architecture Path

Current web app is the mobile simulation and API proving ground.

Mobile-readiness requirements:
- Share-target integration contract
- Clipboard intake contract
- Notification payload contract
- Deep-link contract
- Polling and job-status contract

---

## 21. Integrations

MVP-priority integrations:
- Extraction/fetch infrastructure
- AI model provider
- Notification channels (in-app first, email second)

Near-future integrations:
- Mobile push provider
- Analytics/observability stack
- Optional partner opportunity sources

---

## 22. Security and Trust

1. Data minimization for in-app tracking.
2. Explicit user controls for reminders/tracking.
3. Safe retry and idempotency for ingestion jobs.
4. Abuse protection on URL submission endpoints.
5. Audit logging for critical state changes.

---

## 23. Edge Cases and Failure Modes

1. Invalid or dead URL
2. JS-heavy pages with weak static extraction
3. Duplicate opportunities under tracking URLs
4. Missing or ambiguous deadline timezone
5. Conflicting extracted deadlines
6. Site blocks embedded browser
7. User applies externally and forgets completion
8. Reminder noise from overlapping triggers
9. Large ingestion bursts
10. AI hallucinated details with weak source data

Handling principles:
- Degrade gracefully
- Expose confidence and uncertainty
- Never block user control

---

## 24. MVP Success Metrics

1. Link-to-structured-record success rate
2. Extraction accuracy on critical fields
3. Save-to-apply conversion rate
4. Apply-start to apply-complete conversion rate
5. Reminder click-through and completion lift
6. Stage progression completion ratio
7. Retention for active-application cohorts

---

## 25. Development Stages

### Stage 1: Foundation
- Domain schema (Application, ApplicationStage, Reminder, etc.)
- Application CRUD APIs
- Ingestion jobs/statuses
- Dashboard wiring to live data

### Stage 2: Tracking Core
- Stage eventing and history
- Reminder rules and defaults
- Notification center (in-app + email)
- Completion tracking pipeline

### Stage 3: In-App Engagement
- In-app browser shell
- Passive telemetry (session, interaction, completion)
- Checkpoint-based reminders
- External fallback handling

### Stage 4: Discover Intelligence (Low Priority MVP)
- Link deduplication at canonical URL level
- Discover feed basic ranking (freshness, deadline, user relevance)
- User-pasted link aggregation and indexing
- Basic opportunity search and filtering

### Stage 5: AI Enhancement
- Richer summarization and extraction
- Stage-specific coaching
- Policy-based automation preparation

### Stage 6: Mobile and Deep Links
- Mobile native app scaffolding
- Share-target and clipboard integration
- Deep link contract for opportunity routing

### Stage 7: Mentorship Discovery (Future Growth)
- User profile expansion for mentoring
- Mentor-mentee matching
- Social capital network graph

### Stage 8: Weak-Tie Bridging (Future Growth)
- Connection discovery and introduction facilitation
- Weak-tie relevance scoring
- Social proof and success stories

### Stage 9+: Community Intelligence (Future Growth)
- Opportunity recommendations from similar users
- Peer feedback and collaboration
- Collective intelligence features

---

## 26. Sprint Ticket Structure (Template)

Every ticket must define:
- objective
- data model impact
- endpoint changes
- UX surface changes
- acceptance criteria
- telemetry events
- rollback strategy

---

## 27. Revenue and Expansion

Current strategy:
- Focus on high-value execution and retention.

Future monetization options:
1. Subscription tiers
2. Premium AI guidance
3. Enterprise/school partnerships
4. Curated opportunity channels

---

## 28. Hard Constraints

1. Never hide uncertainty in extracted data.
2. Never spam reminders when user opted out.
3. Never overwrite stage history destructively.
4. Never run autonomous submission without explicit policy.
5. Never couple UI delivery directly to extraction latency.

---

## 29. Governance and Ownership

Internal stakeholders:
- Backend: Dotun
- Mobile: Samuel
- UI/UX and Product: Williams

Operating rule:
- Update this document whenever scope, architecture, or delivery status changes.

---

## 30. Immediate Next Build Targets

1. Add domain Prisma models and migrations.
2. Build link ingestion job pipeline.
3. Wire dashboard list/details to live APIs.
4. Implement reminder defaults and per-app controls.
5. Implement tracking pipeline after Apply click.
6. Add polling and completion notifications.

---

## 31. Changelog

Version 1.2
- Defined Extraction Engine Architecture (Section 10): Firecrawl + Playwright + AI Agent with tool use.
- Documented two input link types (overview page vs. actual form page) and unified handling.
- Added full AI-Generated Application Intelligence Output spec (Section 11): all required fields including AI guidance as primary differentiator.
- Added App Screen Structure (Section 12): Home, Discover, Settings with Plus button entry point.
- Added Application Home Screen (Section 13): analytics strip, filter labels, applicant count, list row format.
- Added Application Details Page (Section 14): full page section breakdown including What Makes a Good Application and Caveats as ApplyLater originals.
- Updated Reminder Engine (Section 15): AI-driven dynamic reminder copy, applicant count threshold triggers, on-the-spot custom reminder UX.
- Updated End-to-End Workflow (Section 6): stay/leave UX, on-the-spot reminder, applicant count.
- Updated MVP Capability Matrix (Section 7): applicant count tracking and on-the-spot reminder rows.
- Renumbered all subsequent sections (11-26 → 16-31).

Version 1.1
- Added Discover Page framework with user-pasted links as primary data source (low-priority MVP).
- Added Social Capital and Weak-Tie Bridging as future growth areas (Stages 7-9+).
- Incorporated research finding: 73% of people land opportunities through personal connections.
- Expanded Development Stages from 5 to 9+ with clear MVP vs. future boundaries.
- Clarified discovery architecture to bootstrap with community links before external sources.

Version 1.0
- Initial master reference aligned with raw business model and current repository state.
- Set MVP emphasis on deep application tracking and extraction accuracy.
