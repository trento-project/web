# tronto

A vaporware version of Trento - SUSE Console for SAP Applications

![tronto](https://user-images.githubusercontent.com/828651/144742801-88d49dcd-9d7d-4086-8d7e-b77db9a57de8.jpg)

# Table of contents

- [Hack on the tronto](#hack-on-the-tronto)
  - [Install dependencies](#install-dependencies)
  - [Development environment](#development-environment)
  - [Setup tronto](#setup-tronto)
  - [Start tronto in the repl](#start-tronto-in-the-repl)
  - [Scenario loading with photofinish](#scenario-loading-with-photofinish)

# Hack on the tronto

## Install dependencies

```
$> mix deps.get
```

## Development environment
A `docker-compose` development environment is provided.

```
$> docker-compose up -d
```

## Setup tronto

```
$> mix setup
```

## Start tronto in the repl

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