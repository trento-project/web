# SAST, DAST and SCA scanning

Status: approved, not yet implemented
Date: 2026-08-12

## Problem

`trento-web` has no security scanning. CI runs Credo, Dialyzer, ESLint, Codespell and
license-header checks, and Dependabot opens version-bump PRs, but nothing looks for
vulnerable code patterns, known-vulnerable dependencies, or runtime vulnerabilities.

This adds static analysis (SAST), dependency scanning (SCA) and dynamic analysis (DAST)
for the Elixir backend and the JavaScript frontend.

## Constraints

- Open-source tooling first. A free-but-not-open-source tool is acceptable only where it is
  clearly better, and the open-source alternative must be recorded so it can be swapped in.
- Reports must use a standard exchangeable format. SARIF 2.1.0 throughout.
- No job may block a merge in this iteration. The codebase has never been scanned, so the
  first run establishes a baseline rather than a gate.
- Per-PR cost must stay low. CI already runs an eight-container Cypress matrix.

## Tool selection

| Concern | Tool | Licence | Native SARIF |
| --- | --- | --- | --- |
| SAST Elixir | Sobelow 0.14 | Apache-2.0 | yes (`--format sarif --out`) |
| SAST JavaScript | CodeQL (`javascript-typescript`) | free for public repos, not OSS | yes |
| SAST GitHub Actions | CodeQL (`actions`) | free for public repos, not OSS | yes |
| SAST JavaScript (lint) | `eslint-plugin-security`, `eslint-plugin-no-unsanitized` | MIT | via `@microsoft/eslint-formatter-sarif` (MIT) |
| SCA (Hex + npm) | OSV-Scanner | Apache-2.0 | yes |
| DAST | OWASP ZAP, Automation Framework | Apache-2.0 | yes, `sarif-json` report template |
| DAST | Nuclei | MIT | yes (`-sarif-export`) |

### Recorded alternatives

- **CodeQL is the only non-OSS component.** It is free for public repositories and is the
  strongest JavaScript engine available. The OSS substitute is Semgrep OSS (LGPL-2.1) with
  pinned rulesets (`p/javascript`, `p/react`, `p/secrets`). Semgrep must not be run with
  `--config auto`, which resolves rules from the hosted registry at scan time. Semgrep's
  Elixir support is experimental and is not a substitute for Sobelow. If policy later
  disallows CodeQL, replacing the `sast-js` job with Semgrep is a self-contained change.
- **`mix_audit` (MIT)** covers Hex advisories only. OSV-Scanner was chosen instead because a
  single tool covers `mix.lock` and `assets/package-lock.json`.

### Excluded

- **Schemathesis (MIT)** supports only `junit`, `vcr`, `har` and `allure` reports. Emitting
  SARIF would require a bespoke JUnit-to-SARIF converter, a new component to maintain in a
  change whose purpose is wiring up off-the-shelf tools. Deferred; see Follow-up work.
- **Container scanning** (Trivy, Grype) was considered and dropped from scope. This leaves
  base-image OS CVEs uncovered by any tool in this design.
- **Secret scanning** (gitleaks) and **Actions hardening** (zizmor, actionlint) are outside
  the SAST/DAST/SCA scope agreed for this work. `actionlint` is still used locally as a
  development aid.

### Why ZAP Automation Framework rather than the ZAP GitHub Actions

`zaproxy/action-baseline` and `zaproxy/action-api-scan` wrap the packaged scan scripts
(`zap-baseline.py`, `zap-api-scan.py`), which cannot emit SARIF — they produce JSON, HTML
and Markdown only. The `sarif-json` template lives in the Report Generation add-on and is
reachable only through the Automation Framework `report` job.

Using an AF plan is therefore required by the SARIF constraint, and is better regardless:
spider, passive scan, OpenAPI import, active scan and reporting run in a single ZAP process
instead of two, and the plan is declarative and version-controlled.

ZAP must run from a release build. The SARIF validator rejects the `Dev Build` version
string, which would fail the code-scanning upload.

## Architecture

One new workflow, `.github/workflows/security.yaml`. `ci.yaml` is not modified.

```yaml
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, labeled]
  schedule:
    - cron: "0 2 * * *"
  workflow_dispatch:

permissions:
  contents: read
  security-events: write
```

| Job | Trigger | Approx. duration |
| --- | --- | --- |
| `sast-elixir` | every trigger | 2 min |
| `sast-js` | every trigger | 4 min |
| `sast-js-lint` | every trigger | 1 min |
| `sca` | every trigger | 1 min |
| `dast` | schedule, `workflow_dispatch`, or PR labelled `dast` | 20 min |

DAST gate:

```yaml
if: >-
  github.event_name == 'schedule' ||
  github.event_name == 'workflow_dispatch' ||
  (github.event_name == 'pull_request' &&
   contains(github.event.pull_request.labels.*.name, 'dast'))
```

### Deliberate deviations from `ci.yaml`

- **No `detect-changes` path filtering.** The SAST and SCA jobs are cheap. Skipping an
  analysis on a PR makes code scanning observe zero results for that tool, which churns
  alert open/closed state.
- **No `cancel-in-progress` concurrency.** A cancelled security run uploads no SARIF, which
  code scanning reads the same way. Runs queue rather than cancel.
- **Single Elixir version, not the BC/DEV matrix.** Findings are not version-specific.

### Licence headers

`apache/skywalking-eyes` enforces SPDX headers repo-wide via `.licenserc.yaml`. New `.yaml`,
`.yml` and `.mjs` files need the `SUSE LLC` / `Apache-2.0` header. `**/*.md` and `**/*.json`
are exempt.

## Components

### `sast-elixir` — Sobelow

`{:sobelow, "~> 0.14", only: [:dev, :test], runtime: false}` in `mix.exs`.

Invocation: `mix sobelow --format sarif --out sarif/sobelow.sarif`.

`.sobelow-conf` at the repository root holds only `skip: true`, so `# sobelow_skip`
comments are honoured, and an initially empty `ignore` list. Format and output path stay on
the command line in the workflow, where they are visible; CLI switches override the config
file.

The job restores the `deps` and `_build/test` cache written by `ci.yaml`'s `elixir-deps`
job, using the same key format
(`erlang-<otp>-elixir-<version>-<hash(mix.lock)>-test`), then runs `mix deps.get`, which is
a no-op on a cache hit.

### `sast-js` — CodeQL

`languages: javascript-typescript, actions`, `build-mode: none`.

`.github/codeql/config.yml` excludes `assets/node_modules`, `priv/static` and test fixtures.

The `actions` language is included deliberately: several workflows use `labeled` triggers
and consume secrets, and workflow injection is exactly what that pack detects.

`analyze` runs with `output: sarif/` and `upload: never`. CodeQL writes SARIF files and the
shared publish step owns the upload, so all tools follow one path.

### `sast-js-lint` — ESLint security rules

Adding security rules to `assets/eslint.config.mjs` would make `ci.yaml`'s existing
`npm run lint` step fail, silently converting a report-only rollout into a blocking gate.

Instead, `assets/eslint.security.config.mjs` imports the base config and layers
`eslint-plugin-security` and `eslint-plugin-no-unsanitized` on top. A new `lint:security`
npm script runs it with `@microsoft/eslint-formatter-sarif`. Three new devDependencies.
`ci.yaml` is untouched and the existing lint gate keeps its current meaning.

### `sca` — OSV-Scanner

```
osv-scanner scan source \
  --lockfile mix.lock \
  --lockfile assets/package-lock.json \
  --format sarif --output sarif/osv.sarif
```

`mix.lock` maps to the OSV `Hex` ecosystem.

Known gap, documented rather than fixed: git-sourced dependencies (`langchain`, `gen_rmq`,
`trento_contracts`) resolve to commit SHAs in `mix.lock`, so Hex advisory matching does not
apply to them. `langchain` currently points at a personal fork.

### `dast` — ZAP Automation Framework and Nuclei

This job runs with `MIX_ENV: dev`, matching the E2E job, because the application is started
and exercised rather than analysed. The other jobs use the workflow-level `MIX_ENV: test` so
they share `ci.yaml`'s dependency cache.

Bring-up mirrors the existing E2E job in `ci.yaml`:

1. `isbang/compose-action` with `--profile wanda` for Postgres, RabbitMQ, Prometheus, Wanda
2. `mix setup` — creates and migrates the databases and runs `priv/repo/seeds.exs`, which
   seeds `admin` / `adminpassword` with the `all:all` ability
3. `mix phx.server &` — application on `http://localhost:4000`
4. poll `/api/readyz` until ready
5. `POST /api/session` to mint a JWT

`.github/zap/trento-api.yaml` is a single AF plan: `openapi` (importing the spec produced by
`mix openapi.spec.json --start-app=false --spec TrentoWeb.OpenApi.All.ApiSpec`), `spider`,
`passiveScan-wait`, `activeScan`, then `report` with `template: sarif-json`. Authentication
uses a `replacer` rule injecting `Authorization: Bearer ${TRENTO_JWT}`.

Nuclei then runs against the same target with `-sarif-export sarif/nuclei.sarif`.

### `.github/actions/publish-sarif` — local composite action

Inputs: `name`, `path`, `category`.

Responsibilities:

1. Exit cleanly when the file is absent. Nuclei writes no file when there are no findings.
2. Upload the file as a workflow artifact, unconditionally.
3. Upload to code scanning, only when the token permits it.

This is the single place where the report sink can change for all tools.

## Data flow

All tools write into a `sarif/` directory, created by each job before its scan step, since
the jobs are independent and no single job owns it. `publish-sarif` fans each file to two
sinks:

```
sobelow.sarif   ─┐
codeql-*.sarif   ├─→ publish-sarif ─┬─→ actions/upload-artifact  (always)
eslint.sarif     │                  └─→ upload-sarif             (when permitted)
osv.sarif        │
zap.sarif        │
nuclei.sarif    ─┘
```

### Categories

Code scanning keys results by `(ref, category)`. Two SARIF files uploaded under the same
category for one commit means the second replaces the first, showing only the last tool's
findings while the others appear clean. Each tool therefore gets a distinct category:
`sobelow`, `codeql-javascript`, `codeql-actions`, `eslint-security`, `osv`, `zap`,
`nuclei`.

### Sink guard

```
github.event_name != 'pull_request' ||
github.event.pull_request.head.repo.full_name == github.repository
```

This covers push, schedule and dispatch, which have no pull-request context, and same-repo
pull requests. Community pull requests from forks receive a read-only `GITHUB_TOKEN` and
fall through to artifact-only, rather than failing the run.

## Error handling

Report-only means findings do not block. It must not mean a broken tool goes unnoticed, so
`continue-on-error` is scoped per step rather than per job:

| Step class | Behaviour |
| --- | --- |
| checkout, setup, cache, `mix deps.get`, compose bring-up, `mix setup` | hard fail |
| the scan invocation | `continue-on-error: true` |
| `publish-sarif` | `if: always()` |

### DAST failure modes

The dangerous DAST failures are silent false negatives — the scan reports clean because it
never reached the application. These fail hard rather than reporting:

1. **Application never boots.** ZAP scans nothing and reports no findings. Mitigation: poll
   `/api/readyz` with a timeout before ZAP starts; fail the job if unreachable.
2. **JWT mint fails.** The scan degrades to unauthenticated, finds almost nothing, and stays
   green. Mitigation: assert the token is non-empty and that an authenticated
   `GET /api/hosts` returns 200 before handing the token to ZAP.
3. **Active scan hangs.** `timeout-minutes: 45` on the job.

Nuclei writing no file on zero findings is handled inside `publish-sarif`, not at each call
site.

## Baseline and ratchet

Report-only scanning fails when nobody looks at the results. The intended sequence:

1. The first run on `main` establishes the baseline in the Security tab.
2. Each finding is triaged to one of: a fix, a suppression (`# sobelow_skip`, a
   `.sobelow-conf` `ignore` entry, an ESLint disable comment with a reason), or a dismissed
   code-scanning alert with a stated reason.
3. Once a tool's backlog reaches zero, a follow-up pull request switches that single tool to
   blocking.

Ratcheting happens per tool, not all at once.

## Verification

Four tools are verifiable locally against the real repository, with no CI round-trip:

```
mix sobelow --format sarif --out /tmp/sobelow.sarif
osv-scanner scan source --lockfile mix.lock --lockfile assets/package-lock.json \
  --format sarif --output /tmp/osv.sarif
cd assets && npm run lint:security
npx @microsoft/sarif-multitool validate /tmp/*.sarif
```

SARIF validation matters on its own. A tool can emit SARIF that code scanning rejects; the
ZAP `Dev Build` version-string problem is exactly that class of failure.

The ZAP plan is testable locally against a running application:

```
docker run --network host zaproxy/zap-stable \
  zap.sh -cmd -autorun .github/zap/trento-api.yaml
```

Workflow YAML is checked locally with `actionlint`.

### CI verification, per pull request

A workflow's real behaviour only appears on GitHub, so each pull request in the stack is
checked for:

1. Every job runs, uploads an artifact, and appears as its own category in the Security tab.
2. Categories do not clobber each other: findings from multiple tools coexist on one commit.
3. Report-only holds: findings are present and checks are green.
4. A broken tool goes red. Temporarily point a scanner at an invalid path and confirm the
   job fails rather than passing silently.
5. For the DAST pull request only: trigger via `workflow_dispatch`, then add the `dast`
   label to the pull request and confirm the label path fires. Break the readiness gate and
   the JWT gate once each and confirm both fail the job.

## Delivery

Branch `security-scanning`, shipped as three sequential pull requests.

| PR | Contents |
| --- | --- |
| 1 | `security.yaml` skeleton, `permissions`, `publish-sarif` composite action, Sobelow (`mix.exs`, `.sobelow-conf`), OSV-Scanner, SPDX headers, `guides/Development/security-scanning.md` |
| 2 | CodeQL (`.github/codeql/config.yml`, two categories), ESLint security (`eslint.security.config.mjs`, three devDependencies, `lint:security` script) |
| 3 | `dast` job, `.github/zap/trento-api.yaml`, Nuclei, readiness and JWT gates, `dast` label |

PR 1 carries the shared scaffolding, so PRs 2 and 3 are each a configuration file plus a
job.

`guides/Development/security-scanning.md` documents how to run each scanner locally, how to
suppress a finding per tool, and where reports land. Without it a report-only rollout
becomes folklore.

## Follow-up work

Explicitly out of scope here:

- Triage the initial baseline and ratchet tools to blocking, one at a time.
- Schemathesis behind a JUnit-to-SARIF converter, if property-based API fuzzing is wanted.
- Container image scanning, to cover base-image OS CVEs.
- Secret scanning and GitHub Actions hardening.
