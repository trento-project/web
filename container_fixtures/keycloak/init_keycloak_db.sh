#!/bin/bash
# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER keycloak WITH PASSWORD 'password';
	CREATE DATABASE keycloak;
	GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
	\c keycloak
	GRANT ALL ON SCHEMA public TO keycloak;
	\q
EOSQL
