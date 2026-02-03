# Todoist API Automation Framework (Portfolio)

This repository is a portfolio-quality API automation framework for the Todoist
REST API. It demonstrates scalable test architecture, production-ready
engineering practices, and CI-grade reliability. The design prioritizes
maintainability, deterministic behavior, and clear separation of concerns.

## Why this project matters

- Demonstrates clean API test architecture with distinct client, service, and
  test layers
- Centralized environment and auth management for consistent execution
- Retry strategy with request logging and error enrichment
- Data-driven negative testing and schema validation
- CI-ready reporting with artifacts

## Tech stack

- Node.js (ESM)
- TypeScript
- Mocha + Chai
- Zod (schema validation)
- Mochawesome (HTML/JSON reporting)
- GitHub Actions

## Architecture overview

Layers and responsibilities:

- **Client layer**: HTTP execution, retries, logging, error handling
- **Service layer**: Todoist domain operations (projects, tasks)
- **Models**: Zod schemas for response validation
- **Tests**: Workflows and negative cases, no raw HTTP calls
- **Utils**: test data, reporting helpers, retry utilities

```
src/
  clients/
    BaseApiClient.ts
    TodoistApiClient.ts
  config/
    env.ts
  models/
    project.ts
    task.ts
    error.ts
  services/
    ProjectsService.ts
    TasksService.ts
  tests/
    workflows/
      todoist.workflow.spec.ts
    negative/
      todoist.negative.spec.ts
    fixtures/
      projectFixture.ts
  utils/
    assertions.ts
    dataFactory.ts
    http.ts
    logger.ts
    reporting.ts
    retry.ts
    validation.ts
```

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Set `TODOIST_API_TOKEN` to a valid personal API token.

3. Run tests:
   ```bash
   npm test
   ```

## Environment configuration

Environment is controlled via `.env`:

```
TODOIST_API_TOKEN=your_token_here
TODOIST_ENV=prod
TODOIST_BASE_URL=https://api.todoist.com/rest/v2
HTTP_LOG=false
RETRY_MAX=2
RETRY_DELAY_MS=300
REQUEST_TIMEOUT_MS=10000
```

- `TODOIST_ENV` supports `dev`, `staging`, `prod`
- `TODOIST_BASE_URL` overrides environment defaults
- `HTTP_LOG=true` enables request/response logging

## Test coverage

**Workflow test**
- Create project
- Update project
- Create task
- Update task
- Complete task
- Delete task
- Delete project

**Negative scenarios**
- 401 unauthorized (missing auth token)
- 404 not found (invalid project/task id)
- 400 validation errors (missing required fields)

## Reporting

Mochawesome reports are generated on each run:

- HTML: `reports/mochawesome/mochawesome.html`
- JSON: `reports/mochawesome/mochawesome.json`

## CI/CD

GitHub Actions pipeline:

- Installs dependencies
- Runs tests
- Generates Mochawesome reports
- Uploads report artifacts

See `.github/workflows/ci.yml` for details.

**Secrets and variables**

The workflow targets the `PROD` GitHub Environment. Store the token as an
environment secret named `TODOIST_API_TOKEN`. Optional environment variables
(`TODOIST_ENV`, `TODOIST_BASE_URL`, `HTTP_LOG`, `RETRY_MAX`,
`RETRY_DELAY_MS`, `REQUEST_TIMEOUT_MS`) can be set as environment or repository
variables to tune execution without code changes.

## Example output

```
Todoist workflow - project and task lifecycle
  ✓ creates, updates, completes, and deletes a task (12s)
```

## Future enhancements

- OpenAPI contract validation
- Dockerized execution
- Contract testing for upstream API changes

