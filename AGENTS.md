# Trento Web

Trento Web is the main component of Trento, an open source tool to monitor SAP landscapes.
It is an Elixir/Phoenix backend with a React single-page app in `assets/`. The backend uses
event sourcing with Commanded and EventStore on Postgres. It talks to wanda and the agents
over RabbitMQ. Coding standards live in the [docs repository](https://github.com/trento-project/docs).

## Commands

Start dependencies and the app:

```bash
docker compose up -d      # postgres (port 5433), rabbitmq, prometheus, checks
mix setup                 # deps, event store, database, seeds
mix start                 # deps, database, event store, phx.server (no seeds)
```

Checks that CI runs (all must pass before a PR):

```bash
mix format --check-formatted
mix credo
mix compile --warnings-as-errors
mix deps.unlock --check-unused
mix dialyzer
```

Backend tests (the `test` alias creates and migrates the test databases):

```bash
mix test
mix test test/path/to/file_test.exs
mix test test/path/to/file_test.exs:LINE
mix test --failed
```

Frontend, from `assets/`:

```bash
npm run lint
npm run format:check
npm test                  # jest, TZ=UTC
npm test -- js/path/to/dir # one directory or file
```

End-to-end tests are Cypress in `test/e2e/`. Run them only on request.

## Architecture map

- `lib/trento/<context>.ex` and `lib/trento/<context>/`: domain contexts, for example hosts,
  clusters, sap_systems and databases. Each context holds its aggregates, commands, events,
  projectors and process managers.
- `lib/trento/infrastructure/`: adapters to external systems (messaging, checks, AI, ...).
- `lib/trento_web/`: controllers with OpenApiSpex operations, channels, auth, the AI assistant.
- `assets/js/`: React app. `common/` components, `pages/`, `state/` (Redux and sagas), `lib/`.
- `test/support/`: case templates (`DataCase`, `ConnCase`, `ChannelCase`, ...) and `factory.ex`.

## Conventions

- Put a behaviour and a Mox mock at each boundary to an external system. Tests stub the
  mock, production config points at the real adapter.
- Every REST endpoint carries its OpenApiSpex operation on the controller.
- Match the comment density of the file you edit. The reason for a change goes in the
  commit message, not in a code comment.

## Testing

- If a test module is not `async: true`, the case templates start the SQL sandbox in shared
  mode. A process that a test spawns needs shared mode or an explicit allowance.
- Hundreds of sudden failures usually mean leftover rows in the test database, not a
  regression. To find the rows, run
  `docker compose exec postgres psql -U postgres -d trento_test -c "select relname, n_live_tup from pg_stat_user_tables where n_live_tup > 0"`.
  Reset with `MIX_ENV=test mix ecto.drop`, then `mix test`. Do not use `mix ecto.reset`
  for the test database: it loads seeds that CI never loads.
- A test you change must still be able to fail. Mutate the production code, see the test
  fail by name, restore. See the `proving-test-changes` skill.

## Pull requests

From `CONTRIBUTING.adoc`:

- One concern per PR. Aim for 100 to 500 added lines. Split bigger work.
- No new warnings. Tests pass.
- The commit body explains why the change exists.
- One approval is needed to merge.

## Boundaries

Ask first:

- Adding or upgrading a dependency.
- Adding a migration.
- Editing generated files (`priv/static/`, OpenAPI JSON output).
- Changing CI workflows in `.github/`.

Never:

- Commit secrets, API keys or customer data.
- Force-push a branch that someone else pushed to.
- Push to `main`.

## Skills

Generic process skills (test proof, debugging, narrow changes, agent supervision) live in
[trento-project/agent-skills](https://github.com/trento-project/agent-skills).

## Open team decisions

These are not settled. Do not treat either as a rule:

- Whether commits and PRs mention AI assistance.
- Whether agent plan and spec files get committed.
