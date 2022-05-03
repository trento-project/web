# Hacking Trento

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
3. [NodeJS](https://www.nodejs.org/)
4. [Docker](https://docs.docker.com/get-docker/)
5. [Docker Compose](https://docs.docker.com/compose/install/)


## Development environment

The entire environment can be set up with [asdf](http://asdf-vm.com/).

After you installed the `asdf` CLI tool, you need to install all the relevant plugins, and then the requirements.

```shell
asdf plugin add erlang 
asdf plugin add elixir
asdf plugin add nodejs
asdf install
```

This will install local versions of all the above. Docker is 


## Docker and docker-compose

A `docker-compose` development environment is provided.

```shell
docker-compose up -d
```

It will start all the services required to run the application.

It also provides a `web` service that you can use to run Elixir within a development container.
This service does nothing by default (i.e. it invokes `bash` with no command), so you will need to attach to it explicitly via an interactive terminal, or run mix commands with it.

E.g. to start an interactive containerized terminal session:
```shell
docker-compose run -ti -p 4000:4000 web
```


## Mix tasks

There are many `mix` tasks. You can see them all with `mix help`.

The fastes way to get started is `mix start`, which expands to the following three sections.

### Install dependencies

```shell
mix install
```

> Note: this will take care of both Mix and NPM dependencies.

### Setup persistence

```shell
mix setup
```

### Start the web server in the repl

```shell
iex -S mix phx.server
```

> Note: all the mix commands can be executed either within or outside this container.


## Environment Variables

See [environment_variables](./environment_variables.md)


## Scenario loading with photofinish

By leveraging [photofinish](https://github.com/trento-project/photofinish) it is possible to load different scenarios for development and debugging purposes.

```shell
photofinish run --url "http://localhost:4000/api/collect" healthy-27-node-SAP-cluster
```
It's possible to use Photofinish' docker image too:

```shell
docker run -v "$PWD":/data --network host ghcr.io/trento-project/photofinish run healthy-27-node-SAP-cluster -u http://localhost:4000/api/collect
```

Several useful scenario fixtures are available in [./test/fixtures/scenarios](../../test/fixtures/scenarios/), the same ones used in e2e tests.

See also [.photofinish.toml](../../.photofinish.toml).
