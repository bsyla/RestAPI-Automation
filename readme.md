# REST API Automation

[![API Tests](https://github.com/bsyla/RestAPI-Automation/actions/workflows/ci.yml/badge.svg)](https://github.com/bsyla/RestAPI-Automation/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**API test automation for the [Todoist](https://todoist.com/) REST API v2** — Projects and Tasks CRUD, negative scenarios, Mochawesome reports, and GitHub Actions CI. Built for reliability and environment-agnostic runs (local `.env` or CI secrets).

---

## Features

- **Projects API** — Create, get, update, get all, delete; negative cases (missing name, invalid color).
- **Tasks API** — Create task in project, get, update, close; negative case (empty content).
- **Arrange / Act / Assert** — Clear structure; no arbitrary waits; deterministic assertions on status, types, and values.
- **Env-based config** — `.env` + [dotenv](https://www.npmjs.com/package/dotenv) locally; GitHub environment secrets in CI.
- **Reporting** — [Mochawesome](https://www.npmjs.com/package/mochawesome) HTML/JSON; optional Discord reporter via env.
- **CI** — GitHub Actions workflow; runs on push/PR; uses `prod` environment and uploads report artifact.

---

## Scenarios

| Suite      | Positive                                                                 | Negative                                      |
|-----------|---------------------------------------------------------------------------|-----------------------------------------------|
| **Projects** | Create → Get → Update → Get → Get all → Delete                           | Create without name (400), invalid color (400) |
| **Tasks**    | Create task → Get → Update → Get → Close                                 | Create without content (400)                  |

Validation covers HTTP status codes, response field types, and expected values.

---

## Tech stack

| Area        | Tools |
|------------|--------|
| Runtime    | Node 18+ |
| Test       | Mocha, Chai, Supertest |
| Data       | @faker-js/faker, get-nested-value |
| Config     | dotenv, env vars |
| Reporting  | Mochawesome; optional Discord (DISCORD_WEBHOOK_URL) |
| CI         | GitHub Actions |

---

## Quick start

```bash
git clone https://github.com/your-username/RestAPI-Automation.git
cd RestAPI-Automation
npm install
cp config.example.js config.js
cp .env.example .env
# Edit .env: set TODOIST_API_KEY (get token: https://app.todoist.com/app/settings/integrations)
npm test
```

Open `mochawesome-report/mochawesome.html` for the report.

---

## Configuration

Config is loaded from **environment variables**; [dotenv](https://www.npmjs.com/package/dotenv) loads a `.env` file when `config.js` is required.

**Base URL:** Default is from the [Todoist REST API v2 docs](https://developer.todoist.com/rest/v2/): **`https://api.todoist.com/rest/v2`**. Override with `TODOIST_BASE_URL` if needed.

**Option A – .env (local)**  
1. `cp config.example.js config.js` and `cp .env.example .env`  
2. In `.env`: `TODOIST_API_KEY=your-token`  
   Get a token: [Todoist → Settings → Integrations](https://app.todoist.com/app/settings/integrations)  
3. Run tests; `config.js` runs `dotenv/config` so `.env` is loaded automatically.

**Option B – Env vars only (CI)**  
Use `config.example.js` as `config.js` and set `TODOIST_API_KEY` (and optionally `TODOIST_BASE_URL`, `DISCORD_WEBHOOK_URL`) in the environment.

| Variable            | Required | Description |
|---------------------|----------|-------------|
| `TODOIST_API_KEY`   | Yes      | Todoist API token |
| `TODOIST_BASE_URL`  | No       | Default: `https://api.todoist.com/rest/v2` |
| `DISCORD_WEBHOOK_URL` | No     | For Discord reporter |

Do not commit `config.js` or `.env`; both are gitignored.

---

## Running tests

| Command | Description |
|---------|-------------|
| `npm test` / `npm run test:all` | Run all suites (Projects + Tasks), single Mochawesome report |
| `npm run test:projects` | Projects suite only |
| `npm run test:tasks` | Tasks suite only |
| `npm run projects-discord` | Projects + Mochawesome + Discord (needs `DISCORD_WEBHOOK_URL`) |

- **Report path:** `mochawesome-report/mochawesome.html`  
- **Timeout:** 20s per run (no arbitrary waits).

---

## CI (GitHub Actions)

- **Workflow:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)  
- **Triggers:** push / PR on `main` or `master`  
- **Environment:** `prod` (optional; workflow also uses repository secrets)  
- **Steps:** Checkout → Node 20 → `npm ci` → copy `config.example.js` to `config.js` → `npm run test:all`  
- **Artifact:** Mochawesome report uploaded for 7 days  

### Making secrets available for PRs (and not only main)

To have integration tests run on **every** push and **every PR from branches in this repo** (not only on `main`), add the secrets at **repository** level so they are available to all workflow runs:

1. In the repo: **Settings → Secrets and variables → Actions**.
2. Under **Repository secrets**, add:
   - `TODOIST_API_KEY` (required) – your Todoist API token.
   - `TODOIST_BASE_URL` (optional) – default is `https://api.todoist.com/rest/v2`.

Repository secrets are available to:
- Push to any branch (e.g. `main`, `feature/xyz`).
- Pull requests from **branches in this repo** (e.g. `feature/xyz` → `main`).

They are **not** available to PRs opened from **forks** (GitHub does not expose secrets to fork PRs for security).

If you use the **`prod` environment** as well, you can keep `TODOIST_*` there; the workflow reads from both. If the `prod` environment has **Required reviewers** or **Deployment branch** rules, ensure they allow the branches you use for PRs, or rely on repository secrets so PRs don’t depend on environment approval.  

**If CI returns 403 Forbidden:** The workflow sends a `User-Agent` header; ensure your token is a **full-access** personal token from [Todoist → Settings → Integrations](https://app.todoist.com/app/settings/integrations). If 403 persists, Todoist may restrict some IPs or the deprecated REST v2 API; try the token locally to confirm it works.

---

## Project structure

```
RestAPI-Automation/
├── .github/workflows/
│   └── ci.yml                 # API tests (Projects + Tasks)
├── tests/
│   ├── scenarios/
│   │   ├── all.js              # Full suite (Projects + Tasks, isolated state)
│   │   ├── projectCRUD.js      # Projects suite only
│   │   └── taskCRUD.js        # Tasks suite only
│   ├── steps/
│   │   ├── project.js         # Project step functions
│   │   └── task.js            # Task step functions
│   ├── utils/
│   │   ├── requests.js        # request(), validation, Mochawesome context
│   │   └── generateRequestBody/
│   │       ├── generateCredentials.js  # Project body (Faker + colors)
│   │       └── generateTaskBody.js    # Task body (Faker)
│   └── data/
│       ├── projects/          # create_project.json
│       └── tasks/              # create_task.json
├── config.example.js           # Env-based config (copy to config.js)
├── config.json                 # Mochawesome + Discord reporter options
├── discord-reporter.cjs        # Optional Discord reporter
├── .env.example
├── package.json
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

- **Authentication:** Bearer token from config/env.  
- **Test data:** Faker for names/content; supported Todoist colors for projects.  
- **Assertions:** Status code, types, values; for negative cases, absence of fields where applicable.

---

## Reporting

- **Mochawesome:** HTML and JSON under `mochawesome-report/`.  
- **Discord:** Set `DISCORD_WEBHOOK_URL`; reporter sends pass/fail/duration (no secrets in code).

---

## License

ISC — see [LICENSE](LICENSE).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and how to add tests or improve the suite.
