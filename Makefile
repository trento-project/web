.DEFAULT_GOAL := help
.SILENT:

## Colors
COLOR_RESET   = \033[0m
COLOR_INFO    = \033[32m
COLOR_COMMENT = \033[33m

## Help
help:
	printf "${COLOR_COMMENT}Usage:${COLOR_RESET}\n"
	printf "make ${COLOR_INFO}[target]${COLOR_RESET}\n\nIf no target was provided, ${COLOR_INFO}[help]${COLOR_RESET} is executed\n\n"
	printf "${COLOR_COMMENT}Available targets:${COLOR_RESET}\n"
	awk '/^[a-zA-Z\-\_0-9\.@]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf " ${COLOR_INFO}%-20s${COLOR_RESET} %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

.PHONY: start-infra
## Start dockerized infrastructure
start-infra:
	docker-compose up -d

.PHONY: setup-database
## Creates database and runs migrations
setup-database:
	mix ecto.create
	mix ecto.migrate

.PHONY: setup-eventstore
## Creates and initializes the eventstore
setup-eventstore:
	mix event_store.setup

setup-storage: setup-database setup-eventstore

.PHONY: install-deps
## Install dependencies
install-deps:
	mix deps.get

.PHONY: test
## Run tests
test:
	mix test

.PHONY: start
## Start Tronto
start: start-infra install-deps setup-storage
	mix phx.server