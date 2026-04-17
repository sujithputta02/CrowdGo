<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# CrowdGo PRD

## Product overview

CrowdGo is a real-time venue experience platform for large-scale sporting venues that reduces attendee friction across arrival, entry, navigation, concessions, restrooms, seat return, and exit. The product combines predictive crowd orchestration, personalized attendee guidance, and venue operations coordination to reduce waiting time, smooth crowd movement, and protect live-match moments that fans would otherwise miss due to queues or confusion.[^1][^2][^3][^4][^5]

Large venues face recurring attendee pain points that are operationally small but emotionally significant: incorrect gate choice, unclear indoor navigation, long food and restroom lines, difficulty returning to seats, crowded chokepoints, weak staff coordination, and chaotic post-match dispersal. Research on stadium egress and crowd management shows that both built environment constraints and human behavior shape flow quality, which means an effective product must combine real-time sensing, predictive analytics, dynamic guidance, and coordinated operational playbooks rather than static maps or one-off notifications alone.[^2][^3][^4][^5][^6][^1]

## Product name

**CrowdGo**

### Brand rationale

The name is short, app-like, easy to pronounce, and aligned with sports-product naming patterns that favor compact, memorable, action-oriented brand words. It directly reflects the product’s promise: helping crowds move better without making the venue feel controlled or stressful.[^7][^8][^9]

### Tagline

**Go smarter. Wait less. Miss nothing.**

## Problem statement

Attendees at large sporting venues lose time, comfort, and confidence due to fragmented venue systems that do not adapt to real-time crowd conditions. Fans must often guess the best gate, walk to overloaded concessions, wait without clear time expectations, miss live action while in line, and struggle to coordinate with both the venue and their own group.[^4][^5][^10]

Operations teams face the opposite problem: they may have pockets of data but lack a unified system that converts crowd signals into live decisions, staff actions, attendee nudges, and measurable service improvements. The result is not just congestion; it is a degraded live experience.[^6][^11][^12]

## Vision

Create the most attendee-centered venue movement platform by turning real-time crowd intelligence into low-effort guidance, proactive service orchestration, and measurable improvements in fan experience, operational efficiency, and safety.[^11][^13][^6]

## Goals

- Reduce average attendee wait time for entry, concessions, and restrooms.[^4][^11]
- Reduce missed live-play time caused by leaving the seat for services.[^4]
- Improve crowd distribution across gates, concourses, concessions, and exits.[^1][^2]
- Improve first-time visitor confidence through better wayfinding and contextual guidance.[^3][^13]
- Improve staff response time and venue-wide coordination using shared operational playbooks.[^12][^14]
- Build a production-feasible MVP that fits within a Google Cloud free trial / billing trial account by prioritizing managed services with controllable usage and staged rollout.[^15][^16][^12]


## Non-goals

- Full emergency evacuation control system replacement.
- Hardware-heavy deployment requiring custom IoT manufacturing in phase one.
- Turn-by-turn high-precision indoor positioning comparable to airport-grade proprietary infrastructure on day one, because Google Maps Platform supports routing and mapping services well, but precise indoor stadium positioning may require supplemental venue mapping or beacon support.[^17][^18]
- Marketplace-scale food delivery logistics inside the venue in the initial MVP.


## Users

### Primary users

- Match attendees at large stadiums, especially first-time visitors, families, elderly users, and fans with accessibility needs.
- Venue operations managers.
- Ground staff, stewards, cleaners, concession supervisors, and mobility-support staff.


### Secondary users

- Event organizers and sponsors.
- Venue analytics and customer-experience teams.


## User problems

### Attendee problems

- Choosing the wrong gate increases entry delay.[^1]
- Indoor wayfinding is confusing, especially after entry and after leaving the seat.[^13][^3]
- Concession and restroom lines are unpredictable, and users often miss live play while waiting.[^5][^4]
- Nearby options are not always the fastest options.
- Group coordination is difficult after people split up.
- Exit surges create stress and fatigue after the event.[^19][^2]


### Operations problems

- Data from gates, sensors, POS, and staff reports is fragmented.
- Teams detect problems late instead of preventing them.
- Staff responses are inconsistent because triggers and playbooks are not standardized.
- Success is hard to measure consistently without unified observability and analytics.[^20][^12]


## Core product concept

CrowdGo combines two tightly linked systems:

1. **Attendee Guidance Layer**: a mobile-first interface that tells each attendee the best next action, such as the best gate, fastest restroom, shortest concession option, best moment to leave the seat, or best exit route.
2. **Venue Orchestration Layer**: an operations dashboard that ingests live venue events, predicts crowd surges, recommends interventions, and helps staff coordinate responses.

The product’s unique design principle is to optimize for **experience continuity**, not just movement efficiency. The product should reduce the number of moments where a fan feels forced to think, guess, wait, or miss the match.[^5][^4]

## Product principles

- **User effort must be minimal.** The product recommends the next best action rather than expecting the user to explore a heavy feature set.
- **Predictions must lead operations.** The system should identify surges before they become visible to attendees.[^11]
- **Physical and digital guidance must work together.** App guidance alone is insufficient in dense venues.[^3]
- **Trust matters more than novelty.** Wait times and route suggestions must be honest and clear.
- **Accessibility is first-class.** Routes and instructions must adapt to mobility needs.
- **Privacy must be practical.** Use aggregated signals and minimal personally identifiable data where possible.[^6]


## Solution scope

### MVP scope

- Pre-arrival gate recommendation.
- Venue map with zone-based route guidance.
- Personalized “best next option” cards.
- Live queue estimates for gates, restrooms, and concessions.
- “Return to seat” guidance.
- Exit recommendation by destination type such as parking, rideshare, or public transit.
- Staff incident reporting.
- Operator dashboard with venue health and intervention recommendations.
- Streaming analytics pipeline.
- Metrics dashboard and operational SLO tracking.[^21][^12]


### Post-MVP scope

- Deeper indoor mapping augmentation.
- Micro-fulfillment / roaming vendor optimization.
- Computer vision-based density inference at scale.
- Sponsor integrations and loyalty rewards.
- Multi-venue admin panel.


## Key features

### Attendee-facing features

#### Smart arrival

- Recommended arrival window.
- Recommended gate based on ticket section and current crowd state.
- Parking/transit approach suggestions where venue integration exists.


#### In-venue guidance

- Fastest nearby restroom suggestion.
- Fastest concession option based on live queue + walking time.
- Accessible route mode.
- “Take me back to my seat” action.
- Landmark-based route instructions for indoor usability.[^13][^3]


#### Match-moment protection

- Suggestions like “leave now and return before the next over/quarter break” to reduce missed live moments.
- Queue prediction confidence ranges rather than false precision.


#### Group coordination

- Shareable meet points.
- Section-based reunion suggestions.


#### Exit flow

- Recommended exit by destination.
- Soft-stagger prompts to reduce choke points after the event.[^2][^19]


### Operations-facing features

#### Venue control dashboard

- Gate load view.
- Concourse density indicators.
- Restroom and concession wait health.
- Top active incidents.
- Recommendation feed for interventions.


#### Playbook engine

- If queue threshold exceeded, suggest gate diversion, extra staff, signage change, or lane activation.
- If restroom overload predicted, redirect zones and dispatch service staff.
- If concession surge detected, suggest pop-up counter or mobile vendor redeployment.


#### Staff tooling

- Fast incident reporting with severity, location, photo, and status.
- Task dispatch and acknowledgment.
- Zone communication feed.


## End-to-end experience flow

### Before arrival

The attendee receives a pre-event card with arrival recommendation, gate suggestion, and saved ticket context. This reduces decision stress before reaching the venue.

### Arrival and ingress

The app confirms the fastest gate in near real time. If conditions change, the attendee gets a simple reroute suggestion rather than a complex venue alert.

### Inside the venue

The home screen focuses on one primary recommendation at a time. The attendee can also manually choose from restroom, food, seat return, and exit options.

### During play

The system predicts when leaving the seat is least disruptive. It can suggest the best nearby option and expected time back to seat.

### Post-match

The attendee sees the best exit route based on selected transport mode and live egress load.

## Detailed UI/UX requirements

### UX strategy

The interface must feel like a calm assistant, not a surveillance dashboard. Sports venue environments are noisy, crowded, time-sensitive, and cognitively demanding, so the interface should minimize choices, reduce reading load, and maintain very high clarity under stress.[^5][^4]

### Design goals

- Reduce cognitive load.
- Make the next action obvious within 2 seconds.
- Keep the number of primary actions per screen low.
- Use large touch targets suitable for walking users.
- Make status, wait time, and direction understandable at a glance.
- Support accessibility, multilingual labels, and color-safe indicators.


### Information architecture

#### Attendee app primary navigation

- Home
- Map
- Orders/Services
- Ticket/Seat
- Profile/Settings


#### Attendee app home priorities

1. Current recommendation card.
2. Ticket and seat reference.
3. Fast actions: Gate, Restroom, Food, Seat, Exit.
4. Live venue updates.

#### Operations dashboard primary areas

- Venue overview
- Crowd map
- Queues
- Incidents
- Staff dispatch
- Analytics
- Settings


### Attendee app screen requirements

#### Home screen

- Hero recommendation card with one action only.
- Live context chips: gate status, wait estimate, seat section, network state.
- Quick actions as large thumb-friendly buttons.
- Minimal text with strong icon + label pairing.


#### Map screen

- Zone-level venue map.
- Highlighted route with simple landmarks.
- Filters for restroom, food, help desk, accessible path, exits.
- Route summary panel with walk time + wait time.
- “Back to seat” persistent shortcut.


#### Queue card design

Each queue-related card must show:

- estimated wait range,
- walking time,
- confidence label such as High/Medium,
- why the recommendation is better, such as “2 min farther, 7 min faster overall.”


#### Exit screen

- Select destination type.
- Show recommended gate/exit and congestion level.
- Show whether waiting 2–5 minutes could reduce stress.


### UX details most teams miss

- Persistent seat identity and “return to seat” shortcut.
- Queue transparency with ranges instead of fake precision.
- Offline-tolerant basic ticket and seat display.
- Fat-finger-friendly controls for moving users.
- Dark mode for night events.
- Haptic or notification feedback for reroutes.
- Multi-language support for common venue audiences.
- Accessibility settings for reduced motion, high contrast, and step-free paths.


### Visual design requirements

- Mobile-first layout.
- Use a clean sports-tech identity with high contrast and bold action colors.
- One dominant accent color, not a rainbow UI.
- Typography must remain readable while walking.
- Touch targets minimum 44x44 px.
- Body text minimum 16 px.
- Avoid cluttered dashboards on attendee screens.


### Accessibility requirements

- WCAG AA color contrast target.[^12]
- Screen-reader labels on all actions.
- Keyboard access for web dashboard.
- Reduced motion mode.
- Step-free route option.
- Text alternatives for icons.


## Functional requirements

### FR1 Identity and session

- Users can sign in using ticket-linked identity or anonymous guest mode.
- Users can attach ticket section, row, and seat for personalization.


### FR2 Crowd and queue ingestion

- System ingests event streams from gates, POS, staff reports, and optional sensor feeds in near real time using Google Cloud streaming services.[^22][^23][^15]


### FR3 Recommendation engine

- System calculates best next option using walking time, predicted queue length, route constraints, and user preferences.
- System supports rule-based logic in MVP and ML-enhanced ranking later using Vertex AI.[^24][^25]


### FR4 Mapping and routing

- System supports venue zone maps and route generation using Google Maps Platform routes and related mapping APIs where appropriate.[^18][^26]
- Indoor precision limitations must be clearly documented, with the ability to use zone-based navigation in MVP.[^17]


### FR5 Notifications

- System pushes live updates via Firebase Cloud Messaging for reroutes, queue opportunities, and incident-related guidance.[^16]


### FR6 Operations control

- Dashboard shows venue state, queue state, incidents, and recommended actions.
- Staff tasks can be assigned, acknowledged, and resolved.


### FR7 Analytics and observability

- Product captures event, service, and experience metrics in BigQuery.
- Product exposes service health and SLOs through Google Cloud Monitoring and Observability.[^20][^21][^12]


### FR8 Feedback loop

- Users can rate recommendation usefulness and optionally report issues.
- Operators can review recommendation acceptance and outcome quality.


## Non-functional requirements

- High availability during event peaks.
- P95 recommendation API latency under 2 seconds.
- Notification dispatch under 10 seconds from qualifying event.
- Dashboard updates near real time.
- Graceful degradation during partial network failure.
- Privacy-safe data handling and role-based admin access.
- Audit logs for operator actions.


## Technical architecture

### Frontend

- **Framework:** Next.js.
- **Reason:** strong hybrid rendering model, good app-router ergonomics, production-friendly DX, and flexible support for attendee web app plus operator dashboard.
- **Deployment target:** Firebase App Hosting or Cloud Run depending on build and hosting preference.


### Backend

- **Runtime:** Node.js.
- **API framework:** Express.js.
- **Reason:** rapid implementation, strong ecosystem, simple middleware patterns, and easy Google Cloud SDK integration.
- **Deployment target:** Cloud Run.


### Realtime and data layer

- **Realtime app data:** Firebase Firestore for app state, user state, and light operational records; Firebase documentation notes Firestore and Realtime Database have different trade-offs, and Firestore is generally a strong default for broader app development while Realtime Database is useful for ultra-low-latency sync needs.[^27][^28]
- **Event streaming:** Pub/Sub.[^23][^15]
- **Stream processing:** Dataflow.[^22]
- **Analytics warehouse:** BigQuery.[^29][^15]
- **Notifications:** Firebase Cloud Messaging.[^16]
- **ML/AI:** Vertex AI for surge prediction, recommendation ranking, and anomaly detection.[^25][^24]
- **Monitoring:** Cloud Monitoring, Logging, Error Reporting, Trace.[^14][^12]


### Maps layer

- Google Maps Platform Routes API for route generation and travel summaries.[^18]
- Places or curated venue POIs for concession/restroom markers as applicable.
- Venue-specific zone overlays maintained in product data.


## Google services mapping

| Product need | Google service | Usage in CrowdGo |
| :-- | :-- | :-- |
| User auth | Firebase Authentication | Sign-in, anonymous session, role gating |
| App hosting / frontend hosting | Firebase App Hosting or Cloud Run | Host Next.js app |
| Mobile/web push | Firebase Cloud Messaging | Real-time user and staff notifications [^16] |
| Primary app database | Cloud Firestore | User state, venue state, incidents [^28] |
| Event ingestion | Pub/Sub | Gate scans, POS events, incident streams [^15] |
| Stream processing | Dataflow | Aggregation, queue estimates, surge detection [^22] |
| Analytics | BigQuery | KPI reporting, post-event analysis [^29] |
| ML models | Vertex AI | Predictions and recommendation ranking [^24][^25] |
| Routing | Google Maps Platform Routes API | Access and route recommendations [^18] |
| Monitoring | Cloud Monitoring / Ops Suite | SLOs, dashboards, alerting [^12][^20] |
| Secrets | Secret Manager | API keys, config |
| Object storage | Cloud Storage | Assets, incident images |
| API deployment | Cloud Run | Express backend |

## Billing-trial-friendly implementation guidance

Because the product is being planned for a billing trial account, the MVP should stay disciplined in scope and prioritize pay-as-you-go managed services with clear caps, low idle cost, and low ops overhead. Google Cloud’s managed analytics, messaging, and monitoring stack is suitable for incremental rollout, but services such as Maps Platform, BigQuery streaming, Dataflow jobs, and Vertex AI must be used carefully to avoid waste during development and demo phases.[^15][^12][^18]

### Cost-conscious MVP rules

- Use **synthetic event streams** and limited venue simulation during development instead of always-on production-volume streaming.
- Use **one demo venue** with a small number of zones, gates, and service points.
- Use **rule-based recommendations first**, then add a lightweight Vertex AI model only where needed.
- Use **Cloud Run autoscaling min instances = 0** for backend services outside active demos.
- Use **Firestore** for core product state and avoid overengineering multiple operational databases.
- Use **BigQuery** mainly for event analytics and dashboard queries, with partitioning and limited retention.
- Use **Dataflow** only for the streaming path that materially improves the demo, otherwise support local batch replay for test scenarios.
- Use **Firebase Cloud Messaging** for live alerts instead of costly custom notification infrastructure.[^16]


### Suggested MVP service selection for trial account

**Must use**

- Firebase Authentication
- Firestore
- Firebase Cloud Messaging
- Cloud Run
- Pub/Sub
- BigQuery
- Cloud Monitoring
- Google Maps Platform Routes API

**Use selectively**

- Dataflow
- Vertex AI
- Cloud Storage
- Secret Manager


## Data model overview

### Core entities

- User
- Ticket
- Venue
- Zone
- Gate
- Route
- QueueSnapshot
- ServicePoint
- Incident
- StaffTask
- Recommendation
- Notification
- EventMetric


### Example logical relationships

- A User may have one or more Tickets.
- A Ticket maps to one Venue and one Seat location.
- A Venue contains many Zones, Gates, and ServicePoints.
- QueueSnapshots belong to Gates or ServicePoints.
- Recommendations are generated for a User in a given context.
- Incidents produce StaffTasks and operational alerts.


## API requirements

### Public/attendee APIs

- `POST /auth/session`
- `GET /venue/:venueId/home-context`
- `GET /venue/:venueId/map`
- `GET /recommendations/next-best-action`
- `GET /queues/nearby`
- `GET /route/to-seat`
- `GET /route/to-service`
- `GET /exit/recommendation`
- `POST /feedback/recommendation`


### Ops APIs

- `GET /ops/venue-overview`
- `GET /ops/queues`
- `GET /ops/incidents`
- `POST /ops/incidents`
- `POST /ops/tasks/assign`
- `POST /ops/interventions/execute`
- `GET /ops/analytics/kpis`


### Internal event APIs

- `POST /events/gate-scan`
- `POST /events/pos`
- `POST /events/sensor`
- `POST /events/staff-report`


## Recommendation logic

### MVP recommendation formula inputs

- walking time,
- current queue estimate,
- predicted queue change,
- event timing context,
- user accessibility preference,
- route confidence,
- service availability.


### Recommendation output format

- Title.
- Primary action.
- Estimated total time.
- Confidence label.
- Reason statement.
- Fallback option.


### Example

“Go to Snack Hub C now — 6 minutes total, about 7 minutes faster than your nearest counter, and you can likely return before play resumes.”

## Analytics and success metrics

### Product KPIs

- Average entry wait time reduction.
- Average concession wait time reduction.
- Average restroom wait time reduction.
- Recommendation acceptance rate.
- Return-to-seat success before live play resumes.
- Exit clearance time improvement.
- Attendee satisfaction score.


### Operational KPIs

- Queue prediction error.
- Incident response time.
- Task acknowledgment time.
- Staff dispatch completion rate.
- Zone congestion duration.


### Platform KPIs

- API availability.
- P95 latency.
- Notification delivery rate.
- Stream freshness.
- BigQuery pipeline success rate.
- SLO attainment.[^21][^12][^20]


## SLO and observability requirements

- Recommendation API availability SLO: 99.5% during active event windows.
- Notification pipeline SLO: 99% delivery initiation within 10 seconds.
- Event ingestion freshness SLO: 95% of events visible in ops dashboard within 15 seconds.
- Queue estimation service SLO: 95% of estimates refreshed within 30 seconds.

Cloud Monitoring must expose dashboards for API health, Pub/Sub throughput, Cloud Run latency, Firestore errors, notification failures, and recommendation volumes, with alerting tied to event windows and error budgets.[^12][^20][^21]

## Security and privacy

- Use Firebase Auth roles for attendee, staff, and admin.
- Store secrets in Secret Manager.
- Minimize personally identifiable information.
- Keep analytics largely pseudonymous where possible.
- Encrypt data in transit and at rest using managed Google Cloud defaults.
- Maintain audit logs for admin actions.


## Milestones

### Phase 1: Discovery and design

- Finalize venue journey map.
- Validate data sources.
- Create wireframes and dashboard IA.
- Define metrics and event schemas.


### Phase 2: MVP build

- Build attendee Next.js app.
- Build ops dashboard.
- Build Express backend on Cloud Run.
- Integrate Firebase Auth, Firestore, FCM.
- Build Pub/Sub ingestion.
- Build BigQuery analytics model.
- Build basic rule-based recommendation engine.
- Add Maps routing and zone overlays.


### Phase 3: Intelligence and hardening

- Add Dataflow streaming transformations.[^22]
- Add Vertex AI prediction services.[^24]
- Add advanced dashboards and SLOs.[^21][^12]
- Conduct load testing and demo rehearsal.


## Delivery plan for a completable student/hackathon build

To keep the project realistically completable, implementation should focus on one sports venue archetype, one attendee journey, and one operations console. The strongest MVP demo includes smart gate recommendation, fastest food/restroom choice, return-to-seat guidance, ops queue dashboard, staff incident reporting, and measurable metrics output in BigQuery and Cloud Monitoring.[^15][^12][^16]

### Priority build order

1. Next.js attendee app shell.
2. Firebase Auth + ticket context.
3. Venue map and service point model.
4. Express recommendation API on Cloud Run.
5. Firestore queue state + simulated events.
6. Firebase Cloud Messaging live alerts.
7. Ops dashboard.
8. Pub/Sub + BigQuery metrics path.
9. Optional Dataflow + Vertex AI enhancement.

## Risks and mitigations

| Risk | Impact | Mitigation |
| :-- | :-- | :-- |
| Indoor positioning not precise enough | Poor navigation trust | Use zone-based navigation first; add landmark guidance and optional beacons later [^17][^13] |
| Cost overrun in trial account | Demo instability | Cap traffic, use simulated streams, turn off idle services, start with rules before ML [^12][^15] |
| Poor wait-time accuracy | User trust loss | Use ranges, confidence labels, and feedback loop |
| Too many features for MVP | Delivery risk | Prioritize one high-value journey and one ops console |
| Weak ops adoption | Low practical value | Add playbook actions and staff task flow early |

## Acceptance criteria

- Attendee can sign in or use guest mode and attach a ticket.
- Attendee sees venue-aware home recommendations.
- Attendee can view fastest restroom and concession guidance.
- Attendee can navigate back to seat.
- Attendee receives reroute or queue opportunity notifications.
- Ops can view live venue status and incidents.
- Ops can assign and resolve tasks.
- Core events reach BigQuery.
- Cloud Monitoring dashboard shows system and product KPIs.
- System can be demoed end-to-end with simulated event traffic.


## Open questions

- What exact data sources are available from the target venue?
- Will the MVP rely fully on simulated queue data or partial live feeds?
- Is the product intended as a web app only, or should a native wrapper be planned later?
- What transport integrations are realistically available for exit routing?
- Will sponsorship and loyalty be in or out of initial scope?


## Final recommendation

CrowdGo should be built as a Google-native, mobile-first venue experience product using Next.js on the frontend, Node.js + Express on Cloud Run for backend APIs, Firestore and Firebase Cloud Messaging for live user experience, Pub/Sub + BigQuery for event and analytics flow, and Cloud Monitoring for measurable operational performance. For a billing trial account, the project should stay focused on a sharply scoped MVP with simulated streaming where necessary, rule-based recommendations first, and selective use of Dataflow and Vertex AI only where they materially improve the demo and product story[^18][^24][^12][^15][^16][^22]

<div align="center">⁂</div>

[^1]: https://egyankosh.ac.in/bitstream/123456789/115707/1/Unit-12.pdf

[^2]: https://yorkufire.com/wp-content/uploads/2023/04/aucoin_danielle_r_2019_masters.pdf

[^3]: https://dimin.com/insights/stadium-wayfinding-guide

[^4]: https://www.reddit.com/r/CFB/comments/1hrj6ve/most_efficient_stadium_concessions/

[^5]: https://www.reddit.com/r/Browns/comments/pwor7c/can_we_talk_about_concessions_at_the_stadium_and/

[^6]: https://www.indianjournalofcomputerscience.com/index.php/tcsj/article/view/175748

[^7]: https://apps.apple.com/in/app/flashscore-live-scores-news/id766443283

[^8]: https://en.uptodown.com/android/sports-scores-apps

[^9]: https://www.reddit.com/r/football/comments/x0shff/whats_the_best_football_scores_app_in_your_opinion/

[^10]: https://www.reddit.com/r/hyderabad/comments/1sdd2s1/match_experience_in_hyderabads_stadium/

[^11]: https://dataintelo.com/report/queue-flow-analytics-for-venues-market

[^12]: https://cloud.google.com/monitoring

[^13]: https://www.pointr.tech/blog/maps-wayfinding-for-venues-stadiums-all-you-need-to-know

[^14]: https://cloud.google.com/blog/topics/developers-practitioners/introduction-google-clouds-operations-suite

[^15]: https://cloud.google.com/solutions/stream-analytics

[^16]: https://firebase.google.com/products/cloud-messaging

[^17]: https://www.pointr.tech/blog/can-google-maps-work-indoors-and-alternatives

[^18]: https://developers.google.com/maps/documentation/routes

[^19]: https://www.tandfonline.com/doi/full/10.1080/23750472.2021.1985596

[^20]: https://docs.cloud.google.com/stackdriver/docs/solutions/slo-monitoring

[^21]: https://docs.cloud.google.com/stackdriver/docs/solutions/slo-monitoring/ui/create-slo

[^22]: https://docs.cloud.google.com/dataflow/docs/tutorials/dataflow-stream-to-bigquery

[^23]: https://cloud.google.com/blog/products/data-analytics/pub-sub-launches-direct-path-to-bigquery-for-streaming-analytics

[^24]: https://cloud.google.com/blog/products/ai-machine-learning/real-time-ai-with-google-cloud-vertex-ai

[^25]: https://cloud.google.com/use-cases/recommendations

[^26]: https://developers.google.com/maps/documentation/directions/overview

[^27]: https://firebase.google.com/docs/database

[^28]: https://firebase.google.com/docs/database/rtdb-vs-firestore

[^29]: https://support.google.com/analytics/answer/9358801?hl=en

