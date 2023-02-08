# Hack on the Trento Web

## Requirements

In order to run the Trento Web application, you need to have the following software installed on your system:

1. [Elixir](https://elixir-lang.org/) - a dynamic, functional language designed for building scalable and maintainable applications.
2. [Docker](https://docs.docker.com/get-docker/) - a platform for developing, shipping, and running applications in containers
3. [Docker Compose](https://docs.docker.com/compose/install/) - a tool for defining and running multi-container Docker applications.

**Note** that you also need to have Git installed on your computer to clone the Trento repository.

## Development environment

The Trento project provides a docker-compose development environment that you can use to start a Postgres database and a Grafana instance for storage and monitoring. To start the development environment, navigate to the root directory of the Trento project and run the following command:

```
docker-compose up -d
```

This starts the Postgres and Grafana containers in detached mode, so you can continue to use your terminal for other commands.

It starts a **postgres** database and a **grafana** instance, for storage and monitoring.

## Setup Trento

Before starting Trento Web, some initial setup tasks are required. This can be achieved by running the following command:

```
mix setup
```

This command performs necessary tasks such as installing dependencies, creating the database schema and running migrations.

### Hint about Project setup

Gain a deeper understanding of how Trento Web is configured, reading the [mix.exs](https://github.com/trento-project/web/blob/main/mix.exs) file located in the root directory of the project. This file contains information on dependencies, configuration settings, and tasks that can be run using the Mix build tool, providing a complete picture of the project's setup.

## Connecting Trento Web to [Wanda](https://github.com/trento-project/wanda)

Wanda is a service that is responsible to orchestrate Checks for the Trento Web application. By default, Wanda can be accessed on port 4001. To connect Trento Web to Wanda, you need to create a .env file in the root path of Trento Web.

Create the file by running the following command in your terminal:

```
echo "WANDA_URL=http://localhost:4001" > assets/.env
```

**Guide** how to hack on [Wanda](https://github.com/trento-project/wanda/blob/main/guides/development/hack_on_wanda.md).

### Hint about the default port of Wanda

If the Wanda service is running on a different port, you need to change 4001 in the .env file to the correct port number.

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

This command start's the Phoenix web server and open an Elixir REPL, where you can interact with the application and make changes to the code.

## Access the Trento Web

Once the application is running, you can access the Trento Web by navigating to http://localhost:4000 in your web browser.
The default port is 4000, but you can change it by modifying the config/dev.exs file.

## Login

When you first access the Trento web, you need to log in.
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
