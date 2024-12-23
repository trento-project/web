# Hack on the Trento Web

## Requirements

In order to run the Trento Web application, the following software must be installed:

1. [Elixir](https://elixir-lang.org/) - 1.15.7 preferred
2. [Erlang OTP](https://www.erlang.org/) - 26.1.2 preferred
3. [Node.js](https://nodejs.org/en/) - 20.14.0 preferred
4. [Docker](https://docs.docker.com/get-docker/)
5. [Docker Compose](https://docs.docker.com/compose/install/)

### Additional requirements

Some platforms might not be able to use pre-built versions of some dependencies.
Therefore, some additional dependencies might be required. This does not effect
most users and can be referred to, when installation issues come up.
For these dependencies, the distro packaged version is usually sufficient.

1. [Python3](https://www.python.org/)
2. [setuptools](https://setuptools.pypa.io/en/latest/index.html)
3. [gcc](https://gcc.gnu.org/)
4. [pkg-config](https://www.freedesktop.org/wiki/Software/pkg-config/)

### Ensure Compatibility with asdf

[asdf](https://asdf-vm.com/guide/introduction.html) allows to use specific versions of programming language tools that are known to be compatible with the project, rather than relying on the version that's installed globally on the host system.

In order to use asdf, follow the official [asdf getting started guide](https://asdf-vm.com/guide/getting-started.html).

Install all required asdf plugins from [.tool-versions](/.tool-versions) inside the web repository.

```
cut -d' ' -f1 .tool-versions|xargs -i asdf plugin add  {}
```

Set up the asdf environment

```
asdf install
```

## Development environment

The Trento project provides a docker-compose development environment that is used to start a Postgres database and a prometheus instance for storage and monitoring. To start the development environment, navigate to the root directory of the Trento project and run the following command:

```
docker-compose up -d
```

## Setup Trento

Before starting Trento Web, some initial setup tasks, like installing dependencies and creating the database, are required.
Execute following command:

```
mix setup
```

## Connect Trento Web with [Wanda](https://github.com/trento-project/wanda)

By default, Wanda can be accessed on port 4001.

The wanda url is provided with the configuration parameter `:trento, :checks_service, :base_url`.


**Guide** how to set up [Wanda](https://github.com/trento-project/wanda/blob/main/guides/development/hack_on_wanda.md).

Note: If the Wanda service is running on a different port, change the default 4001 port in the .env file.

## Install the JavaScript frontend packages

Install frontend packages:

```
npm --prefix ./assets/ install ./assets
```

## Start Trento Web server in the REPL

Start Trento web:

```
iex -S mix phx.server
```

## Access the Trento Web

Access the Trento Web by navigating to http://localhost:4000 in the web browser.

## Login

The default login credentials are:

Username:

```
admin
```

Password:

```
adminpassword
```

## Environment Variables

The Trento application uses several environment variables to configure its behavior.
Information about these variables' [environment_variables](./environment_variables.md).

## Scenario loading with Photofinish

The Trento project includes a tool called [photofinish](https://github.com/trento-project/photofinish), which is used to load different scenarios for development and debugging purposes.

```
photofinish run --url "http://localhost:4000/api/collect" healthy-27-node-SAP-cluster
```

It's possible to use Photofinish' docker image too:

```
docker run -v "$PWD":/data --network host ghcr.io/trento-project/photofinish run healthy-27-node-SAP-cluster -u http://localhost:4000/api/collect
```

Several useful scenario fixtures are available in [./test/fixtures/scenarios](https://github.com/trento-project/web/tree/main/test/fixtures/scenarios), the same ones used in e2e tests.

See also [.photofinish.toml](https://github.com/trento-project/web/blob/main/.photofinish.toml).
