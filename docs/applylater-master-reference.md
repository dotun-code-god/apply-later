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

## 12. Discover and Ranking Baseline

Discover feed ranking factors:
1. Profile relevance
2. Deadline urgency
3. Opportunity freshness
4. Extraction confidence quality
5. User engagement signals

Future additions:
- Skill fit score
- Historical completion correlation
- Community interest trend

---

## 13. AI Responsibilities

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

Guardrails:
- AI suggestions are advisory.
- User remains decision-maker.
- No silent submission without explicit policy permission.

---

## 14. Mobile-First Architecture Path

Current web app is the mobile simulation and API proving ground.

Mobile-readiness requirements:
- Share-target integration contract
- Clipboard intake contract
- Notification payload contract
- Deep-link contract
- Polling and job-status contract

---

## 15. Integrations

MVP-priority integrations:
- Extraction/fetch infrastructure
- AI model provider
- Notification channels (in-app first, email second)

Near-future integrations:
- Mobile push provider
- Analytics/observability stack
- Optional partner opportunity sources

---

## 16. Security and Trust

1. Data minimization for in-app tracking.
2. Explicit user controls for reminders/tracking.
3. Safe retry and idempotency for ingestion jobs.
4. Abuse protection on URL submission endpoints.
5. Audit logging for critical state changes.

---

## 17. Edge Cases and Failure Modes

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

## 18. MVP Success Metrics

1. Link-to-structured-record success rate
2. Extraction accuracy on critical fields
3. Save-to-apply conversion rate
4. Apply-start to apply-complete conversion rate
5. Reminder click-through and completion lift
6. Stage progression completion ratio
7. Retention for active-application cohorts

---

## 19. Development Stages

### Stage A: Foundation
- Domain schema
- Application APIs
- Ingestion jobs/statuses

### Stage B: Tracking Core
- Stage eventing
- Reminder rules
- Notification center

### Stage C: In-App Engagement
- In-app browser shell
- Passive telemetry
- Completion checkpoint loop

### Stage D: Discover Intelligence
- Ranking baseline
- Source quality and dedupe

### Stage E: AI Enhancement
- Richer coaching
- Policy-based automation preparation

---

## 20. Sprint Ticket Structure (Template)

Every ticket must define:
- objective
- data model impact
- endpoint changes
- UX surface changes
- acceptance criteria
- telemetry events
- rollback strategy

---

## 21. Revenue and Expansion

Current strategy:
- Focus on high-value execution and retention.

Future monetization options:
1. Subscription tiers
2. Premium AI guidance
3. Enterprise/school partnerships
4. Curated opportunity channels

---

## 22. Hard Constraints

1. Never hide uncertainty in extracted data.
2. Never spam reminders when user opted out.
3. Never overwrite stage history destructively.
4. Never run autonomous submission without explicit policy.
5. Never couple UI delivery directly to extraction latency.

---

## 23. Governance and Ownership

Internal stakeholders:
- Backend: Dotun
- Mobile: Samuel
- UI/UX and Product: Williams

Operating rule:
- Update this document whenever scope, architecture, or delivery status changes.

---

## 24. Immediate Next Build Targets

1. Add domain Prisma models and migrations.
2. Build link ingestion job pipeline.
3. Wire dashboard list/details to live APIs.
4. Implement reminder defaults and per-app controls.
5. Implement tracking pipeline after Apply click.
6. Add polling and completion notifications.

---

## 25. Changelog

Version 1.0
- Initial master reference aligned with raw business model and current repository state.
- Set MVP emphasis on deep application tracking and extraction accuracy.
