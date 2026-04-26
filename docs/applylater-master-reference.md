# ApplyLater — Master Reference Document
ApplyLater · Confidential
Version 1.0 · Owner: Product Team · Status: Living Document

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

1. User pastes an opportunity link.
2. System validates, normalizes, deduplicates, and queues extraction.
3. Extraction collects structured details.
4. AI normalizes, summarizes, and enriches details.
5. Application record is created.
6. User gets immediate or deferred completion notification.
7. Reminder and tracking pipeline activates.
8. User clicks Apply and engagement tracking starts.
9. Completion and post-submission tracking continue until parked/closed.

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

Pipeline flow:
1. Receive URL.
2. Validate and normalize URL.
3. Check duplicate/canonical URL match.
4. Queue ingestion job.
5. Fetch content.
6. Run extraction adapters.
7. Run AI normalization pass.
8. Return structured payload with confidence.
9. Create or update opportunity and application.
10. Notify user.

Field confidence:
- Each extracted field stores confidence and source evidence.

Confidential extraction logic:
- Deep extraction strategy remains internal and protected.

---

## 10. Reminder and Tracking Engine

Default behavior:
- Default reminder: 3 days before deadline.
- User can override globally and per application.
- User can mute notifications per application.

Tracking pipeline after Apply click:
1. Mark `ApplicationStarted`.
2. Send check notification at 30 minutes.
3. If incomplete, recheck with exponential backoff.
4. Offer `Don’t ask again` control.
5. On completion, set `ApplicationCompleted`.
6. If response date exists, schedule response follow-up reminder.
7. Move state to `Parked` when active flow ends.

Trigger classes:
- Deadline proximity
- Stage inactivity
- Missing required fields/documents
- Post-submission follow-up date
- Applicant-threshold signals (future controlled rollout)

---

## 11. In-App Application Experience

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

## 12. Discover Page and Opportunity Feed

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

## 13. Social Capital and Weak-Tie Bridging (Future Growth)

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

## 14. AI Responsibilities

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

## 15. Mobile-First Architecture Path

Current web app is the mobile simulation and API proving ground.

Mobile-readiness requirements:
- Share-target integration contract
- Clipboard intake contract
- Notification payload contract
- Deep-link contract
- Polling and job-status contract

---

## 16. Integrations

MVP-priority integrations:
- Extraction/fetch infrastructure
- AI model provider
- Notification channels (in-app first, email second)

Near-future integrations:
- Mobile push provider
- Analytics/observability stack
- Optional partner opportunity sources

---

## 17. Security and Trust

1. Data minimization for in-app tracking.
2. Explicit user controls for reminders/tracking.
3. Safe retry and idempotency for ingestion jobs.
4. Abuse protection on URL submission endpoints.
5. Audit logging for critical state changes.

---

## 18. Edge Cases and Failure Modes

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

## 19. MVP Success Metrics

1. Link-to-structured-record success rate
2. Extraction accuracy on critical fields
3. Save-to-apply conversion rate
4. Apply-start to apply-complete conversion rate
5. Reminder click-through and completion lift
6. Stage progression completion ratio
7. Retention for active-application cohorts

---

## 20. Development Stages

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

## 21. Sprint Ticket Structure (Template)

Every ticket must define:
- objective
- data model impact
- endpoint changes
- UX surface changes
- acceptance criteria
- telemetry events
- rollback strategy

---

## 22. Revenue and Expansion

Current strategy:
- Focus on high-value execution and retention.

Future monetization options:
1. Subscription tiers
2. Premium AI guidance
3. Enterprise/school partnerships
4. Curated opportunity channels

---

## 23. Hard Constraints

1. Never hide uncertainty in extracted data.
2. Never spam reminders when user opted out.
3. Never overwrite stage history destructively.
4. Never run autonomous submission without explicit policy.
5. Never couple UI delivery directly to extraction latency.

---

## 24. Governance and Ownership

Internal stakeholders:
- Backend: Dotun
- Mobile: Samuel
- UI/UX and Product: Williams

Operating rule:
- Update this document whenever scope, architecture, or delivery status changes.

---

## 25. Immediate Next Build Targets

1. Add domain Prisma models and migrations.
2. Build link ingestion job pipeline.
3. Wire dashboard list/details to live APIs.
4. Implement reminder defaults and per-app controls.
5. Implement tracking pipeline after Apply click.
6. Add polling and completion notifications.

---

## 26. Changelog

Version 1.1
- Added Discover Page framework with user-pasted links as primary data source (low-priority MVP).
- Added Social Capital and Weak-Tie Bridging as future growth areas (Stages 7-9+).
- Incorporated research finding: 73% of people land opportunities through personal connections.
- Expanded Development Stages from 5 to 9+ with clear MVP vs. future boundaries.
- Clarified discovery architecture to bootstrap with community links before external sources.

Version 1.0
- Initial master reference aligned with raw business model and current repository state.
- Set MVP emphasis on deep application tracking and extraction accuracy.
