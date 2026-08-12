# Foundation, Authentication, and Household Collaboration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Docker-startable PawPal foundation where a user can register, log in, create a household, and accept a secure, email-bound collaboration invitation.

**Architecture:** A Next.js App Router application owns server routes and UI. Prisma maps PostgreSQL tables; authentication is a small domain module that hashes passwords and stores only hashed random session secrets. Household and invitation services enforce their invariants within database transactions.

**Tech Stack:** Next.js, TypeScript, PostgreSQL, Prisma, Argon2id, Zod, Vitest, Docker Compose, GitLab CI.

## Global Constraints

- Use TDD: commit the failing test before implementation for each behavior.
- Passwords, session secrets, invitation secrets and complete storage URLs never appear in logs, DTOs or Git.
- Use 401 for unauthenticated requests, 404 for authenticated cross-household access, 403 for failed Origin validation, and 409 for invariant conflicts.
- Production session cookies are `HttpOnly; Secure; SameSite=Lax; Path=/`; only `NODE_ENV=development` may omit `Secure`.
- All user input is parsed by Zod before a domain service is called.

---

## File Structure

- `src/app/api/health/route.ts`: public health response.
- `src/lib/env.ts`: validates server-only configuration.
- `src/lib/db.ts`: singleton Prisma client.
- `src/lib/http.ts`: JSON errors, same-origin guard and route helpers.
- `src/features/auth/service.ts`: password, session and account functions.
- `src/features/auth/routes.ts`: auth request handlers.
- `src/features/households/service.ts`: household, membership and invitation transactions.
- `prisma/schema.prisma`: relational model and unique constraints.
- `tests/unit/`: pure domain tests; `tests/integration/`: database-backed route/service tests.

### Task 1: Bootstrap application and observable test environment

**Files:** Create `package.json`, `src/app/page.tsx`, `src/app/api/health/route.ts`, `vitest.config.ts`, `tests/unit/health.test.ts`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `Makefile`, `.gitignore`, `.gitlab-ci.yml`.

**Produces:** `GET /api/health -> { status: "ok", service: "pawpal" }`; `make test`; `docker compose up --build`.

- [ ] **Step 1: Write the failing test**

```ts
import { GET } from "@/app/api/health/route";
it("returns the PawPal health payload", async () => {
  expect(await (await GET()).json()).toEqual({ status: "ok", service: "pawpal" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/health.test.ts`  
Expected: FAIL because the route module does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function GET() {
  return Response.json({ status: "ok", service: "pawpal" });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/health.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json src tests Dockerfile docker-compose.yml .env.example Makefile .gitignore .gitlab-ci.yml
git commit -m "chore: bootstrap PawPal application"
```

### Task 2: Create relational schema and database invariants

**Files:** Create `prisma/schema.prisma`, `prisma/migrations/*`, `src/lib/db.ts`, `tests/integration/schema.test.ts`.

**Consumes:** `DATABASE_URL` from `.env` and PostgreSQL container from Task 1.

**Produces:** `Account`, `Session`, `Household`, `Membership`, `Invitation`, `Pet` models; uniqueness for normalized account email, `(householdId, accountId)`, and invitation token digest.

- [ ] **Step 1: Write the failing test**

```ts
it("rejects a second membership for the same account and household", async () => {
  await createMembership({ householdId, accountId, role: "OWNER" });
  await expect(createMembership({ householdId, accountId, role: "COLLABORATOR" }))
    .rejects.toThrow();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/schema.test.ts`  
Expected: FAIL because no database model or helper exists.

- [ ] **Step 3: Write minimal implementation**

```prisma
model Membership {
  id String @id @default(cuid())
  householdId String
  accountId String
  role MembershipRole
  @@unique([householdId, accountId])
}
```

Create the remaining models with foreign keys and run `npx prisma migrate dev --name foundation`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/integration/schema.test.ts`  
Expected: PASS; a duplicate membership fails at the database boundary.

- [ ] **Step 5: Commit**

```bash
git add prisma src/lib/db.ts tests/integration/schema.test.ts
git commit -m "feat: add PawPal relational foundation"
```

### Task 3: Implement secure registration, login and logout

**Files:** Create `src/features/auth/service.ts`, `src/features/auth/routes.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `tests/unit/auth-service.test.ts`, `tests/integration/auth-routes.test.ts`.

**Consumes:** `Account` and `Session` models from Task 2.

**Produces:** `register(input)`, `login(input)`, `requireSession(request)`, `logout(sessionDigest)` and `requireSameOrigin(request)`.

- [ ] **Step 1: Write the failing test**

```ts
it("stores an Argon2 hash but never the submitted password", async () => {
  const account = await register({ email: " A@Example.com ", password: "correct-horse-battery" });
  expect(account.email).toBe("a@example.com");
  expect(account.passwordHash).not.toContain("correct-horse-battery");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/auth-service.test.ts`  
Expected: FAIL because `register` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function register(input: RegisterInput) {
  const email = normalizeEmail(input.email);
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  return prisma.account.create({ data: { email, passwordHash } });
}
```

Add 256-bit random session generation, SHA-256 database digest, expiry checks, same-origin validation, five-session eviction and generic 401 login errors.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/auth-service.test.ts tests/integration/auth-routes.test.ts`  
Expected: PASS; tests cover 401 login ambiguity, 409 duplicate registration, session expiry/revocation and development Cookie flags.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth src/app/api/auth tests
git commit -m "feat: add secure password authentication"
```

### Task 4: Implement households, roles and one-time invitations

**Files:** Create `src/features/households/service.ts`, `src/app/api/households/route.ts`, `src/app/api/households/[id]/invitations/route.ts`, `src/app/api/invitations/[token]/accept/route.ts`, `tests/integration/households.test.ts`.

**Consumes:** `requireSession`, `requireSameOrigin`, `Household`, `Membership`, `Invitation` from Tasks 2–3.

**Produces:** `createHousehold(ownerId, name)`, `createInvitation(actorId, input)`, `acceptInvitation(account, token)`, `removeMember(actorId, memberId)`.

- [ ] **Step 1: Write the failing test**

```ts
it("allows exactly one concurrent acceptance of an email-bound invitation", async () => {
  const invitation = await createInvitation(ownerId, collaboratorInvite);
  const [a, b] = await Promise.allSettled([
    acceptInvitation(invitedAccount, invitation.rawToken),
    acceptInvitation(invitedAccount, invitation.rawToken),
  ]);
  expect([a, b].filter((x) => x.status === "fulfilled")).toHaveLength(1);
  expect(await membershipCount(invitation.householdId, invitedAccount.id)).toBe(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/households.test.ts`  
Expected: FAIL because invitation services do not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
return prisma.$transaction(async (tx) => {
  const accepted = await tx.invitation.updateMany({
    where: { tokenDigest, status: "PENDING", revokedAt: null, expiresAt: { gt: now }, targetEmail },
    data: { status: "ACCEPTED", acceptedAt: now },
  });
  if (accepted.count !== 1) throw new ConflictError();
  return tx.membership.create({ data: { householdId, accountId, role, petScope } });
});
```

Add 1 hour–30 day validation, token digesting, role limits, owner-last invariant and audit event writer that records IDs only.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/integration/households.test.ts`  
Expected: PASS; tests cover expiry, revocation, target-email mismatch, duplicate membership, no-owner 409 and invitation secrecy.

- [ ] **Step 5: Commit**

```bash
git add src/features/households src/app/api/households src/app/api/invitations tests
git commit -m "feat: add household collaboration invitations"
```

## Plan self-review

- Coverage: this plan implements the foundation, session and invitation sections of `SPEC.md`; pet, task, health, handoff and UI functions are intentionally deferred to subsequent independently testable plans.
- Placeholder scan: no TODO/TBD steps; each task names files, interfaces, a failing test, command, minimal implementation and commit.
- Type consistency: Task 2 supplies all persistence models used by Tasks 3–4; Task 3 supplies the session and origin guards used by Task 4.
