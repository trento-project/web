# Hack on the trento

- [Requirements](#requirements)
- [Install dependencies](#install-dependencies)
- [Development environment](#development-environment)
- [Setup trento](#setup-trento)
- [Start trento in the repl](#start-trento-in-the-repl)
- [Environment Variables](#environment-variables)
- [Scenario loading with photofinish](#scenario-loading-with-photofinish)

## Requirements

In order to run the trento web, you need

1. [Elixir](https://elixir-lang.org/)
2. [Erlang OTP](https://www.erlang.org/)
3. [Docker](https://docs.docker.com/get-docker/)
4. [Docker Compose](https://docs.docker.com/compose/install/)

## Development environment

A `docker-compose` development environment is provided.

```
docker-compose up -d
```

It will start a **postgres** database and a **grafana** instance, for storage and monitoring.
## Install dependencies

```
mix deps.get
```

## Setup trento

```
mix setup
```

## Install the JavaScript frontend packages

```
npm --prefix ./assets/ install ./assets
```

## Start trento in the repl

```
iex -S mix phx.server
```

## Access the trento web 

Login page: [localhost:4000](http://localhost:4000)

**Hint**: Altering the default port requires changes in [config/dev.exs](https://github.com/trento-project/web/blob/main/config/dev.exs)

## Login 
Username:
```
admin
```
Password:
```
adminpassword
```

## Environment Variables

See [environment_variables](./environment_variables.md)

## Scenario loading with photofinish

By leveraging [photofinish](https://github.com/trento-project/photofinish) it is possible to load different scenarios for development and debugging purposes.

```
photofinish run --url "http://localhost:4000/api/collect" healthy-27-node-SAP-cluster
```
It's possible to use Photofinish' docker image too:

```
docker run -v "$PWD":/data --network host ghcr.io/trento-project/photofinish run healthy-27-node-SAP-cluster -u http://localhost:4000/api/collect
```

Several useful scenario fixtures are available in [./test/fixtures/scenarios](https://github.com/trento-project/web/tree/main/test/fixtures/scenarios), the same ones used in e2e tests.

See also [.photofinish.toml](https://github.com/trento-project/web/blob/main/.photofinish.toml).