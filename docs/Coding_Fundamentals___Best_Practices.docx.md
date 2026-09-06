**Coding Fundamentals & Best Practices**

*A comprehensive guide for building robust, secure, and scalable software — from implementation-level craft to system-level architecture.*

## Code Quality Fundamentals

### Write Clear, Self-Documenting Code

* Use descriptive variable and function names that reveal intent

* Prefer getUserById(id) over get(id) or fetchData(x)

* Keep functions small and focused on a single responsibility

* Add comments only when the “why” isn’t obvious from the code itself

### Follow Consistent Naming Conventions

* **Variables/Functions:** camelCase (userData, fetchUserData)

* **Classes/Components:** PascalCase (UserProfile, DataService)

* **Constants:** UPPER\_SNAKE\_CASE (MAX\_RETRY\_ATTEMPTS, API\_BASE\_URL)

* **Files:** Match your framework conventions (kebab-case, PascalCase, etc.)

## Edge Case Handling

### Always Consider Edge Cases

* **Null/Undefined:** Check for missing or undefined values

* **Empty Collections:** Handle empty arrays, objects, and strings

* **Boundary Values:** Test min/max values, zero, negative numbers

* **Invalid Input:** Validate and sanitize all user input

* **Network Failures:** Handle timeouts, connection errors, and partial data

* **Race Conditions:** Consider concurrent operations and async timing

### Defensive Programming — At the Boundaries, Not Everywhere

* **Validate aggressively at system boundaries:** public API inputs, user-submitted data, responses from external services — anything crossing a trust boundary is guilty until proven valid

* **Trust your internal contracts once inside them:** a private helper called only by code you control shouldn’t re-validate what its caller already guaranteed — that’s noise that obscures the checks that actually matter

* **Every validation should be traceable to a real failure mode** — not added reflexively; defensive code that checks for conditions that can’t occur just adds surface area and false confidence

// Bad  
function divide(a, b) {  
  return a / b;  
}  
   
// Good  
function divide(a, b) {  
  if (typeof a \!== 'number' || typeof b \!== 'number') {  
    throw new TypeError('Both arguments must be numbers');  
  }  
  if (b \=== 0\) {  
    throw new Error('Cannot divide by zero');  
  }  
  return a / b;  
}

## Code Reusability

### DRY Principle (Don’t Repeat Yourself) — Applied Judiciously

* **Duplication is cheaper than the wrong abstraction:** two pieces of code that look similar today may change for unrelated reasons tomorrow — abstracting them prematurely creates a shared function riddled with conditionals trying to serve both callers

* **Rule of Three:** prefer duplicating a pattern until it has appeared independently three times before extracting it — this gives enough evidence that the pattern is real and stable, not coincidental

* **Abstract behavior, not just similar-looking code:** two functions with identical syntax but different reasons for existing (different business rules that happen to compute the same way today) are not duplication — they’re coincidence, and should stay separate

* Once a pattern is proven, extract repeated logic into utility functions, shared components, or configuration objects rather than continuing to copy it

* Build composable functions that can be combined in different ways, but don’t force unrelated call sites through one “flexible” function just to avoid a second implementation

### Create Reusable Utilities

* **Location:** Organize in /utils, /helpers, or /lib directories

* **Scope:** Keep utilities pure and framework-agnostic when possible

* **Documentation:** Include JSDoc comments with usage examples

* **Testing:** Write unit tests for all utility functions

### Component/Module Design

* Design components with props/parameters for flexibility

* Avoid hard-coded values; use configuration or props instead

* Implement composition over inheritance

* Keep components focused and single-purpose

## Scalability Considerations

### Scale for the Load You Have, Plus a Reasoned Margin

* **Measure before optimizing for scale, not after:** apply these techniques where profiling or realistic load projections show they're needed, not preemptively — sharding a 200-row table or virtualizing a 20-item list adds complexity with no payoff

* **Every item below is a trade-off, not a default:** each adds a moving part (cache invalidation, chunk-loading failure modes, debounce timing bugs) that has to be maintained — introduce it because the data justifies it, not because it's a known best practice

* **YAGNI applies to scale the same way it applies to features:** building for 100x your current load before you have any evidence you'll reach it is speculative engineering that slows down the work that matters now

### Performance Optimization

* **Lazy Loading:** Load code and assets only when needed

* **Memoization:** Cache expensive computations

* **Debouncing/Throttling:** Control frequency of expensive operations

* **Pagination:** Don’t load all data at once

* **Virtual Scrolling:** For large lists and tables

* **Code Splitting:** Break bundles into smaller chunks

### Data Management

* Use appropriate data structures (Map vs Object, Set vs Array)

* Consider database indexing for frequently queried fields

* Implement caching strategies (in-memory, Redis, CDN)

* Plan for data growth and archival strategies

### Architecture

* Separate concerns (UI, business logic, data access)

* Design for horizontal scaling where applicable

* Use dependency injection for testability and flexibility

* Plan for feature flags and gradual rollouts

## Error Handling

### Operational Errors vs. Programmer Errors

* **Operational errors** are expected failures a caller should handle: not-found, timeout, validation failure, rate limit. Give these distinct, typed errors and let calling code branch on them meaningfully

* **Programmer errors** are bugs: null reference, invalid internal state, a violated assumption. These should generally fail loudly (crash, alert) rather than being caught and downgraded to a generic message — swallowing them hides the actual defect and lets the system continue in a corrupted state

* Don’t let a catch-all \`catch\` block treat both categories the same way; a 404 and a null-pointer bug are not the same kind of failure and shouldn’t be handled by the same code path

### Comprehensive Error Management

// Wrap risky operations in try-catch, and preserve the original error  
async function fetchUserData(userId) {  
  try {  
    const response \= await api.get(\`/users/${userId}\`);  
    return response.data;  
  } catch (error) {  
    if (error.response?.status \=== 404\) {  
      // Operational error: expected, typed, caller can act on it  
      throw new NotFoundError(\`User ${userId} not found\`, { cause: error });  
    }  
    if (error.response?.status \>= 500\) {  
      throw new UpstreamError('Server error, please try again later', { cause: error });  
    }  
    // Re-throw with context, don't discard the original stack/cause  
    throw new Error('Failed to fetch user data', { cause: error });  
  }  
}

* **Preserve the cause chain** (\`{ cause: error }\` or equivalent) when wrapping an error — discarding the original error erases the stack trace and root cause you'll need when debugging in production

* **Use typed/custom error classes** for operational errors your callers need to branch on, rather than string-matching generic \`Error\` messages

### Error Boundaries and Fallbacks

* Implement error boundaries in React or equivalent in other frameworks

* Provide meaningful error messages to users

* Log errors with sufficient context for debugging

* Have fallback UI for graceful degradation

## Version Control Best Practices

### Commit in Small, Logical Increments

* **One Feature/Fix per Commit:** Each commit should represent a single logical change

* **Atomic Commits:** Changes should be complete and not break the build

* **Commit Often:** Don’t wait until end of day; commit working increments

### Write Meaningful Commit Messages

Format: \<type\>: \<subject\>

feat: New feature  
fix: Bug fix  
refactor: Code restructuring without behavior change  
docs: Documentation changes  
style: Formatting, missing semicolons, etc.  
test: Adding or updating tests  
chore: Maintenance tasks

Examples:

feat: add user authentication with JWT  
fix: resolve memory leak in data polling  
refactor: extract validation logic into separate module

### Branching Strategy

* Use feature branches for new work (feature/user-auth)

* Keep main/master branch always deployable

* Use pull requests for code review

* Delete branches after merging

## Testing Strategy

### Test Coverage Priorities — and Why the Order Matters

The order below (the “test pyramid”) isn’t arbitrary — it’s driven by cost and flakiness. Unit tests are fast, cheap, and isolate failures precisely; each layer above it is slower, more expensive to maintain, and more prone to flaky failures unrelated to the code under test. Write many of the former and progressively fewer of the latter.

1. **Unit Tests:** Test individual functions and components in isolation — the bulk of your suite; fast enough to run on every save

2. **Integration Tests:** Test how modules work together — fewer than unit tests; catch the bugs that isolated units can’t (wrong contracts between components)

3. **E2E Tests:** Test critical user journeys — fewest of all; slow and more brittle, so reserve for the paths that would be most costly if broken

4. **Edge Cases:** Explicitly test boundary conditions and error scenarios at whichever layer they naturally belong to

### Coverage Is a Smell Detector, Not a Goal

* **A coverage percentage tells you what ran, not what was verified:** 100% coverage achieved by asserting implementation details (“this internal variable equals X”) is worse than 80% coverage of actual behavior — it locks in the current implementation and breaks on harmless refactors

* **Test behavior and contracts, not internals:** assert what a function promises to callers (inputs → outputs → side effects), not how it gets there internally

* **Use coverage gaps to find untested paths, not as a target to hit** — chasing a coverage number encourages low-value tests that pad the metric without catching real bugs

### Write Testable Code

* Keep functions pure when possible (same input \= same output)

* Inject dependencies rather than hard-coding them

* Avoid side effects in business logic

* Use interfaces/abstractions to enable mocking

## Code Organization

### Project Structure

/src  
  /components   \# Reusable UI components  
  /features     \# Feature-based modules  
  /hooks        \# Custom React hooks (or equivalent)  
  /utils        \# Pure utility functions  
  /services     \# API calls, external services  
  /types        \# TypeScript types/interfaces  
  /constants    \# App-wide constants  
  /config       \# Configuration files  
  /tests        \# Test files (or colocated with source)

### File Organization Principles

* Group related files together

* Keep files focused and under 300 lines when possible

* Use index files for clean imports

* Separate concerns (presentation vs logic)

## Documentation

### Code Documentation

* **README:** Project setup, dependencies, and getting started

* **JSDoc/TSDoc:** Document public APIs and complex functions

* **Architecture Decisions:** Document why, not just what

* **Inline Comments:** Explain complex algorithms and non-obvious code

### Keep Documentation Updated

* Update docs when changing functionality

* Include examples in documentation

* Document environment variables and configuration

* Maintain a changelog for significant changes

## Security Best Practices

### Input Validation & Sanitization

* Never trust user input

* Validate on both client and server

* Use parameterized queries to prevent SQL injection

* Sanitize HTML to prevent XSS attacks

### Sensitive Data

* Never commit secrets, API keys, or passwords to version control

* Use environment variables for configuration

* Implement proper authentication and authorization

* Encrypt sensitive data at rest and in transit

### Dependencies

* Regularly update dependencies

* Audit for known vulnerabilities (npm audit, yarn audit)

* Use lock files to ensure consistent installs

* Review dependency licenses

## Performance Monitoring

### Establish Baselines

* Measure bundle size and track over time

* Monitor page load times

* Track API response times

* Set performance budgets

### Optimize Iteratively

* Profile before optimizing (don’t guess)

* Focus on user-perceived performance

* Optimize the critical rendering path

* Use browser DevTools and Lighthouse

# System Design & Architecture

*The sections below extend this guide from implementation-level craft into system-level design — the judgment a senior engineer or architect applies when deciding how services are structured, how a system survives failure and scale, and how security and reliability are designed in rather than added later.*

## Architecture Patterns & Trade-offs

### Monolith vs. Microservices

* **Start with a modular monolith** unless there is a clear, present need for independent scaling, deployment, or team ownership boundaries — microservices trade simplicity for operational complexity (network calls, distributed transactions, versioning)

* **Split along business capabilities** , not technical layers (e.g., “Orders” service, not a shared “database access” service)

* **A service boundary is a contract:** once other services depend on it, changing it becomes a coordination problem — draw boundaries around things that change together and change for the same reasons

* **Conway’s Law:** system structure tends to mirror team communication structure — plan team topology alongside service topology

### Domain-Driven Design (DDD)

* **Bounded Context:** each service or module owns its own model of the domain; the same term (e.g., “Customer”) can mean different things in different contexts — don’t force a single shared model across the whole system

* **Ubiquitous Language:** use the business’s own vocabulary in code, not translated technical jargon

* **Aggregates:** group entities that must stay consistent together behind a single transactional boundary; keep aggregates small

* **Anti-Corruption Layer:** when integrating with a legacy system or external API, translate at the boundary rather than letting its model leak into yours

### Communication Patterns

* **Synchronous (REST/gRPC):** simplest to reason about; couples the caller’s availability to the callee’s — use for request/response where an immediate answer is required

* **Asynchronous (message queues, event streams):** decouples services in time; the caller doesn’t block on the callee being up — use for workflows that can tolerate eventual completion

* **Event-Driven Architecture:** services publish facts (“OrderPlaced”) rather than commands; consumers react independently — improves decoupling but makes end-to-end flow harder to trace, so invest in tracing early

* **Choreography vs. Orchestration:** choreography (services react to each other’s events) scales team autonomy but obscures the overall flow; orchestration (a central coordinator) is easier to observe but becomes a bottleneck — choose deliberately, don’t default

## Distributed Systems & Scalability

### Foundational Constraints

* **CAP Theorem:** under a network partition, a distributed system must choose between Consistency and Availability — know which one each part of your system needs and why

* **Eventual Consistency:** acceptable (and often necessary) for data that doesn’t require an immediate global view (e.g., view counts, recommendation feeds); not acceptable for financial balances or inventory counts without compensating controls

* **Idempotency:** any operation that might be retried (network timeout, at-least-once delivery) must be safe to execute more than once — use idempotency keys for payment/order-creation endpoints

### Resilience Patterns

* **Circuit Breaker:** stop calling a failing dependency after a threshold of errors, and fail fast instead of piling up timeouts

* **Retry with Exponential Backoff \+ Jitter:** never retry immediately or on a fixed interval — both cause thundering-herd failures

* **Timeouts on every network call:** an operation with no timeout is a resource leak waiting to happen

* **Bulkheads:** isolate resource pools (thread pools, connection pools) per dependency so one slow dependency can’t exhaust resources needed by others

* **Backpressure:** when a consumer can’t keep up, propagate that signal upstream (reject, queue with limits, or shed load) rather than buffering unboundedly

* **Graceful Degradation:** design critical paths to keep functioning (in a reduced form) when a non-critical dependency is down

### Scaling Data

* **Statelessness:** application servers should hold no session state locally, so any request can be handled by any instance — externalize session/state to a store designed for it

* **Read Replicas:** scale read-heavy workloads by routing reads to replicas; be explicit about the replication lag your use case can tolerate

* **Sharding/Partitioning:** split data across nodes by a partition key chosen to avoid hot spots — changing a partition key later is expensive, so choose it early and deliberately

* **Caching Layers:** cache at the layer closest to the consumer that’s safe to (CDN → application cache → database query cache); always define an invalidation strategy up front, not after a stale-data bug

* **Load Balancing:** distribute traffic across instances; understand the difference between L4 (connection-level) and L7 (request-aware) balancing for your use case

## API Design Standards

* **Choose the right style deliberately:** REST for resource-oriented public APIs, GraphQL when clients need flexible/aggregated queries, gRPC for low-latency internal service-to-service calls

* **Version from day one** (URL, header, or media-type versioning) — retrofitting versioning onto a live API is far more disruptive than starting with it

* **Design for backward compatibility:** add fields, don’t repurpose them; make new fields optional; never silently change the meaning of an existing field

* **Paginate everything that returns a collection** ; prefer cursor-based pagination over offset-based for large or frequently-changing datasets

* **Idempotency keys** on any POST that creates a resource with side effects (payments, orders)

* **Consistent error contracts:** a predictable error shape (code, message, correlation ID) across every endpoint, not ad hoc per-route error formats

* **Contract testing:** verify producer and consumer stay compatible (e.g., Pact) instead of relying on manual coordination between teams

## Security Architecture

### Threat Modeling & Design Principles

* **Threat model before building** , not after: identify what you’re protecting, who might attack it, and how (STRIDE is a useful checklist: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege)

* **Principle of Least Privilege:** every service, user, and credential gets the minimum access required, nothing more — audit and prune permissions regularly

* **Zero Trust:** don’t treat “inside the network” as inherently trusted; authenticate and authorize every request, internal or external

* **Defense in Depth:** assume any single control will eventually fail; layer controls so no single failure is catastrophic

* **OWASP Top 10:** treat as a minimum baseline — injection, broken authentication, sensitive data exposure, broken access control, security misconfiguration, and their current-year peers should be checked explicitly, not assumed away

### Authentication & Authorization

* **Use established standards** (OAuth 2.0 / OIDC) rather than building custom auth — custom auth is one of the highest-risk things a team can build in-house

* **Short-lived access tokens \+ refresh tokens** , not long-lived static tokens

* **RBAC or ABAC** for authorization; keep the authorization decision in one place (a policy layer), not scattered as ad hoc checks across the codebase

* **Separate authentication (who you are) from authorization (what you can do)** as distinct concerns in the design

### Secrets & Data Protection

* **Use a secrets manager** (Vault, AWS Secrets Manager, etc.) for credentials and keys — environment variables are a minimum bar, not the destination for high-sensitivity secrets

* **Encrypt at rest and in transit** by default; TLS everywhere, including internal service-to-service traffic in zero-trust environments

* **Rotate credentials and keys** on a schedule and immediately on suspected compromise

* **Data classification:** know which fields are PII/sensitive so you can apply the right controls (encryption, masking, access logging, retention limits) instead of treating all data the same

### Supply Chain & Operational Security

* **Software Bill of Materials (SBOM):** know what’s actually in your dependency tree

* **Pin and audit dependencies** ; treat a new transitive dependency as untrusted code until vetted

* **Secure the CI/CD pipeline itself:** it has the keys to production — restrict who can modify pipeline definitions and what pipelines can access

* **Security review as part of design review** , not a separate gate bolted on before ship

## Observability & Reliability Engineering

### Observability

* **Structured logging:** emit logs as structured data (JSON) with correlation/trace IDs, not free-text strings — free text is unqueryable at scale

* **Metrics:** track the RED method for services (Rate, Errors, Duration) and USE method for resources (Utilization, Saturation, Errors)

* **Distributed tracing:** propagate a trace ID across every service a request touches (OpenTelemetry is the current standard) — without this, debugging a multi-service request is guesswork

* **Alert on symptoms users feel** (elevated error rate, latency) rather than every possible internal cause — alert fatigue from noisy, low-value alerts erodes trust in the whole system

### Reliability Targets & Incident Response

* **SLI/SLO/SLA:** define Service Level Indicators (what you measure), Objectives (your internal target), and Agreements (what you’ve promised externally) — don’t treat “high availability” as self-evident without a number attached

* **Error budgets:** an SLO implies an acceptable failure rate — use it to balance the pace of shipping new features against reliability work

* **Runbooks:** document the response steps for known failure modes before they happen, not while an incident is live

* **Blameless postmortems:** capture root cause and systemic fixes after an incident without focusing on individual fault — the goal is a system that fails the same way once

### Disaster Recovery & Resilience Testing

* **RTO (Recovery Time Objective)** and \*\*RPO (Recovery Point Objective)\*\*: define, in advance, how long you can be down and how much data you can afford to lose — these numbers drive your backup and failover design, not the other way around

* **Automated, tested backups:** an untested backup is a hypothesis, not a recovery plan — practice restoring from it

* **Chaos engineering:** deliberately inject failure (kill instances, add latency, partition networks) in non-production, and eventually production, to validate that resilience mechanisms actually work under load

## Data Architecture

* **Choose consistency model per use case** , not globally: strong consistency for financial/inventory data, eventual consistency where staleness is tolerable

* **Normalize for integrity, denormalize for read performance** — make this trade-off deliberately per table/service rather than applying one rule everywhere

* **Event Sourcing:** store state as an append-only sequence of events rather than mutable rows, when you need a full audit trail or the ability to reconstruct past state — adds complexity, so use where the trade-off is justified

* **Change Data Capture (CDC):** stream database changes to other systems (search index, cache, analytics) instead of dual-writing from application code, which is prone to partial-failure inconsistency

* **Plan schema migrations as multi-step, backward-compatible changes** (expand → migrate → contract) so deploys and rollbacks never require the schema and code to change atomically

## Cloud-Native & Delivery

* **Twelve-Factor App principles:** config in the environment, stateless processes, treat backing services as attached resources, explicit dependency declaration, dev/prod parity

* **Infrastructure as Code:** define infrastructure declaratively (Terraform, Pulumi, CloudFormation) and version it like application code — no manual console changes to production infrastructure

* **Containers \+ orchestration:** package for consistency across environments; let an orchestrator (Kubernetes or equivalent) handle scheduling, health checks, and self-healing rather than building that logic into the app

* **Progressive delivery:** use blue-green or canary deployments plus feature flags to decouple deploying code from releasing it to users, and to make rollback fast and low-risk

* **Rollback is a first-class part of the deploy plan** , decided before shipping — not improvised during an incident

## Architecture Governance & Decision-Making

* **Architecture Decision Records (ADRs):** for any significant technical decision, record the context, the options considered, the choice made, and the trade-offs accepted — future engineers (and the AI reading this document) need the “why,” not just the outcome

* **Non-functional requirements are requirements:** capture expected scale, availability target, latency budget, and security/compliance constraints before designing a system, not after something breaks under load

* **Every design has a trade-off:** when proposing an approach, state what it optimizes for and what it costs (e.g., “this improves read latency but adds eventual-consistency risk”) rather than presenting it as strictly better

* **RFC / design-doc process** for changes that cross service or team boundaries, so the people affected can weigh in before implementation starts

* **Reversibility as a design lens:** prefer decisions that are cheap to reverse; invest more scrutiny in decisions that are expensive to undo (data model choices, public API contracts, chosen partition keys)

# Code Review Checklist

Before submitting code for review, verify:

* Code follows project style guidelines

* Edge cases are handled appropriately

* No hardcoded values that should be configurable

* Error handling is comprehensive

* Tests are included and passing

* Documentation is updated

* No console.logs or debug code remains

* Performance impact is considered

* Security implications are reviewed (authN/authZ, input validation, secrets)

* Reliability implications are reviewed (timeouts, retries, idempotency where relevant)

* Commits are atomic and well-messaged

# Continuous Improvement

### Regular Refactoring

* Schedule time for technical debt reduction

* Refactor when you touch code (Boy Scout Rule)

* Don’t over-engineer; refactor when patterns emerge

* Keep refactoring separate from feature work

### Stay Current

* Follow language/framework updates

* Learn new patterns and best practices

* Share knowledge with your team

* Review and update this template as you learn

# Quick Reference Principles

1. **SOLID Principles:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

2. **KISS:** Keep It Simple, Stupid

3. **YAGNI:** You Aren’t Gonna Need It (don’t over-engineer)

4. **DRY:** Don’t Repeat Yourself

5. **Separation of Concerns:** Keep different aspects of code separate

6. **Composition Over Inheritance:** Prefer flexible composition

7. **Fail Fast:** Catch errors early and loudly during development

8. **Convention Over Configuration:** Follow established patterns

9. **CAP Awareness:** Know which of Consistency and Availability a given component prioritizes under partition

10. **Design for Failure:** Assume dependencies will fail; build timeouts, retries, and fallbacks in from the start

11. **Least Privilege:** Every credential and service gets the minimum access it needs

12. **Document the Why:** Trade-offs and rejected alternatives matter as much as the final decision

*Use this document as a living template. Adapt it to your specific project needs and technology stack.*

# AI Collaboration Rules

1. **Before writing any code, describe your approach and wait for approval.** Always ask clarifying questions before writing any code if requirements are ambiguous.

2. **If a task requires changes to more than 3 files, stop and break it into smaller tasks first.**

3. **After writing code, list what could break and suggest tests to cover it.**

4. **When there’s a bug, start by writing a test that reproduces it, then fix it until the test passes.**

5. **Every time I correct you, add a new rule to this document so it never happens again.**

6. **When proposing a system-level design (new service, API, data model, or architecture change), name the trade-off explicitly** — what it optimizes for and what it costs — rather than presenting one option as strictly correct.

7. **Default to the simplest design that meets the stated non-functional requirements** (scale, availability, latency); do not introduce distributed-systems complexity (microservices, event sourcing, sharding) without a stated need for it.

8. **Flag security and reliability gaps proactively** (missing input validation, missing timeouts/retries, secrets in code, missing authZ checks) even if not explicitly asked to review for them.