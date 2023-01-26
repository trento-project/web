# Hack on the Trento web

## Requirements

In order to run the Trento web application, you will need to have the following software installed on your system:

1. [Elixir](https://elixir-lang.org/) - a dynamic, functional language designed for building scalable and maintainable applications.
2. [Docker](https://docs.docker.com/get-docker/) - a platform for developing, shipping, and running applications in containers
3. [Docker Compose](https://docs.docker.com/compose/install/) - a tool for defining and running multi-container Docker applications.

Please note that you will also need to have Git installed on your computer to clone the Trento repository.

## Development environment

The Trento project provides a docker-compose development environment that you can use to start a Postgres database and a Grafana instance for storage and monitoring. To start the development environment, navigate to the root directory of the Trento project and run the following command:

```
docker-compose up -d
```

This will start the Postgres and Grafana containers in detached mode, so you can continue to use your terminal for other commands.

It will start a **postgres** database and a **grafana** instance, for storage and monitoring.

## Install dependencies

Before you can start the Trento application, you will need to install the Elixir dependencies. To do this, navigate to the root directory of the Trento project and run the following command:

```
mix deps.get
```

## Setup Trento

Once the dependencies are installed, you can set up the Trento application by running the following command:

```
mix setup
```

This command will set up the necessary database tables and seed data.

## Install the JavaScript frontend packages

The Trento application also requires some JavaScript packages to be installed for the frontend. To install these packages, run the following command:

```
npm --prefix ./assets/ install ./assets
```

## Start Trento in the REPL

Now that the application is set up and the frontend packages are installed, you can start the Trento application by running the following command:

```
iex -S mix phx.server
```

This command will start the Phoenix web server and open an Elixir REPL, where you can interact with the application and make changes to the code.

## Access the Trento web

Once the application is running, you can access the Trento web by navigating to http://localhost:4000 in your web browser.
The default port is 4000, but you can change it by modifying the config/dev.exs file.

## Login

When you first access the Trento web, you will be prompted to log in. The default login credentials are:

Username:

```
admin
```

Password:

```
adminpassword
```

## Environment Variables

The Trento application uses several environment variables to configure its behavior. You can find more information about these variables.

See [environment_variables](./environment_variables.md)

## Scenario loading with Photofinish

The Trento project includes a tool called [photofinish](https://github.com/trento-project/photofinish), which you can use to load different scenarios for development and debugging purposes.

```
photofinish run --url "http://localhost:4000/api/collect" healthy-27-node-SAP-cluster
```

It's possible to use Photofinish' docker image too:

```
docker run -v "$PWD":/data --network host ghcr.io/trento-project/photofinish run healthy-27-node-SAP-cluster -u http://localhost:4000/api/collect
```

Several useful scenario fixtures are available in [./test/fixtures/scenarios](https://github.com/trento-project/web/tree/main/test/fixtures/scenarios), the same ones used in e2e tests.

See also [.photofinish.toml](https://github.com/trento-project/web/blob/main/.photofinish.toml).

## Connect Trento web with [Wanda](https://github.com/trento-project/wanda)

In order to connect the Trento web with Wanda, you must first have a running Wanda server.
To install Wanda, please follow the instructions provided in the [hack_on_wanda documentation](https://github.com/trento-project/wanda/blob/update_documentation/guides/development/hack_on_wanda.md).
Once you have a running Wanda server, you can proceed to connect it with Trento web.

The next step is to restart the Trento web server with the following command:

```
WANDA_URL=http://localhost:4001 MIX_ENV=wanda iex -S mix phx.server
```

This command sets the WANDA_URL environment variable to the URL of the Wanda server, and starts the Trento server in the wanda environment.

It is important to note that the WANDA_URL variable must be set to the correct URL of the running Wanda server, otherwise the Trento web server will not be able to connect to it.
