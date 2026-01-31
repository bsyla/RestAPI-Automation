# Contributing

Thanks for considering contributing to this API automation project.

## Setup

1. Fork and clone the repo.
2. `npm install`
3. Copy `config.example.js` to `config.js` and `.env.example` to `.env`.
4. Set `TODOIST_API_KEY` in `.env` (get a token from [Todoist Integrations](https://app.todoist.com/app/settings/integrations)).
5. Run tests: `npm test`

## Adding tests

- **Scenarios** go in `tests/scenarios/` (one file per suite, e.g. `projectCRUD.js`, `taskCRUD.js`).
- **Steps** (reusable request + assertion logic) go in `tests/steps/` (e.g. `project.js`, `task.js`).
- **Shared request/validation** lives in `tests/utils/requests.js`.
- **Test data** (templates, generators) go in `tests/data/` and `tests/utils/generateRequestBody/`.

Use the existing pattern: `before()` for setup (e.g. create project/task), `describe("[NEGATIVE]")` and `describe("[POSITIVE]")` with step functions that register `it()` tests. Use the shared `request(context, method, path, body, auth, asserts)` helper so status, types, and values are validated consistently.

## Conventions

- **Arrange / Act / Assert** — keep test flow clear; no arbitrary waits.
- **Deterministic data** — use Faker or fixed fixtures; avoid hardcoded secrets.
- **Environment-agnostic** — config from env; no secrets in repo.

## Running a subset

- `npm run test:projects` — Projects suite only  
- `npm run test:tasks` — Tasks suite only  
- `npm test` — full suite (Projects + Tasks), single Mochawesome report  

## Report

After a run, open `mochawesome-report/mochawesome.html` in a browser.
