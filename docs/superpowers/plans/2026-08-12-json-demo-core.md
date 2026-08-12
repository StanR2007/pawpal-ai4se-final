# PawPal JSON Demo Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable, single-process PawPal demo with JSON persistence for households, pets, care tasks and growth records.

**Architecture:** A repository layer owns all reads and atomic writes to a JSON snapshot. Server routes and UI call repository methods rather than files, leaving one defined replacement seam for a later SQL implementation. A seeded family makes the app immediately demonstrable.

**Tech Stack:** Next.js, TypeScript, Node standard library (`fs`, `crypto`), Vitest, Docker Compose.

## Global Constraints

- This is a single-process demo store; document that it is not multi-instance safe.
- Use temporary-file plus rename for every persisted write.
- Keep passwords, invitation secrets and session secrets out of persisted plain text and logs.
- Do not introduce packages requiring npm download.

---

### Task 1: JSON store and household repository

**Files:** Create `src/lib/store/types.ts`, `src/lib/store/json-store.ts`, `src/lib/store/repository.ts`, `src/lib/store/seed.ts`, `tests/unit/store.test.ts`.

- [ ] **Step 1: Write a failing test**

```ts
it("writes a household snapshot atomically and reads it back", async () => {
  const store = createJsonStore(testFile);
  await store.write(emptySnapshot);
  expect(await store.read()).toEqual(emptySnapshot);
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- tests/unit/store.test.ts`  
Expected: FAIL because `createJsonStore` does not exist.

- [ ] **Step 3: Implement minimum store and repository**

Use `fs.mkdir`, write to `path + ".tmp"`, then `rename`; expose `createHousehold`, `listPets`, `addPet`, `listTodayTasks`, `completeTask`, `addGrowthEvent`.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test -- tests/unit/store.test.ts`  
Expected: PASS.

### Task 2: Demo API and warm dashboard

**Files:** Create `src/app/api/demo/route.ts`, `src/app/api/pets/route.ts`, `src/app/api/tasks/[id]/complete/route.ts`, `src/app/api/timeline/route.ts`; modify `src/app/page.tsx`, `src/app/globals.css`.

- [ ] **Step 1: Write failing route tests**

```ts
it("completes one task only once", async () => {
  expect((await POST(request)).status).toBe(200);
  expect((await POST(request)).status).toBe(409);
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- tests/unit/demo-routes.test.ts`  
Expected: FAIL because route/repository behavior is absent.

- [ ] **Step 3: Implement dashboard and routes**

Use the seeded family. Display today’s care tasks, two pet cards, recent growth moments and a lightweight completion action; keep mobile-first warm visual tokens.

- [ ] **Step 4: Verify GREEN and build**

Run: `pnpm test && pnpm build`  
Expected: PASS.
