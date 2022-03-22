# trento

An open cloud-native web console improving on the work day of SAP Applications administrators.

# Table of contents

- [Hack on the trento](#hack-on-the-trento)
  - [Install dependencies](#install-dependencies)
  - [Development environment](#development-environment)
  - [Setup trento](#setup-trento)
  - [Start trento in the repl](#start-trento-in-the-repl)
  - [Scenario loading with photofinish](#scenario-loading-with-photofinish)

# Hack on the trento

## Install dependencies

```
$> mix deps.get
```

## Development environment

A `docker-compose` development environment is provided.

```
$> docker-compose up -d
```

## Setup trento

```
$> mix setup
```

## Start trento in the repl

```
$> iex -S mix phx.server
```

## Scenario loading with photofinish

By leveraging [photofinish](https://github.com/trento-project/photofinish) it is possible to load different scenarios for development and debugging purposes.

```
$> photofinish run --url "http://localhost:4000/api/collect" healthy-27-node-SAP-cluster
```

Several useful scenario fixtures are available in [./test/fixtures/scenarios](./test/fixtures/scenarios/), the same ones used in e2e tests.

See also [.photofinish.toml](./.photofinish.toml).
